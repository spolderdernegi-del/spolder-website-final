// Emergency admin password reset — for when nobody can log in to run the
// in-panel "Şifre Değiştir" form (which requires knowing the current
// password). Run directly on the server, where only someone with SSH
// access to the VPS can reach it:
//
//   cd /var/www/spolder/server        (server/.env is read from the current directory)
//   node reset-password.js admin@spolder.org YeniGucluSifre123
//
// This is an out-of-band override for someone who already has
// infrastructure-level access, not a self-service "forgot password" e-mail
// flow. Existing admin sessions are signed out within about a minute
// (the running server notices the changed password hash).
// Note: the password is visible in the shell history / process list; clear
// the history afterwards.
import "dotenv/config";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error("Kullanım: node server/reset-password.js <email> <yeni-sifre>");
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error("Yeni şifre en az 8 karakter olmalı.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" && process.env.DATABASE_SSL !== "false" ? { rejectUnauthorized: false } : false,
});

const run = async () => {
  const hash = await bcrypt.hash(newPassword, 12);
  const result = await pool.query(
    `UPDATE admin_users SET password_hash = $1 WHERE email = $2 RETURNING email`,
    [hash, String(email).toLowerCase().trim()],
  );
  if (result.rowCount === 0) {
    console.error(`"${email}" adresine sahip bir admin bulunamadı.`);
    process.exitCode = 1;
  } else {
    console.log(`"${email}" için şifre başarıyla güncellendi.`);
  }
  await pool.end();
};

run().catch((err) => {
  console.error("Hata:", err.message);
  process.exitCode = 1;
});

