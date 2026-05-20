console.log("process.env keys starting with PG/DB/USER/PASS:");
for (const k of Object.keys(process.env)) {
  if (k.startsWith('PG') || k.startsWith('DB') || k.includes('USER') || k.includes('PASS') || k.includes('key') || k.includes('KEY')) {
    console.log(`${k}: ${process.env[k]}`);
  }
}
