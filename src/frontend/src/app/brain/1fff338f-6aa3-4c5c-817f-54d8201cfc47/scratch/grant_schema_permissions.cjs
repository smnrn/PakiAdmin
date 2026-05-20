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

  const queries = [
    // driver schema
    "GRANT USAGE ON SCHEMA driver TO anon, authenticated, service_role;",
    "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA driver TO anon, authenticated, service_role;",
    "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA driver TO anon, authenticated, service_role;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA driver GRANT ALL ON TABLES TO anon, authenticated, service_role;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA driver GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;",

    // routing schema
    "GRANT USAGE ON SCHEMA routing TO anon, authenticated, service_role;",
    "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA routing TO anon, authenticated, service_role;",
    "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA routing TO anon, authenticated, service_role;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA routing GRANT ALL ON TABLES TO anon, authenticated, service_role;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA routing GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;",

    // parcel schema
    "GRANT USAGE ON SCHEMA parcel TO anon, authenticated, service_role;",
    "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA parcel TO anon, authenticated, service_role;",
    "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA parcel TO anon, authenticated, service_role;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA parcel GRANT ALL ON TABLES TO anon, authenticated, service_role;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA parcel GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;"
  ];

  for (const query of queries) {
    console.log(`Executing: ${query}`);
    await c.query(query);
  }

  console.log("Permissions granted successfully!");
  await c.end();
}

main().catch(console.error);
