'use strict';

const fs = require('fs');
const path = require('path');

const eventTypes = ['booking.created', 'booking.cancelled', 'booking.checkin', 'booking.checkout', 'shipment.status_updated'];
const paymentMethods = ['card', 'gcash', 'maya', 'grabpay', 'qrph'];
const statuses = ['upcoming', 'active', 'completed', 'cancelled'];

const data = [];
const nddata = [];

console.log('Starting generation of 5000 structured governed Kafka events...');

for (let i = 1; i <= 5000; i++) {
  const eventType = eventTypes[i % eventTypes.length];
  const ref = `PKP-${String(1000000 + i)}`;
  const amount = 50 + (i % 20) * 15;
  const paymentMethod = paymentMethods[i % paymentMethods.length];
  
  const payload = {
    eventId: `evt-${i}`,
    reference: ref,
    occurredAt: new Date(Date.now() - (5000 - i) * 60000).toISOString(),
  };

  if (eventType.startsWith('booking')) {
    payload.bookingId = i;
    payload.userId = 100 + (i % 50);
    payload.amount = amount;
    payload.paymentMethod = paymentMethod;
    payload.spot = `F${1 + (i % 3)}-S${1 + (i % 10)}-L${String(i % 100).padStart(2, '0')}`;
    payload.date = new Date(Date.now() - (5000 - i) * 60000).toISOString().split('T')[0];
    payload.timeSlot = `${String(6 + (i % 16)).padStart(2, '0')}:00 - ${String(7 + (i % 16)).padStart(2, '0')}:00`;
  } else {
    payload.shipmentId = `ship-${i}`;
    payload.jobNumber = `JOB-${100000 + i}`;
    payload.fromStatus = statuses[(i - 1) % statuses.length];
    payload.toStatus = statuses[i % statuses.length];
    payload.reason = 'Standard automated state transition';
    payload.updatedBy = 'PakiAdmin Confluent Test Runner';
  }

  const event = {
    sourceServiceId: i % 2 === 0 ? 'pakipark-backend' : 'pakiship-admin',
    key: String(i),
    eventType: eventType,
    payload: payload,
    metadata: {
      schemaVersion: '1',
      classification: 'internal',
      batchId: 'confluent-smoke-test-01'
    }
  };

  data.push(event);
  nddata.push(JSON.stringify(event));
}

// Ensure the root path exists
const targetJsonPath = path.join(process.cwd(), 'confluent_test_data.json');
const targetNdjsonPath = path.join(process.cwd(), 'confluent_test_data.ndjson');

// Write standard JSON array
fs.writeFileSync(targetJsonPath, JSON.stringify(data, null, 2), 'utf8');

// Write Newline Delimited JSON
fs.writeFileSync(targetNdjsonPath, nddata.join('\n'), 'utf8');

console.log(`Generated standard JSON file at: ${targetJsonPath}`);
console.log(`Generated NDJSON file at: ${targetNdjsonPath}`);
console.log('Successfully completed generating 5000 rows.');
