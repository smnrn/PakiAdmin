const { Client } = require('pg');
const c = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.rregfrhtlmfktliijzpd',
  password: 'pakiapps_supabase_password',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await c.connect();
  console.log("Connected to DB.");

  // Get all schemas
  const schemasRes = await c.query(`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
  `);
  console.log("\n=== ALL SCHEMAS ===");
  console.log(schemasRes.rows.map(r => r.schema_name));

  // Get all tables and their schemas
  const tablesRes = await c.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  `);
  console.log("\n=== ALL TABLES ===");
  const schemaMap = {};
  tablesRes.rows.forEach(row => {
    if (!schemaMap[row.table_schema]) {
      schemaMap[row.table_schema] = [];
    }
    schemaMap[row.table_schema].push(row.table_name);
  });
  console.log(JSON.stringify(schemaMap, null, 2));

  await c.end();
}

main().catch(console.error);
