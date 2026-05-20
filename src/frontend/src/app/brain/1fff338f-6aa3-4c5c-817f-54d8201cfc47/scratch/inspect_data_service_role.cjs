const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = 'c:\\Users\\Jed\\Pakiadmincopy\\src\\backend\\.env';
let key = '';
let url = '';

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      key = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_URL=')) {
      url = line.split('=')[1].trim();
    }
  }
}

console.log("URL:", url);
console.log("Key length:", key ? key.length : 0);

const supabase = createClient(url, key);

async function inspect() {
  const queries = [
    { schema: 'driver', table: 'driver_profiles' },
    { schema: 'driver', table: 'driver_jobs' },
    { schema: 'routing', table: 'operator_hubs' },
    { schema: 'parcel', table: 'parcel_drafts' }
  ];

  for (const q of queries) {
    console.log(`\n--- Data for ${q.schema}.${q.table} ---`);
    const { data, error } = await supabase.schema(q.schema).from(q.table).select('*').limit(2);
    if (error) {
      console.error(`Error querying ${q.schema}.${q.table}:`, error.message);
    } else {
      console.log(`Successfully fetched ${data ? data.length : 0} rows.`);
      console.log(data);
    }
  }
}

inspect();
