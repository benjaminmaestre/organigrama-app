import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvowcblmriysvfaqvjzz.supabase.co';
const supabaseKey = 'sb_publishable_qeRcClgHgknZv0hDJItgZQ_8AX_0JzB';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = 'dartjfe@gmail.com';
  const password = 'password123'; // Guessing from typical test credentials

  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }

  console.log('Logged in as:', authData.user.email);
  console.log('UID:', authData.user.id);

  // Check profile
  const { data: profile, error: profError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profError) {
    console.error('Profile Error:', profError.message);
  } else {
    console.log('Profile:', profile);
  }

  // Check events
  const { data: events, error: evError } = await supabase.from('events').select('*');
  console.log('Events:', events?.length);

  // Check RLS on insert tasks
  const testPayload = {
    event_id: events?.[0]?.id || '11111111-1111-1111-1111-111111111111',
    title: 'Test insert',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'supervision',
    status: 'pending',
    priority: 'normal',
    assigned_to: 'both'
  };

  const { data: insData, error: insError } = await supabase.from('tasks').insert(testPayload).select();
  if (insError) {
    console.error('Insert Error:', insError.message, insError.code);
  } else {
    console.log('Insert Success:', insData);
  }
}

test();
