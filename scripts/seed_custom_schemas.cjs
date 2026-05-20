const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found at', envPath);
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // The service role key is stored here

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Key not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log('Seeding custom schemas on Supabase...');

  // 1. Seed drivers
  console.log('Clearing driver_profiles...');
  await supabase.schema('driver').from('driver_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const drivers = [
    {
      id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1101',
      vehicle_type: 'Motorcycle',
      license_number: 'DL-NCR-123456',
      delivery_mode: 'Solo',
      is_online: true,
      acceptance_rate: 98.5,
      documents_status: 'APPROVED'
    },
    {
      id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1102',
      vehicle_type: 'Car',
      license_number: 'DL-NCR-789012',
      delivery_mode: 'Solo',
      is_online: true,
      acceptance_rate: 94.0,
      documents_status: 'APPROVED'
    },
    {
      id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1103',
      vehicle_type: 'Van',
      license_number: 'DL-NCR-345678',
      delivery_mode: 'Solo',
      is_online: false,
      acceptance_rate: 88.0,
      documents_status: 'APPROVED'
    },
    {
      id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1104',
      vehicle_type: 'Motorcycle',
      license_number: 'DL-NCR-222333',
      delivery_mode: 'Solo',
      is_online: false,
      acceptance_rate: 100.0,
      documents_status: 'PENDING'
    },
    {
      id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1105',
      vehicle_type: 'Motorcycle',
      license_number: 'DL-NCR-444555',
      delivery_mode: 'Solo',
      is_online: false,
      acceptance_rate: 100.0,
      documents_status: 'PENDING'
    },
    {
      id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1106',
      vehicle_type: 'Car',
      license_number: 'DL-NCR-666777',
      delivery_mode: 'Solo',
      is_online: false,
      acceptance_rate: 100.0,
      documents_status: 'REJECTED'
    }
  ];

  console.log('Inserting driver_profiles...');
  const { error: drvErr } = await supabase.schema('driver').from('driver_profiles').insert(drivers);
  if (drvErr) {
    console.error('Error inserting drivers:', drvErr);
  } else {
    console.log('Successfully seeded driver_profiles!');
  }

  // 2. Seed operators
  console.log('Clearing operator_hubs...');
  await supabase.schema('routing').from('operator_hubs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const hubs = [
    {
      id: '0b99de02-f8d9-482a-bc96-18c7c95e1101',
      owner_user_id: 'e17fca18-e21d-44ba-b2cb-4654924a6e81',
      code: 'HUB-MNL-001',
      name: 'PakiShip Sampaloc Sorting Hub',
      address: '124 Asturias St, Sampaloc, Manila',
      lat: 14.608,
      lng: 120.99,
      storage_capacity: 100,
      is_active: true,
      geofence_on: true
    },
    {
      id: '0b99de02-f8d9-482a-bc96-18c7c95e1102',
      owner_user_id: 'e17fca18-e21d-44ba-b2cb-4654924a6e82',
      code: 'HUB-MNL-002',
      name: 'PakiShip P. Noval Sorting Hub',
      address: '951 P. Noval St, Sampaloc, Manila',
      lat: 14.609,
      lng: 120.989,
      storage_capacity: 150,
      is_active: true,
      geofence_on: true
    },
    {
      id: '0b99de02-f8d9-482a-bc96-18c7c95e1103',
      owner_user_id: 'e17fca18-e21d-44ba-b2cb-4654924a6e83',
      code: 'HUB-MNL-003',
      name: 'Lawson Asturias Partner',
      address: 'Asturias St, Sampaloc, Manila',
      lat: 14.6082,
      lng: 120.9902,
      storage_capacity: 80,
      is_active: false,
      geofence_on: false
    }
  ];

  console.log('Inserting operator_hubs...');
  const { error: hubErr } = await supabase.schema('routing').from('operator_hubs').insert(hubs);
  if (hubErr) {
    console.error('Error inserting operator_hubs:', hubErr);
  } else {
    console.log('Successfully seeded operator_hubs!');
  }

  // 3. Seed parcels
  console.log('Clearing parcel_draft_items...');
  await supabase.schema('parcel').from('parcel_draft_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Clearing parcel_drafts...');
  await supabase.schema('parcel').from('parcel_drafts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const parcels = [
    {
      id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c401',
      user_id: 'e17fca18-e21d-44ba-b2cb-4654924a6e01',
      tracking_number: 'PKS-2026-0001',
      pickup_address: 'Pasig City',
      delivery_address: 'Taguig City',
      sender_name: 'Ana Cruz',
      sender_phone: '09171112222',
      receiver_name: 'John Doe',
      receiver_phone: '09173334444',
      service_id: 'express',
      service_price: 150.00,
      delivery_mode: 'Solo',
      assigned_driver_id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1101',
      status: 'delivered',
      drop_off_point_name: 'Lawson Asturias'
    },
    {
      id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c402',
      user_id: 'e17fca18-e21d-44ba-b2cb-4654924a6e02',
      tracking_number: 'PKS-2026-0002',
      pickup_address: 'Quezon City',
      delivery_address: 'Manila',
      sender_name: 'Jose Rizal',
      sender_phone: '09172223333',
      receiver_name: 'Maria Clara',
      receiver_phone: '09174445555',
      service_id: 'standard',
      service_price: 120.00,
      delivery_mode: 'Solo',
      assigned_driver_id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1102',
      status: 'submitted',
      drop_off_point_name: '7-Eleven P. Noval'
    },
    {
      id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c403',
      user_id: 'e17fca18-e21d-44ba-b2cb-4654924a6e03',
      tracking_number: 'PKS-2026-0003',
      pickup_address: 'Makati City',
      delivery_address: 'Mandaluyong City',
      sender_name: 'Pedro Penduko',
      sender_phone: '09175556666',
      receiver_name: 'Juan Tamad',
      receiver_phone: '09177778888',
      service_id: 'express',
      service_price: 180.00,
      delivery_mode: 'Solo',
      assigned_driver_id: null,
      status: 'draft',
      drop_off_point_name: 'Uncle John Asturias'
    },
    {
      id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c404',
      user_id: 'e17fca18-e21d-44ba-b2cb-4654924a6e04',
      tracking_number: 'PKS-2026-0004',
      pickup_address: 'Pasay City',
      delivery_address: 'Caloocan City',
      sender_name: 'Andres Bonifacio',
      sender_phone: '09176667777',
      receiver_name: 'Emilio Aguinaldo',
      receiver_phone: '09178889999',
      service_id: 'standard',
      service_price: 130.00,
      delivery_mode: 'Solo',
      assigned_driver_id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1101',
      status: 'cancelled',
      drop_off_point_name: 'Direct Delivery'
    },
    {
      id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c405',
      user_id: 'e17fca18-e21d-44ba-b2cb-4654924a6e05',
      tracking_number: 'PKS-2026-0005',
      pickup_address: 'Taguig City',
      delivery_address: 'Pasig City',
      sender_name: 'Gabriela Silang',
      sender_phone: '09177770000',
      receiver_name: 'Diego Silang',
      receiver_phone: '09178881111',
      service_id: 'express',
      service_price: 200.00,
      delivery_mode: 'Solo',
      assigned_driver_id: 'f7b7cb2e-b3d4-4cfd-91b3-6c84c4ee1103',
      status: 'lost',
      drop_off_point_name: 'Direct Delivery'
    }
  ];

  console.log('Inserting parcel_drafts...');
  const { error: draftErr } = await supabase.schema('parcel').from('parcel_drafts').insert(parcels);
  if (draftErr) {
    console.error('Error inserting parcel_drafts:', draftErr);
  } else {
    console.log('Successfully seeded parcel_drafts!');
  }

  // Monthly timestamps for trends (over Jan - Jun 2026)
  const items = [
    {
      id: '7c7aee22-c8d9-482a-bc96-28c7c95e1101',
      parcel_draft_id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c401', // Delivered (Jan)
      size: 'Medium',
      weight_text: '2.5 kg',
      item_type: 'Electronics',
      delivery_guarantee: 'Standard',
      quantity: 1,
      created_at: '2026-01-15T10:00:00Z'
    },
    {
      id: '7c7aee22-c8d9-482a-bc96-28c7c95e1102',
      parcel_draft_id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c402', // In Transit (Feb)
      size: 'Small',
      weight_text: '0.8 kg',
      item_type: 'Documents',
      delivery_guarantee: 'Standard',
      quantity: 1,
      created_at: '2026-02-18T14:30:00Z'
    },
    {
      id: '7c7aee22-c8d9-482a-bc96-28c7c95e1103',
      parcel_draft_id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c403', // Pending (Mar)
      size: 'Large',
      weight_text: '5.2 kg',
      item_type: 'Clothing',
      delivery_guarantee: 'Fragile',
      quantity: 1,
      created_at: '2026-03-22T09:15:00Z'
    },
    {
      id: '7c7aee22-c8d9-482a-bc96-28c7c95e1104',
      parcel_draft_id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c404', // Cancelled (Apr)
      size: 'Medium',
      weight_text: '1.5 kg',
      item_type: 'Food',
      delivery_guarantee: 'Standard',
      quantity: 1,
      created_at: '2026-04-10T16:45:00Z'
    },
    {
      id: '7c7aee22-c8d9-482a-bc96-28c7c95e1105',
      parcel_draft_id: '2b29cd11-d8ec-4cd0-b643-ce5411b0c405', // Lost (May)
      size: 'Small',
      weight_text: '0.5 kg',
      item_type: 'Cosmetics',
      delivery_guarantee: 'Standard',
      quantity: 1,
      created_at: '2026-05-12T11:00:00Z'
    }
  ];

  console.log('Inserting parcel_draft_items...');
  const { error: itemsErr } = await supabase.schema('parcel').from('parcel_draft_items').insert(items);
  if (itemsErr) {
    console.error('Error inserting parcel_draft_items:', itemsErr);
  } else {
    console.log('Successfully seeded parcel_draft_items!');
  }

  console.log('Done!');
}

main().catch(err => {
  console.error('Seeding crashed:', err);
});
