// Delete overriding env variables
delete process.env.PGUSER;
delete process.env.PGPASSWORD;
delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const c = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.rregfrhtlmfktliijzpd',
  password: 'pakiapps_supabase_password',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await c.connect();
  console.log("Connected to DB successfully!");
  const sqlPath = path.join(__dirname, '../../../scripts/pakiship_bi_views.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log("Reading SQL file from: " + sqlPath);
  
  // Execute the entire SQL script
  await c.query(sql);
  console.log("SQL script executed successfully!");
  await c.end();
}

main().catch(console.error);
