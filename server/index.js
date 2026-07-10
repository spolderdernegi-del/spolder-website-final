import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4173;
const DATABASE_URL = process.env.DATABASE_URL;
const SESSION_SECRET = process.env.SESSION_SECRET || "change_this_secret";
const isProduction = process.env.NODE_ENV === "production";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

const sanitizeTable = (table) => {
  if (!/^[a-zA-Z0-9_]+$/.test(table)) {
    throw new Error("Invalid table name");
  }
  return table;
};

const sanitizeField = (field) => {
  if (!/^[a-zA-Z0-9_]+$/.test(field)) {
    throw new Error("Invalid field name");
  }
  return field;
};

const parseOrExpression = (expression) => {
  const clauses = expression.split(",").map((part) => part.trim()).filter(Boolean);
  const conditions = [];
  const params = [];

  for (const clause of clauses) {
    const match = clause.match(/^([a-zA-Z0-9_]+)\.ilike\.%(.*)%$/i);
    if (!match) continue;
    const field = sanitizeField(match[1]);
    const value = match[2];
    conditions.push(`\"${field}\" ILIKE $${params.length + 1}`);
    params.push(`%${value}%`);
  }

  if (conditions.length === 0) {
    return { sql: "", params: [] };
  }

  return { sql: `(${conditions.join(" OR ")})`, params };
};

const buildWhereClause = (query) => {
  const conditions = [];
  const params = [];

  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("eq_")) {
      const field = sanitizeField(key.slice(3));
      conditions.push(`\"${field}\" = $${params.length + 1}`);
      params.push(value);
    }

    if (key.startsWith("in_")) {
      const field = sanitizeField(key.slice(3));
      const values = Array.isArray(value) ? value : String(value).split(",").filter(Boolean);
      if (values.length > 0) {
        const placeholders = values.map((_, index) => `$${params.length + index + 1}`);
        conditions.push(`\"${field}\" IN (${placeholders.join(",")})`);
        params.push(...values);
      }
    }
  }

  if (query.or) {
    const orResult = parseOrExpression(String(query.or));
    if (orResult.sql) {
      conditions.push(orResult.sql);
      params.push(...orResult.params);
    }
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
};

const safeSelect = (value) => {
  if (!value || value.trim() === "") {
    return "*";
  }
  const safe = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (item === "*") return item;
      if (!/^[a-zA-Z0-9_\s"\.]+$/.test(item)) {
        throw new Error("Invalid select clause");
      }
      return item;
    })
    .join(", ");
  return safe || "*";
};

const queryDatabase = async (queryText, params = []) => {
  const start = Date.now();
  const result = await pool.query(queryText, params);
  const duration = Date.now() - start;
  console.log(`Executed query (${duration}ms): ${queryText}`);
  return result;
};

const getAdminCredentials = async () => {
  const result = await queryDatabase(
    `SELECT key, value FROM settings WHERE key = ANY($1::text[])`,
    [["admin_email", "admin_password"]],
  );

  const settings = result.rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return {
    email: settings.admin_email || process.env.ADMIN_EMAIL || "admin@spolder.org",
    password: settings.admin_password || process.env.ADMIN_PASSWORD || "spolder2024",
  };
};

const createSessionToken = (payload) => jwt.sign(payload, SESSION_SECRET, { expiresIn: "8h" });

const verifySessionToken = (token) => {
  try {
    return jwt.verify(token, SESSION_SECRET);
  } catch (error) {
    return null;
  }
};

const handleRequestError = (res, error) => {
  console.error(error);
  return res.status(500).json({ error: { message: error.message || "Sunucu hatası" } });
};

app.get("/api/auth/session", (req, res) => {
  const token = req.cookies?.spolder_session;
  const payload = token ? verifySessionToken(token) : null;
  return res.json({ data: { session: payload ? { user: { email: payload.email } } : null }, error: null });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { message: "E-posta ve şifre gereklidir" } });
    }

    const admin = await getAdminCredentials();
    if (email !== admin.email || password !== admin.password) {
      return res.status(401).json({ error: { message: "E-posta veya şifre hatalı" } });
    }

    const token = createSessionToken({ email, role: "admin" });
    res.cookie("spolder_session", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 8 * 3600 * 1000,
    });

    return res.json({ data: { session: { user: { email } } }, error: null });
  } catch (error) {
    return handleRequestError(res, error);
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("spolder_session");
  return res.json({ data: { success: true }, error: null });
});

app.get("/api/db/:table", async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const select = safeSelect(req.query.select ? String(req.query.select) : "*");
    const { whereClause, params } = buildWhereClause(req.query);
    const orderField = req.query.order ? sanitizeField(String(req.query.order)) : null;
    const orderDirection = String(req.query.orderDirection || "asc").toUpperCase() === "DESC" ? "DESC" : "ASC";
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : null;

    if (req.query.head === "true" && String(req.query.count) === "exact") {
      const countQuery = `SELECT COUNT(*) AS count FROM \"${table}\" ${whereClause}`;
      const countResult = await queryDatabase(countQuery, params);
      return res.json({ data: [], count: Number(countResult.rows[0]?.count ?? 0), error: null });
    }

    let query = `SELECT ${select} FROM \"${table}\" ${whereClause}`;
    if (orderField) {
      query += ` ORDER BY \"${orderField}\" ${orderDirection}`;
    }
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const result = await queryDatabase(query, params);
    const rows = result.rows;
    if (req.query.single === "true") {
      return res.json({ data: rows[0] ?? null, error: null });
    }

    return res.json({ data: rows, error: null });
  } catch (error) {
    return handleRequestError(res, error);
  }
});

app.post("/api/db/:table", async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const payload = req.body;
    const entries = Array.isArray(payload) ? payload : [payload];
    if (entries.length === 0) {
      return res.status(400).json({ error: { message: "Eklenecek veri bulunamadı" } });
    }
    const columns = Object.keys(entries[0]).map(sanitizeField);
    const values = [];
    const placeholders = entries
      .map((item, rowIndex) => {
        return `(${columns.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(",")})`;
      })
      .join(",");
    for (const item of entries) {
      for (const column of columns) {
        values.push(item[column]);
      }
    }
    const query = `INSERT INTO \"${table}\" (${columns.map((col) => `\"${col}\"`).join(",")}) VALUES ${placeholders} RETURNING *`;
    const result = await queryDatabase(query, values);
    return res.json({ data: result.rows, error: null });
  } catch (error) {
    return handleRequestError(res, error);
  }
});

app.post("/api/db/:table/upsert", async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const onConflict = req.query.onConflict ? sanitizeField(String(req.query.onConflict)) : null;
    const payload = req.body;
    const entries = Array.isArray(payload) ? payload : [payload];
    if (!onConflict) {
      return res.status(400).json({ error: { message: "onConflict parametresi gereklidir" } });
    }
    if (entries.length === 0) {
      return res.status(400).json({ error: { message: "Eklenecek veri bulunamadı" } });
    }
    const columns = Object.keys(entries[0]).map(sanitizeField);
    const values = [];
    const placeholders = entries
      .map((item, rowIndex) => {
        return `(${columns.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(",")})`;
      })
      .join(",");
    for (const item of entries) {
      for (const column of columns) {
        values.push(item[column]);
      }
    }
    const updates = columns.map((col) => `\"${col}\" = EXCLUDED.\"${col}\"`).join(", ");
    const query = `INSERT INTO \"${table}\" (${columns.map((col) => `\"${col}\"`).join(",")}) VALUES ${placeholders} ON CONFLICT (\"${onConflict}\") DO UPDATE SET ${updates} RETURNING *`;
    const result = await queryDatabase(query, values);
    return res.json({ data: result.rows, error: null });
  } catch (error) {
    return handleRequestError(res, error);
  }
});

app.put("/api/db/:table/:id", async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const id = req.params.id;
    const payload = req.body;
    const columns = Object.keys(payload).map(sanitizeField);
    if (columns.length === 0) {
      return res.status(400).json({ error: { message: "Güncellenecek veri bulunamadı" } });
    }
    const setClause = columns.map((column, index) => `\"${column}\" = $${index + 1}`).join(", ");
    const values = columns.map((column) => payload[column]);
    values.push(id);
    const query = `UPDATE \"${table}\" SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    const result = await queryDatabase(query, values);
    return res.json({ data: result.rows, error: null });
  } catch (error) {
    return handleRequestError(res, error);
  }
});

app.delete("/api/db/:table/:id", async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const id = req.params.id;
    const query = `DELETE FROM \"${table}\" WHERE id = $1 RETURNING *`;
    const result = await queryDatabase(query, [id]);
    return res.json({ data: result.rows, error: null });
  } catch (error) {
    return handleRequestError(res, error);
  }
});

app.delete("/api/db/:table", async (req, res) => {
  try {
    const table = sanitizeTable(req.params.table);
    const { whereClause, params } = buildWhereClause(req.query);
    if (!whereClause) {
      return res.status(400).json({ error: { message: "Silme işlemi için filtre gereklidir" } });
    }
    const query = `DELETE FROM \"${table}\" ${whereClause} RETURNING *`;
    const result = await queryDatabase(query, params);
    return res.json({ data: result.rows, error: null });
  } catch (error) {
    return handleRequestError(res, error);
  }
});

app.use(express.static(path.join(__dirname, "..", "dist")));
app.get("/*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: { message: "API endpoint bulunamadı" } });
  }
  return res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Railway backend listening on port ${PORT}`);
});
