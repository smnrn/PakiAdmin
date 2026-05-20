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

async function getSpecs() {
  const schemas = ['driver', 'routing', 'parcel'];
  for (const schema of schemas) {
    console.log(`\n================ SCHEMA: ${schema} ================`);
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Accept-Profile': schema
        }
      });
      const spec = await res.json();
      if (spec && spec.definitions) {
        for (const [tableName, definition] of Object.entries(spec.definitions)) {
          console.log(`Table: ${tableName}`);
          if (definition.properties) {
            for (const [colName, colProp] of Object.entries(definition.properties)) {
              console.log(`   - ${colName}: ${colProp.type} (${colProp.format || 'no-format'})`);
            }
          }
        }
      } else {
        console.log("No definitions found.");
      }
    } catch (e) {
      console.error(`Error fetching spec for schema ${schema}:`, e.message);
    }
  }
}

getSpecs();
