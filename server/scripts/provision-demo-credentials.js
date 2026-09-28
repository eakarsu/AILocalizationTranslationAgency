require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function main() {
  const email = String(process.env.DEMO_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.DEMO_PASSWORD || '');
  if (!email || !email.includes('@') || password.length < 12 || password.length > 72) {
    throw new Error('Complete local demo credentials are required');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Runtime Administrator', $1, $2, 'admin')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
      [email, passwordHash],
    );
    console.log('Local demo identity is ready.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
