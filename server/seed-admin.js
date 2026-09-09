import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, NODE_ENV } = process.env;

if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin user");
}
if (ADMIN_PASSWORD.length < 10) {
  throw new Error("ADMIN_PASSWORD is too short - use at least 10 characters");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const run = async () => {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await pool.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
    [ADMIN_EMAIL.toLowerCase().trim(), hash],
  );
  console.log(`Admin user ready: ${ADMIN_EMAIL}`);
  await pool.end();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

