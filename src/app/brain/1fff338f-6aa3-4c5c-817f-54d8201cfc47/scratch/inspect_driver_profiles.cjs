const https = require('https');
const fs = require('fs');

const envPaths = [
  'c:\\Users\\Jed\\Pakiadmincopy\\src\\backend\\.env',
  'c:\\Users\\Jed\\Pakiadmincopy\\.env.local',
  'c:\\Users\\Jed\\Pakiadmincopy\\src\\frontend\\.env.local'
];

let key = '';
let url = '';

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        key = line.split('=')[1].trim();
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=') || line.startsWith('SUPABASE_URL=')) {
        url = line.split('=')[1].trim();
      }
    }
  }
}

function getOpenAPI(schema) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.replace('https://', ''),
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Accept-Profile': schema
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    req.end();
  });
}

async function test() {
  try {
    const spec = await getOpenAPI('driver');
    if (spec && spec.definitions) {
      console.log("driver_profiles fields:", spec.definitions['driver_profiles']?.properties);
      console.log("\nprofiles fields:", spec.definitions['profiles']?.properties);
    } else {
      console.log("No definitions found");
    }
  } catch (e) {
    console.error(e);
  }
}

test();
