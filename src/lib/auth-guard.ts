import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

// Auth guard utility to ensure valid session before link operations
export async function ensureAuth(): Promise<Session> {
  // 1) Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // 2) Try refresh if missing/expired
  let s = session;
  if (!s) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    s = refreshed?.session ?? null;
  }
  
  // 3) If still no session, trigger sign-in UI
  if (!s) {
    await openSignInModal();
    const { data: { session: s2 } } = await supabase.auth.getSession();
    if (!s2) throw new Error('Not signed in');
    return s2;
  }
  
  return s; // valid session
}

// Helper function to trigger sign-in UI
async function openSignInModal(): Promise<void> {
  // Navigate to auth page since this app uses routing for auth
  // We'll need to handle this differently - maybe with a promise that resolves after auth
  const currentUrl = window.location.pathname + window.location.search;
  
  // Store the current URL to return to after auth
  sessionStorage.setItem('returnUrl', currentUrl);
  
  // Navigate to auth page
  window.location.href = '/auth';
  
  // This function should ideally wait for the user to complete auth
  // but since we're navigating away, we'll throw an error to stop execution
  throw new Error('Redirecting to sign in');
}

// Alternative approach using a modal instead of navigation
export async function ensureAuthWithPrompt(): Promise<Session> {
  // 1) Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // 2) Try refresh if missing/expired
  let s = session;
  if (!s) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    s = refreshed?.session ?? null;
  }
  
  // 3) If still no session, show user-friendly error
  if (!s) {
    throw new Error('Please sign in to save links between pieces and inspirations. Your inspiration has been saved.');
  }
  
  return s; // valid session
}