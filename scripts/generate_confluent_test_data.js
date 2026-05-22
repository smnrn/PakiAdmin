'use strict';

const fs = require('fs');
const path = require('path');

const eventTypes = [
  'booking.created', 
  'booking.released', 
  'booking.checkin', 
  'booking.checkout', 
  'shipment.status_updated', 
  'shipment.hub_transferred'
];

const paymentMethods = ['card', 'gcash', 'maya', 'grabpay', 'qrph'];
const statuses = ['pending', 'accepted', 'in-transit', 'delivered', 'cancelled'];
const hubs = ['MNL-HUB-01', 'CEB-HUB-02', 'DVO-HUB-03', 'ILO-HUB-04'];
const transitLegs = ['first_mile', 'hub_relay', 'last_mile'];

const data = [];
const nddata = [];

console.log('Generating 5000 Northstar-Aligned Governed Kafka Events...');

for (let i = 1; i <= 5000; i++) {
  const eventType = eventTypes[i % eventTypes.length];
  const ref = `PKP-${String(1000000 + i)}`;
  const occurredAt = new Date(Date.now() - (5000 - i) * 60000).toISOString();
  
  const payload = {
    eventId: `evt-${i}`,
    reference: ref,
    occurredAt: occurredAt,
  };

  if (eventType.startsWith('booking')) {
    // Alignment to PakiPark Northstar: Dynamic slot release & pricing optimization
    const isDynamicallyPriced = i % 3 === 0;
    const wasUnclaimed = i % 4 === 0;
    const isAdvanceBooking = !isDynamicallyPriced && !wasUnclaimed;
    
    // Minutes before slot window the event occurred
    const minutesBeforeWindow = isDynamicallyPriced ? (i % 29) + 1 : (i % 180) + 30; // dynamic release happens close to window start (N < 30 mins)
    const basePrice = 150 + (i % 10) * 20;
    const originalPrice = basePrice;
    
    // Dynamic price drops up to 40% near window start to incentivize last-minute bookings without cannibalizing advance bookings
    const dynamicPrice = isDynamicallyPriced 
      ? Math.round(originalPrice * (0.6 + (i % 20) / 100)) 
      : originalPrice;

    payload.bookingId = i;
    payload.userId = 100 + (i % 50);
    payload.spot = `F${1 + (i % 3)}-S${1 + (i % 10)}-L${String(i % 100).padStart(2, '0')}`;
    payload.date = new Date(Date.now() - (5000 - i) * 60000).toISOString().split('T')[0];
    payload.timeSlot = `${String(6 + (i % 16)).padStart(2, '0')}:00 - ${String(7 + (i % 16)).padStart(2, '0')}:00`;
    payload.paymentMethod = paymentMethods[i % paymentMethods.length];
    
    // Northstar metrics
    payload.isAdvanceBooking = isAdvanceBooking;
    payload.minutesBeforeWindow = minutesBeforeWindow;
    payload.originalPrice = originalPrice;
    payload.dynamicPrice = dynamicPrice;
    payload.isDynamicallyPriced = isDynamicallyPriced;
    payload.wasUnclaimed = wasUnclaimed;
    payload.releaseType = wasUnclaimed 
      ? 'unclaimed_auto_release' 
      : (isDynamicallyPriced ? 'last_minute_discounted_release' : 'standard_release');
    payload.amount = dynamicPrice; // final revenue amount
    
  } else {
    // Alignment to PakiShip Northstar: Relay shipping vs Direct Shipping, SLA, Hub Utilization
    const shippingMethod = i % 3 === 0 ? 'direct' : 'relay'; // relay is preferred to optimize hub utilization
    const hubId = hubs[i % hubs.length];
    const currentHubUtilization = 55 + (i % 40); // 55% - 95% utilization
    
    const transitLeg = transitLegs[i % transitLegs.length];
    const transitDurationMinutes = 30 + (i % 150); // leg speed metric
    const slaDeadline = new Date(new Date(occurredAt).getTime() + 4 * 3600000).toISOString(); // 4 hours SLA
    const isSlaMet = transitDurationMinutes < 120; // SLA breached if single leg takes > 2 hours

    payload.shipmentId = `ship-${i}`;
    payload.jobNumber = `JOB-${100000 + i}`;
    payload.fromStatus = statuses[(i - 1) % statuses.length];
    payload.toStatus = statuses[i % statuses.length];
    payload.reason = 'SLA Relay routing optimization';
    payload.updatedBy = 'PakiShip Conveyor Controller';
    
    // Northstar metrics
    payload.shippingMethod = shippingMethod;
    payload.hubId = hubId;
    payload.currentHubUtilization = currentHubUtilization;
    payload.transitLeg = transitLeg;
    payload.transitDurationMinutes = transitDurationMinutes;
    payload.slaDeadline = slaDeadline;
    payload.isSlaMet = isSlaMet;
  }

  const event = {
    sourceServiceId: eventType.startsWith('booking') ? 'pakipark-backend' : 'pakiship-admin',
    key: String(i),
    eventType: eventType,
    payload: payload,
    metadata: {
      schemaVersion: '2.0',
      classification: 'internal',
      batchId: 'northstar-metrics-batch-01'
    }
  };

  data.push(event);
  nddata.push(JSON.stringify(event));
}

const targetJsonPath = path.join(process.cwd(), 'confluent_test_data.json');
const targetNdjsonPath = path.join(process.cwd(), 'confluent_test_data.ndjson');

fs.writeFileSync(targetJsonPath, JSON.stringify(data, null, 2), 'utf8');
fs.writeFileSync(targetNdjsonPath, nddata.join('\n'), 'utf8');

console.log(`Generated Northstar-aligned JSON file at: ${targetJsonPath}`);
console.log(`Generated Northstar-aligned NDJSON file at: ${targetNdjsonPath}`);
console.log('Successfully generated 5000 Northstar-aligned event records.');
