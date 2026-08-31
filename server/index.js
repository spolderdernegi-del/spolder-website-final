import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const PORT = process.env.PORT || 4173;
const DATABASE_URL = process.env.DATABASE_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;
const isProduction = process.env.NODE_ENV === "production";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// --- Hard requirements: refuse to boot in an insecure state -----------------
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET environment variable is required and must be at least 32 characters (generate with: openssl rand -base64 48)",
  );
}
if (isProduction && ALLOWED_ORIGINS.length === 0) {
  throw new Error("ALLOWED_ORIGINS environment variable is required in production");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// --- Tables the generic /api/db endpoints are allowed to touch --------------
// Anything not in this list is rejected outright - no arbitrary table access.
const PUBLIC_READ_TABLES = new Set([
  "categories",
  "board",
  "bank_info",
  "events",
  "news",
  "blog",
  "projects",
  "files",
  "settings",
]);
// contact_messages: public can INSERT (the contact form) but not read/delete.
const INSERT_ONLY_PUBLIC_TABLE = "contact_messages";
const ALL_TABLES = new Set([...PUBLIC_READ_TABLES, INSERT_ONLY_PUBLIC_TABLE]);

// settings is a mixed table: some keys (contact info, IBAN, map embed) are
// meant to be shown on the public site, but others (e.g. an admin display
// email, if one is ever stored there) are not meant for anyone to read.
// Rather than trust every row in the table, an unauthenticated request only
// ever gets back rows whose key is explicitly on this list - no exceptions,
// regardless of what select/where the caller asks for.
const PUBLIC_SETTINGS_KEYS = new Set([
  "contact_phone",
  "contact_email",
  "contact_working_hours",
  "contact_iban_tl",
  "contact_iban_eur",
  "contact_map_embed",
  "organization_location",
  "organization_lat",
  "organization_lng",
]);

app.set("trust proxy", 1); // behind Nginx

// Real Let's Encrypt SSL is live (see nginx config), so the browser should be
// told to always use HTTPS for this origin (HSTS) and to upgrade any
// accidental http: subresource reference automatically - both are part of
// helmet's secure defaults and are kept as-is.
//
// img-src is widened from helmet's default ('self' data:) to also allow
// https: — the site legitimately loads images from outside its own origin
// (an Unsplash stock photo on the homepage, OpenStreetMap map tiles and
// Leaflet's marker icons on the contact-page map). Without this, the
// browser silently blocks those images.
const cspDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();
cspDirectives["img-src"] = ["'self'", "data:", "https:"];
app.use(
  helmet({
    contentSecurityPolicy: { directives: cspDirectives },
    hsts: { maxAge: 15552000, includeSubDomains: true },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests (no Origin header, e.g. curl/health checks) are fine.
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin." } },
});
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// --- SQL identifier helpers (never interpolate untrusted strings otherwise) -
const sanitizeTable = (table) => {
  if (!ALL_TABLES.has(table)) {
    throw new HttpError(400, "Invalid table name");
  }
  return table;
};

const sanitizeField = (field) => {
  if (!/^[a-zA-Z0-9_]+$/.test(field)) {
    throw new HttpError(400, "Invalid field name");
  }
  return field;
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const parseOrExpression = (expression, startIndex = 0) => {
  const clauses = expression.split(",").map((part) => part.trim()).filter(Boolean);
  const conditions = [];
  const params = [];

  for (const clause of clauses) {
    const match = clause.match(/^([a-zA-Z0-9_]+)\.ilike\.%(.+)%$/i);
    if (!match) continue;
    const field = sanitizeField(match[1]);
    const value = match[2];
    conditions.push(`"${field}" ILIKE $${params.length + startIndex + 1}`);
    params.push(`%${value}%`);
  }

  if (conditions.length === 0) return { sql: "", params: [] };
  return { sql: `(${conditions.join(" OR ")})`, params };
};

// Supported query-string filters (mirrors just enough of PostgREST/supabase-js
// to drive our own frontend's query builder shim):
//   eq_<field>=value        -> "field" = value
//   neq_<field>=value       -> "field" != value
//   in_<field>=a,b,c        -> "field" IN (a,b,c)
//   not_is_<field>=null     -> "field" IS NOT NULL
//   not_eq_<field>=value    -> "field" != value  (kept distinct from neq_ for readability)
//   or=col.ilike.%x%,col2.ilike.%y%
const buildWhereClause = (query) => {
  const conditions = [];
  const params = [];

  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("eq_")) {
      const field = sanitizeField(key.slice(3));
      conditions.push(`"${field}" = $${params.length + 1}`);
      params.push(value);
    }
    if (key.startsWith("neq_")) {
      const field = sanitizeField(key.slice(4));
      conditions.push(`"${field}" != $${params.length + 1}`);
      params.push(value);
    }
    if (key.startsWith("in_")) {
      const field = sanitizeField(key.slice(3));
      const values = Array.isArray(value) ? value : String(value).split(",").filter(Boolean);
      if (values.length > 0) {
        const placeholders = values.map((_, index) => `$${params.length + index + 1}`);
        conditions.push(`"${field}" IN (${placeholders.join(",")})`);
        params.push(...values);
      }
    }
    if (key.startsWith("not_is_")) {
      const field = sanitizeField(key.slice(7));
      // Only "null" is meaningful for an IS NOT check here.
      if (String(value).toLowerCase() === "null") {
        conditions.push(`"${field}" IS NOT NULL`);
      }
    }
    if (key.startsWith("not_eq_")) {
      const field = sanitizeField(key.slice(7));
      conditions.push(`"${field}" != $${params.length + 1}`);
      params.push(value);
    }
  }

  if (query.or) {
    const orResult = parseOrExpression(String(query.or), params.length);
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
  if (!value || value.trim() === "") return "*";
  const safe = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (item === "*") return item;
      // PostgREST/supabase-js column aliasing: "alias:column" -> "column" AS "alias"
      const aliasMatch = item.match(/^([a-zA-Z0-9_]+):"?([a-zA-Z0-9_]+)"?$/);
      if (aliasMatch) {
        const alias = sanitizeField(aliasMatch[1]);
        const column = sanitizeField(aliasMatch[2]);
        return `"${column}" AS "${alias}"`;
      }
      if (!/^[a-zA-Z0-9_\s".]+$/.test(item)) throw new HttpError(400, "Invalid select clause");
      return item;
    })
    .join(", ");
  return safe || "*";
};

const queryDatabase = async (queryText, params = []) => {
  const start = Date.now();
  const result = await pool.query(queryText, params);
  if (!isProduction) console.log(`Executed (${Date.now() - start}ms): ${queryText}`);
  return result;
};

// --- Auth --------------------------------------------------------------
const createSessionToken = (payload) => jwt.sign(payload, SESSION_SECRET, { expiresIn: "8h" });

const verifySessionToken = (token) => {
  try {
    return jwt.verify(token, SESSION_SECRET);
  } catch {
    return null;
  }
};

const getSessionFromRequest = (req) => {
  const token = req.cookies?.spolder_session;
  return token ? verifySessionToken(token) : null;
};

// Blocks the request unless a valid admin session cookie is present.
const requireAdmin = (req, res, next) => {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return res.status(401).json({ error: { message: "Yetkiniz yok, lütfen giriş yapın" } });
  }
  req.session = session;
  return next();
};

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/auth/session", (req, res) => {
  const session = getSessionFromRequest(req);
  return res.json({ data: { session: session ? { user: { email: session.email } } : null }, error: null });
});

app.post(
  "/api/auth/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      throw new HttpError(400, "E-posta ve şifre gereklidir");
    }

    const result = await queryDatabase(
      `SELECT email, password_hash FROM admin_users WHERE email = $1`,
      [String(email).toLowerCase().trim()],
    );
    const admin = result.rows[0];

    // Compare against a dummy hash when the user doesn't exist, so response
    // timing doesn't reveal whether the email is registered.
    const hashToCheck = admin?.password_hash || "$2a$12$invalidsaltinvalidsaltinvalidsaltinvalidsal";
    const passwordMatches = await bcrypt.compare(String(password), hashToCheck);

    if (!admin || !passwordMatches) {
      return res.status(401).json({ error: { message: "E-posta veya şifre hatalı" } });
    }

    const token = createSessionToken({ email: admin.email, role: "admin" });
    res.cookie("spolder_session", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 8 * 3600 * 1000,
    });
    return res.json({ data: { session: { user: { email: admin.email } } }, error: null });
  }),
);

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("spolder_session");
  return res.json({ data: { success: true }, error: null });
});

// Lets a logged-in admin change their own password. Requires the current
// password so a hijacked session can't silently lock the real admin out.
app.post(
  "/api/auth/change-password",
  authLimiter,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      throw new HttpError(400, "Mevcut ve yeni şifre gereklidir");
    }
    if (String(newPassword).length < 8) {
      throw new HttpError(400, "Yeni şifre en az 8 karakter olmalıdır");
    }

    const result = await queryDatabase(
      `SELECT email, password_hash FROM admin_users WHERE email = $1`,
      [req.session.email],
    );
    const admin = result.rows[0];
    if (!admin) {
      throw new HttpError(404, "Kullanıcı bulunamadı");
    }

    const passwordMatches = await bcrypt.compare(String(currentPassword), admin.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: { message: "Mevcut şifre yanlış" } });
    }

    const newHash = await bcrypt.hash(String(newPassword), 12);
    await queryDatabase(`UPDATE admin_users SET password_hash = $1 WHERE email = $2`, [newHash, admin.email]);

    return res.json({ data: { success: true }, error: null });
  }),
);

// --- Generic table endpoints ---------------------------------------------
// GET is always public (matches the old "read: true for anyone" RLS policy),
// except contact_messages which is admin-only to read.
app.get(
  "/api/db/:table",
  asyncHandler(async (req, res) => {
    const table = sanitizeTable(req.params.table);
    if (table === INSERT_ONLY_PUBLIC_TABLE) {
      const session = getSessionFromRequest(req);
      if (!session || session.role !== "admin") {
        throw new HttpError(401, "Yetkiniz yok, lütfen giriş yapın");
      }
    }

    const select = safeSelect(req.query.select ? String(req.query.select) : "*");
    let { whereClause, params } = buildWhereClause(req.query);
    const orderField = req.query.order ? sanitizeField(String(req.query.order)) : null;
    const orderDirection = String(req.query.orderDirection || "asc").toUpperCase() === "DESC" ? "DESC" : "ASC";
    const limit = req.query.limit ? Math.min(parseInt(String(req.query.limit), 10) || 0, 1000) : null;

    // settings holds a mix of public site content (contact info, IBAN, map
    // embed) and admin-only display values. An unauthenticated caller never
    // sees a row outside PUBLIC_SETTINGS_KEYS, no matter what select/where it
    // asked for - this is enforced here, not left to the frontend to respect.
    if (table === "settings") {
      const session = getSessionFromRequest(req);
      if (!session || session.role !== "admin") {
        const allowedKeys = [...PUBLIC_SETTINGS_KEYS];
        const placeholder = `$${params.length + 1}`;
        whereClause = whereClause
          ? `${whereClause} AND "key" = ANY(${placeholder})`
          : `WHERE "key" = ANY(${placeholder})`;
        params = [...params, allowedKeys];
      }
    }

    if (req.query.head === "true" && String(req.query.count) === "exact") {
      const countResult = await queryDatabase(`SELECT COUNT(*) AS count FROM "${table}" ${whereClause}`, params);
      return res.json({ data: [], count: Number(countResult.rows[0]?.count ?? 0), error: null });
    }

    let query = `SELECT ${select} FROM "${table}" ${whereClause}`;
    if (orderField) query += ` ORDER BY "${orderField}" ${orderDirection}`;
    if (limit) query += ` LIMIT ${limit}`;

    const result = await queryDatabase(query, params);
    if (req.query.single === "true") {
      return res.json({ data: result.rows[0] ?? null, error: null });
    }
    return res.json({ data: result.rows, error: null });
  }),
);

// Everything below mutates data. contact_messages allows public INSERT only;
// every other write requires an admin session.
const gateWrite = (req, res, next) => {
  const table = req.params.table;
  if (table === INSERT_ONLY_PUBLIC_TABLE && req.method === "POST" && !req.path.endsWith("/upsert")) {
    return next(); // public contact-form submission
  }
  return requireAdmin(req, res, next);
};

app.post(
  "/api/db/:table",
  writeLimiter,
  gateWrite,
  asyncHandler(async (req, res) => {
    const table = sanitizeTable(req.params.table);
    const payload = req.body;
    const entries = Array.isArray(payload) ? payload : [payload];
    if (entries.length === 0 || !entries[0] || typeof entries[0] !== "object") {
      throw new HttpError(400, "Eklenecek veri bulunamadı");
    }
    const columns = Object.keys(entries[0]).map(sanitizeField);
    const values = [];
    const placeholders = entries
      .map((item, rowIndex) =>
        `(${columns.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(",")})`,
      )
      .join(",");
    for (const item of entries) {
      for (const column of columns) values.push(item[column]);
    }
    const query = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(",")}) VALUES ${placeholders} RETURNING *`;
    const result = await queryDatabase(query, values);
    return res.json({ data: result.rows, error: null });
  }),
);

app.post(
  "/api/db/:table/upsert",
  writeLimiter,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const table = sanitizeTable(req.params.table);
    const onConflict = req.query.onConflict ? sanitizeField(String(req.query.onConflict)) : null;
    const payload = req.body;
    const entries = Array.isArray(payload) ? payload : [payload];
    if (!onConflict) throw new HttpError(400, "onConflict parametresi gereklidir");
    if (entries.length === 0) throw new HttpError(400, "Eklenecek veri bulunamadı");

    const columns = Object.keys(entries[0]).map(sanitizeField);
    const values = [];
    const placeholders = entries
      .map((item, rowIndex) =>
        `(${columns.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(",")})`,
      )
      .join(",");
    for (const item of entries) {
      for (const column of columns) values.push(item[column]);
    }
    const updates = columns.map((col) => `"${col}" = EXCLUDED."${col}"`).join(", ");
    const query = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(",")}) VALUES ${placeholders} ON CONFLICT ("${onConflict}") DO UPDATE SET ${updates} RETURNING *`;
    const result = await queryDatabase(query, values);
    return res.json({ data: result.rows, error: null });
  }),
);

app.put(
  "/api/db/:table/:id",
  writeLimiter,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const table = sanitizeTable(req.params.table);
    const id = req.params.id;
    const payload = req.body;
    const columns = Object.keys(payload || {}).map(sanitizeField);
    if (columns.length === 0) throw new HttpError(400, "Güncellenecek veri bulunamadı");
    const setClause = columns.map((column, index) => `"${column}" = $${index + 1}`).join(", ");
    const values = columns.map((column) => payload[column]);
    values.push(id);
    const query = `UPDATE "${table}" SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    const result = await queryDatabase(query, values);
    return res.json({ data: result.rows, error: null });
  }),
);

app.delete(
  "/api/db/:table/:id",
  writeLimiter,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const table = sanitizeTable(req.params.table);
    const result = await queryDatabase(`DELETE FROM "${table}" WHERE id = $1 RETURNING *`, [req.params.id]);
    return res.json({ data: result.rows, error: null });
  }),
);

app.delete(
  "/api/db/:table",
  writeLimiter,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const table = sanitizeTable(req.params.table);
    const { whereClause, params } = buildWhereClause(req.query);
    if (!whereClause) throw new HttpError(400, "Silme işlemi için filtre gereklidir");
    const result = await queryDatabase(`DELETE FROM "${table}" ${whereClause} RETURNING *`, params);
    return res.json({ data: result.rows, error: null });
  }),
);

// --- Static frontend (dist/) + SPA fallback --------------------------------
app.use(express.static(path.join(__dirname, "..", "dist")));
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// --- Error handler (must be last) ------------------------------------------
app.use((err, req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message } });
  }
  console.error(err);
  return res.status(500).json({ error: { message: "Sunucu hatası" } });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`SPOLDER backend listening on 127.0.0.1:${PORT}`);
});
