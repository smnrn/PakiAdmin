const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rregfrhtlmfktliijzpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZWdmcmh0bG1ma3RsaWlqenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTAzNTEsImV4cCI6MDg2OTY2MzUxfQ.XuN7GMEHjLURt8THBzhLqTwo1s-srZG8ufhHM3mrAZM';

const supabase = createClient(supabaseUrl, supabaseKey);

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
