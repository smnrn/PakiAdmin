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
  const tables = ['profiles', 'driver_jobs', 'drop_off_points', 'users'];
  for (const table of tables) {
    console.log(`\n=== COLUMNS FOR TABLE: ${table} ===`);
    const res = await c.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
    `, [table]);
    res.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
  }
  await c.end();
}

main().catch(console.error);
