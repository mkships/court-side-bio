/** True when Supabase env vars are set. Kept separate from client.ts so it doesn't pull in the SDK. */
export function hasSupabaseConfig() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); }
