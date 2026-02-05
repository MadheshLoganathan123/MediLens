const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load .env manually
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at:', envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
const lines = envContent.split(/\r?\n/);
console.log(`ℹ️  Read ${lines.length} lines from .env`);

lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        env[key] = value;
        // console.log(`   Loaded: ${key}`);
    } else {
        console.warn(`   ⚠️  Ignored line ${idx + 1}: ${trimmed.substring(0, 20)}...`);
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY; // Using Anon key for general check

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    console.log('Found keys:', Object.keys(env));
    process.exit(1);
}

console.log('✅ Loaded .env');
console.log('ℹ️  Supabase URL:', supabaseUrl);
// obfuscate key
console.log('ℹ️  Supabase Key:', supabaseKey.slice(0, 10) + '...');

// 2. Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log('\n🔄 Testing connection to Supabase...');
    try {
        // Just checking if we can talk to the server.
        // We'll try to select from a table we expect to exist, or just use a health check if possible.
        // 'profiles' is a good candidate based on user code.
        const { data, error, status, statusText } = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Connection failed or table issue:');
            console.error('   Code:', error.code);
            console.error('   Message:', error.message);
            console.error('   Details:', error.details);
            console.error('   Hint:', error.hint);
        } else {
            console.log(`✅ Connection Successful! Status: ${status} ${statusText}`);
            console.log(`ℹ️  'profiles' table seems accessible (HEAD request).`);
        }

        // Check if we can actually read a row (RLS might prevent this if anon, but worth a try if public)
        const { data: rows, error: readError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (readError) {
            console.log('⚠️  Could not read rows from `profiles` (Likely RLS restricting anonymous access, which is NORMAL if policies are set):');
            console.log('   Running Message:', readError.message);
        } else {
            console.log(`✅ Read ${rows.length} rows from 'profiles'. Table is publicly readable (or has permissive RLS).`);
        }

    } catch (err) {
        console.error('❌ Unexpected error during test:', err);
    }
}

checkConnection();
