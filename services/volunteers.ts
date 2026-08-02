import { Volunteer } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase';
import { supabaseService } from './supabaseService';

const OFFLINE_KEY = 'nncm_offline_volunteers';

const getOfflineVolunteers = (): Volunteer[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Volunteer[] = [
    { id: 'vol-1', name: 'Memory Gondwe', email: 'memory@gondwe.org', skills: ['Welfare Support'], availability: 'Weekends', status: 'active', createdAt: Date.now() },
    { id: 'vol-2', name: 'John Tembo', email: 'jtembo@gmail.com', skills: ['Event Planning'], availability: 'Remote', status: 'inactive', createdAt: Date.now() }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(finalInitial));
  return finalInitial;
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
    let id = '';
    if (shouldUseSupabase()) {
      try {
        id = await supabaseService.volunteers.registerVolunteer(data);
      } catch (e) {
        console.error('[Supabase Bridge] Volunteer registration failed:', e);
      }
    }
    if (!id) {
      id = 'vol-' + Math.random().toString(36).substring(2, 11);
    }
    const item: Volunteer = { id, ...data, createdAt: Date.now() };
    const list = getOfflineVolunteers();
    const filtered = list.filter(v => v.id !== id);
    filtered.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
    return id;
  },
  updateVolunteer: async (id: string, data: Partial<Volunteer>): Promise<void> => {
    if (shouldUseSupabase()) {
      try {
        await supabaseService.volunteers.updateVolunteer(id, data);
      } catch (e) {
        console.error('[Supabase Bridge] Volunteer update failed:', e);
      }
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
      try {
        await supabaseService.volunteers.deleteVolunteer(id);
      } catch (e) {
        console.error('[Supabase Bridge] Volunteer deletion failed:', e);
      }
    }
    const list = getOfflineVolunteers();
    const filtered = list.filter(v => v.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
