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
  const { data, error } = await supabase.schema('parcel').from('parcel_drafts').select('*').limit(1);
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Keys in parcel_drafts:", Object.keys(data[0] || {}));
    console.log("Row:", data[0]);
  }
}

inspect();
