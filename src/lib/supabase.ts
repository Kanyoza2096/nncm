/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

// Dynamically check if Supabase is properly configured with real values rather than default/placeholder ones
const baseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder_key' &&
  !supabaseUrl.includes('placeholder')
);

export const isSupabaseConfigured = baseConfigured;

/**
 * Determine if the app is in sandbox mode (mock login active)
 */
export const isSandboxMode = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('nncm_sandbox_session') !== null || localStorage.getItem('nncm_force_offline') === 'true';
};

/**
 * Determine if the app should actually attempt to fetch from Supabase.
 * Returns false if in Sandbox mode (mock login) even if keys are present.
 */
export const shouldUseSupabase = () => {
  return baseConfigured && !isSandboxMode();
};

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase Client] Missing environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Fallback to dummy values to prevent app crash if vars are missing, 
// but queries will fail gracefully if they are invalid
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key'
);
