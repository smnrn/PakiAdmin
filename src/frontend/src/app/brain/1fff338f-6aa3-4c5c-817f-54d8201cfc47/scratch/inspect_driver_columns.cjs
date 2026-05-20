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

const supabase = createClient(url, key);

async function inspect() {
  const queries = [
    { schema: 'driver', table: 'driver_jobs' },
    { schema: 'driver', table: 'driver_earnings' }
  ];

  for (const q of queries) {
    const { data, error } = await supabase.schema(q.schema).from(q.table).select('*').limit(1);
    if (error) {
      console.error(`Error ${q.schema}.${q.table}:`, error.message);
    } else {
      console.log(`Keys in ${q.schema}.${q.table}:`, Object.keys(data[0] || {}));
      console.log(`Row in ${q.schema}.${q.table}:`, data[0]);
    }
  }
}

inspect();
