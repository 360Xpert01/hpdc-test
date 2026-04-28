import pg from 'pg';
import 'dotenv/config';

async function listUsers() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT clerk_id, email, role FROM users LIMIT 20');
    console.log("Users in DB:");
    console.table(res.rows);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

listUsers();
