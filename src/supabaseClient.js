import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to ensure guest session
export async function getOrCreateGuestSession() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session error:", sessionError.message);
    return null;
  }

  if (!session) {
    const { data, error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
      console.error("Anonymous sign-in failed:", authError.message);
      return null;
    }
    return data.session;
  }

  return session;
}
