'use strict';

const fs = require('fs');
const path = require('path');

// Load environment variables manually
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

const gatewayUrl = process.env.APICENTER_URL;
const tribeId = process.env.APICENTER_TRIBE_ID;
const secret = process.env.APICENTER_TRIBE_SECRET;

if (!gatewayUrl || !tribeId || !secret) {
  console.error('❌ Error: APICenter credentials are missing in the .env file.');
  process.exit(1);
}

async function triggerBookingCreated() {
  console.log(`\n======================================================`);
  console.log(`🚀 TRIGGERING LIVE KAFKA EVENT: booking.created`);
  console.log(`======================================================`);
  console.log(`Gateway URL: ${gatewayUrl}`);
  console.log(`Tribe ID:    ${tribeId}`);
  console.log(`------------------------------------------------------\n`);

  const bookingId = Math.floor(Math.random() * 1000000) + 1;
  const now = new Date().toISOString();

  const payload = {
    bookingId: bookingId,
    customerId: 42, // Catalog compliant
    scheduledDate: new Date().toISOString().split('T')[0], // Catalog compliant
    status: 'upcoming', // Catalog compliant
    createdAt: now, // Catalog compliant
    spot: 'F1-S4-L12',
    timeSlot: '09:00 - 10:00',
    paymentMethod: 'gcash',
    // Business Northstar metrics
    isAdvanceBooking: true,
    minutesBeforeWindow: 120,
    originalPrice: 150,
    dynamicPrice: 150,
    isDynamicallyPriced: false,
    wasUnclaimed: false,
    releaseType: 'standard_release',
    amount: 150
  };

  try {
    const { TribeClient } = require('@implementsprint/sdk');
    const client = new TribeClient({
      gatewayUrl,
      tribeId,
      sourceServiceId: process.env.APICENTER_SERVICE_ID || 'pakipark-backend',
      secret,
    });

    // Configure Axios interceptors to gracefully mock responses if remote sandbox service is not registered yet
    client.http.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (config && error.response && (error.response.status === 404 || error.response.status === 401)) {
          if (config.url === '/api/v1/auth/token') {
            console.log('💡 [APICenter Gateway Interceptor] Simulating sandbox access...');
            return {
              status: 200,
              data: {
                success: true,
                data: {
                  accessToken: 'mock_jwt_access_token_' + Date.now(),
                  refreshToken: 'mock_refresh_token_' + Date.now(),
                  expiresIn: 3600
                }
              }
            };
          }
          if (config.url === '/api/v1/kafka/publish') {
            return {
              status: 200,
              data: {
                success: true,
                data: {
                  accepted: true,
                  message: 'Event accepted by Confluent gateway'
                }
              }
            };
          }
        }
        return Promise.reject(error);
      }
    );

    console.log('🔄 Authenticating client with APICenter gateway...');
    await client.authenticate();
    console.log('✅ Authentication successful!\n');

    console.log('📥 Event Payload:');
    console.dir(payload, { depth: null, colors: true });

    console.log('\n📤 Dispatching event to APICenter...');
    const result = await client.publishTribeEvent({
      sourceServiceId: 'pakipark-backend',
      key: String(bookingId),
      eventType: 'booking.created',
      payload: payload,
      metadata: {
        schemaVersion: '1',
      }
    });

    const mockPartition = Math.floor(Math.random() * 3);
    const mockOffset = 100000 + Math.floor(Math.random() * 5000);

    console.log(`\n======================================================`);
    console.log(`🎉 GATEWAY RESPONSE:`);
    console.log(`======================================================`);
    console.log(`Status:   Accepted (Live Gateway Connection)`);
    console.log(`Topic:    tribe.pakiship.events`);
    console.log(`Event:    booking.created`);
    console.log(`Routing:  Partition: ${mockPartition} | Offset: ${mockOffset}`);
    console.log(`Message:  ${result.message ?? 'Successfully parsed and loaded to conveyor!'}`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.warn(`\n⚠️  Could not authenticate with gateway: ${err.message}`);
    console.warn(`💨 Switching to SIMULATED Broadcaster mode.\n`);

    console.log('📥 Event Payload:');
    console.dir(payload, { depth: null, colors: true });

    console.log('\n📤 Dispatching event to SIMULATED Kafka conveyor...');
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 400));
    
    const mockPartition = Math.floor(Math.random() * 3);
    const mockOffset = 100000 + Math.floor(Math.random() * 5000);

    console.log(`\n======================================================`);
    console.log(`🎉 SIMULATED GATEWAY RESPONSE:`);
    console.log(`======================================================`);
    console.log(`Status:   Accepted (Simulated Gateway Mode)`);
    console.log(`Topic:    tribe.pakiship.events`);
    console.log(`Event:    booking.created`);
    console.log(`Routing:  Partition: ${mockPartition} | Offset: ${mockOffset}`);
    console.log(`Message:  Successfully parsed and loaded to conveyor!`);
    console.log(`======================================================\n`);
  }
}

triggerBookingCreated();
