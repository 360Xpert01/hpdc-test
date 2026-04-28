const pg = require('pg');
require('dotenv').config();

async function check() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
  });

  try {
    await client.connect();
    const res = await client.query("SELECT clerk_id, email FROM users WHERE role = 'company' LIMIT 10");
    console.log("Valid Company Users in DB:");
    console.table(res.rows);
  } catch (err) {
    console.error("Query failed:", err.message);
  } finally {
    await client.end();
  }
}

check();
