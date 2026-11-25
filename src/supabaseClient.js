import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

async function resolveGuestSession() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session error:", sessionError.message);
    return null;
  }
  if (session) return session;

  const { data, error: authError } = await supabase.auth.signInAnonymously();
  if (authError) {
    console.error("Anonymous sign-in failed:", authError.message);
    return null;
  }
  return data.session;
}

// Concurrent callers share one in-flight lookup. Without this, React's
// StrictMode (which runs startup effects twice in development) could call
// signInAnonymously() twice on a first visit and create two guest users.
let pending = null;

// Returns the current session, signing in as a new anonymous guest if there
// isn't one. Resolves to null on failure.
export function getOrCreateGuestSession() {
  if (!pending) {
    pending = resolveGuestSession().finally(() => {
      pending = null;
    });
  }
  return pending;
}
