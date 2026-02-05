import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'CRITICAL: Supabase environment variables are missing.\n' +
        'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        // Ensure URL-hash session handling doesn't interfere in SPA routing
        auth: {
            persistSession: true,
            detectSessionInUrl: false
        }
    }
);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl.startsWith('http'));
