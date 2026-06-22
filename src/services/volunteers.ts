import { Volunteer } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

const OFFLINE_KEY = 'nncm_offline_volunteers';

const getOfflineVolunteers = (): Volunteer[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Volunteer[] = [
    { id: 'vol-1', name: 'Memory Gondwe', email: 'memory@gondwe.org', skills: ['Welfare Support'], availability: 'Weekends', status: 'active', createdAt: Date.now() },
    { id: 'vol-2', name: 'John Tembo', email: 'jtembo@gmail.com', skills: ['Event Planning'], availability: 'Remote', status: 'inactive', createdAt: Date.now() }
  ];
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(initial));
  return initial;
};

export const volunteerService = {
  getVolunteers: async (): Promise<Volunteer[]> => {
    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching volunteers...');
      return supabaseService.volunteers.getVolunteers();
    }
    return getOfflineVolunteers();
  },
  registerVolunteer: async (data: Omit<Volunteer, 'id'>): Promise<string> => {
    if (shouldUseSupabase()) {
      return supabaseService.volunteers.registerVolunteer(data);
    }
    const id = 'vol-' + Math.random().toString(36).substr(2, 9);
    const item: Volunteer = { id, ...data, createdAt: Date.now() };
    const list = getOfflineVolunteers();
    list.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    return id;
  },
  updateVolunteer: async (id: string, data: Partial<Volunteer>): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.volunteers.updateVolunteer(id, data);
    }
    const list = getOfflineVolunteers();
    const idx = list.findIndex(v => v.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    }
  },
  deleteVolunteer: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.volunteers.deleteVolunteer(id);
    }
    const list = getOfflineVolunteers();
    const filtered = list.filter(v => v.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
