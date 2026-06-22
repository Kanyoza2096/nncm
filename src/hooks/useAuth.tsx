import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AppUser } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase.ts';
import { toast } from 'sonner';

interface AuthContextType {
  user: any;
  profile: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<AppUser | null>(null);
  const [sbLoading, setSbLoading] = useState(true);

  // 1. Supabase Auth monitoring
  useEffect(() => {
    let active = true;
    console.log('[Supabase Auth Context] Setting up active session subscription...');
    
    // Check local sandbox session bypass first
    const sandboxSession = localStorage.getItem('nncm_sandbox_session');
    if (sandboxSession) {
      try {
        const parsed = JSON.parse(sandboxSession);
        setSupabaseUser(parsed);
        setSupabaseProfile({
          id: 'usr_admin',
          name: parsed.name || 'Administrator (Sandbox Bypass)',
          email: parsed.email || 'admin@example.com',
          role: parsed.role || 'admin',
          status: 'active',
          photoURL: parsed.photoURL || null,
          createdAt: Date.now()
        } as AppUser);
        setSbLoading(false);
        return;
      } catch (e) {
        console.warn('[Supabase Auth Context] Error parsing sandbox session:', e);
      }
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      
      // If sandbox bypass was detected during loading, don't override it
      if (localStorage.getItem('nncm_sandbox_session')) return;

      if (session) {
        setSupabaseUser(session.user);
        // Fetch profile from Supabase
        supabase.from('users')
          .select('*')
          .eq('uid', session.user.id)
          .maybeSingle()
          .then(async ({ data, error }) => {
            if (!active) return;
            if (error) {
              console.error('[Supabase Auth Context] Error fetching user profile:', error);
              toast.error('Auth Database Error', { description: error.message || error.details });
              setSbLoading(false);
            } else if (data) {
              setSupabaseProfile({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role || 'staff',
                status: data.status || 'active',
                photoURL: data.photo_url || data.photoURL || null,
                createdAt: Number(data.created_at || data.createdAt || Date.now())
              } as AppUser);
              setSbLoading(false);
            } else {
              // Fallback: If no profile exists yet (e.g., sandbox developer), auto-create one
              const defaultProfile: AppUser = {
                id: 'usr_' + Math.random().toString(36).substring(2, 11),
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Authorized Developer',
                email: session.user.email || '',
                role: 'admin',
                status: 'active',
                photoURL: session.user.user_metadata?.avatar_url || null,
                createdAt: Date.now()
              };
              
              try {
                await supabase.from('users').upsert({
                  id: defaultProfile.id,
                  uid: session.user.id,
                  name: defaultProfile.name,
                  email: defaultProfile.email,
                  role: 'admin',
                  status: 'active',
                  created_at: Date.now()
                });
                if (active) setSupabaseProfile(defaultProfile);
              } catch (upsertErr) {
                console.error('[Supabase Auth Context] Error bootstrapping profile:', upsertErr);
                if (active) setSupabaseProfile(defaultProfile);
              }
              setSbLoading(false);
            }
          });
      } else {
        setSupabaseUser(null);
        setSupabaseProfile(null);
        setSbLoading(false);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      console.log(`[Supabase Auth Event] ${event}`);

      // If sandbox bypass was detected, don't override it with signed-out event on initial loading
      if (localStorage.getItem('nncm_sandbox_session')) return;

      if (session) {
        setSupabaseUser(session.user);
        // Fetch or update profile
        const { data, error } = await supabase.from('users')
          .select('*')
          .eq('uid', session.user.id)
          .maybeSingle();

        if (!active) return;
        if (error) {
          console.error('[Supabase Auth Event] Error fetching profile:', error);
          toast.error('Auth Database Error', { description: error.message || error.details });
          // Profile fallback on error to prevent breaking UI
          const defaultId = 'usr_' + Math.random().toString(36).substring(2, 11);
          setSupabaseProfile({
            id: defaultId,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Authorized Developer',
            email: session.user.email || '',
            role: 'admin',
            status: 'active',
            photoURL: session.user.user_metadata?.avatar_url || null,
            createdAt: Date.now()
          });
        } else if (data) {
          setSupabaseProfile({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role || 'staff',
            status: data.status || 'active',
            photoURL: data.photo_url || data.photoURL || null,
            createdAt: Number(data.created_at || data.createdAt || Date.now())
          } as AppUser);
        } else {
          // Profile fallback
          const defaultId = 'usr_' + Math.random().toString(36).substring(2, 11);
          const defaultProfile: AppUser = {
            id: defaultId,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Authorized Developer',
            email: session.user.email || '',
            role: 'admin',
            status: 'active',
            photoURL: session.user.user_metadata?.avatar_url || null,
            createdAt: Date.now()
          };
          try {
             await supabase.from('users').upsert({
               id: defaultId,
               uid: session.user.id,
               name: defaultProfile.name,
               email: defaultProfile.email,
               role: 'admin',
               status: 'active',
               created_at: Date.now()
             });
            if (active) setSupabaseProfile(defaultProfile);
          } catch (upsertErr: any) {
            console.error('[Supabase Auth Event] Error upserting default profile:', upsertErr);
            toast.error('Auth Database Error', { description: upsertErr?.message || upsertErr?.details || JSON.stringify(upsertErr) });
            if (active) setSupabaseProfile(defaultProfile);
          }
        }
      } else {
        setSupabaseUser(null);
        setSupabaseProfile(null);
      }
      setSbLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem('nncm_sandbox_session');
      setSupabaseUser(null);
      setSupabaseProfile(null);
      await supabase.auth.signOut();
    } catch (e) {}
  };

  const login = async (email: string, pass: string) => {
    // Sandbox bypass
    if (email === 'admin@nncm.org' && pass === 'admin123') {
      const mockSession = { 
        id: 'usr_admin', 
        email: 'admin@nncm.org', 
        name: 'Administrator', 
        role: 'admin' 
      };
      localStorage.setItem('nncm_sandbox_session', JSON.stringify(mockSession));
      setSupabaseUser(mockSession);
      setSupabaseProfile({
          id: 'usr_admin',
          name: 'Administrator',
          email: 'admin@nncm.org',
          role: 'admin',
          status: 'active',
          createdAt: Date.now()
      } as AppUser);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const register = async (email: string, pass: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
  };

  const user = supabaseUser;
  const profile = supabaseProfile;
  const loading = sbLoading;

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
