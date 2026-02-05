// Simple Supabase connectivity check script
// Usage: node check_supabase_connection.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

(async () => {
  try {
    console.log('Checking Supabase connection...');
    // Try a simple RPC call: list current user (requires anon key) or select from profiles
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Supabase responded with error:', error.message || error);
      process.exit(2);
    }
    console.log('Supabase connection OK. Sample profiles rows:', data?.length ?? 0);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error while checking Supabase:', err);
    process.exit(3);
  }
})();
