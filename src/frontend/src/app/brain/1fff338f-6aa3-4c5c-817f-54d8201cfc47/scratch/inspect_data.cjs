const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPaths = [
  'c:\\Users\\Jed\\Pakiadmincopy\\.env.local',
  'c:\\Users\\Jed\\Pakiadmincopy\\src\\frontend\\.env.local'
];

let key = '';
let url = '';

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        key = line.split('=')[1].trim();
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        url = line.split('=')[1].trim();
      }
    }
    if (key && url) break;
  }
}

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
    const { data, error } = await supabase.schema(q.schema).from(q.table).select('*').limit(3);
    if (error) {
      console.error(`Error querying ${q.schema}.${q.table}:`, error.message);
    } else {
      console.log(data);
    }
  }
}

inspect();
