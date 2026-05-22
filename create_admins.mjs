import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rregfrhtlmfktliijzpd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZWdmcmh0bG1ma3RsaWlqenBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5MDM1MSwiZXhwIjoyMDg2OTY2MzUxfQ.9rYx4nZkF_K278AZ2W6tAuBkN17RNALgZqdDXqpcQnA'
);

async function run() {
  const users = [
    { email: 'superadmin@gmail.com', password: 'Admin@123', role: 'super-admin' },
    { email: 'admin@gmail.com', password: 'Admin@123', role: 'admin' }
  ];

  for (const u of users) {
    let userId;
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });
    
    if (authErr) {
      if (authErr.message.includes('already exists')) {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        userId = usersData.users.find((x) => x.email === u.email)?.id;
        
        // Update password just in case
        if (userId) {
          await supabase.auth.admin.updateUserById(userId, { password: u.password });
        }
      } else {
        console.error("Error creating user", u.email, authErr);
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    if (!userId) {
      console.log('Could not find user id for', u.email);
      continue;
    }

    // Upsert profile
    const { error: profErr } = await supabase.schema('account').from('profiles').upsert({
      id: userId,
      email: u.email,
      full_name: u.email.split('@')[0],
      role: 'admin'
    });
    if (profErr) console.error("Profile error", profErr);

    // Upsert admin_accounts
    // Note: admin_accounts doesn't have an ID on conflict. It probably has profile_id as unique, but we might need to check if it exists first to do an update or insert
    const { data: existingAdmin } = await supabase.schema('account').from('admin_accounts').select('id').eq('profile_id', userId).single();
    
    if (existingAdmin) {
       await supabase.schema('account').from('admin_accounts').update({
         admin_role: u.role,
         is_active: true
       }).eq('profile_id', userId);
    } else {
       await supabase.schema('account').from('admin_accounts').insert({
         profile_id: userId,
         admin_role: u.role,
         is_active: true
       });
    }

    console.log(`Successfully configured ${u.email} as ${u.role}`);
  }
}
run();
