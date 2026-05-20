const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Try to find .env.local
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

console.log("Using URL:", url);

const supabase = createClient(url, key);

async function test() {
  console.log("Testing Driver Applications...");
  const { data: driverData, error: driverError } = await supabase
    .schema('driver')
    .from('applications')
    .select('*')
    .limit(1);
  console.log("Driver error:", driverError);
  console.log("Driver data:", driverData);

  console.log("\nTesting Business Applications...");
  const { data: bizData, error: bizError } = await supabase
    .schema('driver')
    .from('business_applications')
    .select('*')
    .limit(1);
  console.log("Business error:", bizError);
  console.log("Business data:", bizData);

  console.log("\nTesting Operator Applications...");
  const { data: opData, error: opError } = await supabase
    .schema('routing')
    .from('operator_applications')
    .select('*')
    .limit(1);
  console.log("Operator error:", opError);
  console.log("Operator data:", opData);
}

test();
