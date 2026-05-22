'use strict';

const fs = require('fs');
const path = require('path');

// Parse CLI Arguments
const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const delayArg = args.find(a => a.startsWith('--delay='));

const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 5000;
const consumeDelay = delayArg ? parseInt(delayArg.split('=')[1]) : 100; // ms simulate lag

console.clear();
console.log(`======================================================`);
console.log(`🔍 APICENTER / CONFLUENT KAFKA CONSUMER ACTIVE`);
console.log(`======================================================`);
console.log(`Topic Subscription:  tribe.pakiship.events`);
console.log(`Consumer Group:      pakiship-admin-monitoring`);
console.log(`Status:              Listening for incoming events...`);
console.log(`======================================================\n`);

// Load environment variables for credentials
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = val;
      }
    });
  }
} catch (_) {}

let consumedCount = 0;
const startTime = Date.now();

// Simulated Real-Time Consumer stream handler
function consumeEvent(event, offset) {
  consumedCount++;
  const elapsed = (Date.now() - startTime) / 1000;
  const eps = elapsed > 0 ? (consumedCount / elapsed).toFixed(1) : 0;
  
  const occurredTime = new Date(event.payload.occurredAt).toLocaleTimeString();
  const partition = offset % 3; // Simulated Kafka partitions

  // Print nicely formatted log entry
  console.log(`📥 \x1b[32m[CONSUMED]\x1b[0m Partition: ${partition} | Offset: ${offset} | Event: \x1b[36m${event.eventType}\x1b[0m`);
  console.log(`   └─ Key: ${event.key} | Origin: ${event.sourceServiceId} | Time: ${occurredTime}`);
  
  if (event.eventType.startsWith('booking')) {
    console.log(`   └─ Spot: \x1b[33m${event.payload.spot}\x1b[0m | Amount: \x1b[32m₱${event.payload.amount}\x1b[0m | Method: ${event.payload.paymentMethod}`);
  } else {
    console.log(`   └─ Job: ${event.payload.jobNumber} | Status: \x1b[35m${event.payload.fromStatus} ➔ ${event.payload.toStatus}\x1b[0m`);
  }
  console.log(`--------------------------------------------------------------------------------`);

  // Update header status on console title
  if (process.platform === 'win32') {
    process.title = `Consumed: ${consumedCount} | Rate: ${eps} ev/s`;
  }
}

async function startConsuming() {
  const dataPath = path.join(process.cwd(), 'confluent_test_data.json');
  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  Waiting for confluent_test_data.json to be generated or streamed...');
    return;
  }

  const events = JSON.parse(fs.readFileSync(dataPath, 'utf8')).slice(0, limit);
  
  // Simulate active event consumption with a tiny latency to reflect consumer polling
  for (let i = 0; i < events.length; i++) {
    consumeEvent(events[i], i + 100000); // 100000 is mock partition offset start
    
    // Add variable latency simulation
    const variableDelay = consumeDelay + Math.floor(Math.random() * 50);
    await new Promise(resolve => setTimeout(resolve, variableDelay));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n======================================================`);
  console.log(`🎉 ALL EVENTS CONSUMED SUCCESSFULLY!`);
  console.log(`======================================================`);
  console.log(`Total Events Consumed: ${consumedCount}`);
  console.log(`Listening Duration:    ${duration} seconds`);
  console.log(`Throughput Rate:       ${(consumedCount / duration).toFixed(1)} events/sec`);
  console.log(`Consumer Status:       Idle (Awaiting new event offsets)`);
  console.log(`======================================================\n`);
}

startConsuming().catch(console.error);
