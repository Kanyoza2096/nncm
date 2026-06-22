import { User } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

const OFFLINE_KEY = 'nncm_offline_user_profile';

export const authService = {
  getUserProfile: async (uid: string): Promise<User | null> => {
    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching user profile for', uid);
      return supabaseService.auth.getUserProfile(uid);
    }
    const cached = localStorage.getItem(`${OFFLINE_KEY}_${uid}`);
    if (cached) return JSON.parse(cached);
    return null;
  },
  createUserProfile: async (uid: string, data: Partial<User>): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.auth.createUserProfile(uid, data);
    }
    const item: User = {
      id: uid,
      email: data.email || 'user@example.com',
      name: data.name || 'Anonymous User',
      role: data.role || 'volunteer',
      createdAt: Date.now(),
      status: 'active',
      ...data
    };
    localStorage.setItem(`${OFFLINE_KEY}_${uid}`, JSON.stringify(item));
  },
  getAllProfiles: async (): Promise<User[]> => {
    if (shouldUseSupabase()) {
      return supabaseService.auth.getAllProfiles();
    }
    // Return mock data for preview
    return [
      { id: '1', name: 'Pastor Richie Mkandawire', email: 'richie@nncm.org', role: 'admin', status: 'active', createdAt: Date.now() },
      { id: '2', name: 'Sister Mercy Gondwe', email: 'mercy@nncm.org', role: 'staff', status: 'active', createdAt: Date.now() }
    ];
  }
};
