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

const queries = [
  { schema: 'driver', table: 'profiles' },
  { schema: 'driver', table: 'applications' },
  { schema: 'driver', table: 'business_applications' },
  { schema: 'routing', table: 'drop_off_operators' },
  { schema: 'routing', table: 'operator_applications' },
  { schema: 'parcel', table: 'driver_jobs' },
  { schema: 'parcel', table: 'lost_parcel_cases' }
];

async function test() {
  for (const q of queries) {
    const { error } = await supabase.schema(q.schema).from(q.table).select('*').limit(1);
    if (error) {
      console.log(`❌ ${q.schema}.${q.table} failed:`, error.message);
    } else {
      console.log(`✅ ${q.schema}.${q.table} succeeded!`);
    }
  }
}

test();
