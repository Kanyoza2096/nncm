import { Beneficiary } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

const OFFLINE_KEY = 'nncm_offline_members';

const getOfflineBeneficiaries = (): Beneficiary[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Beneficiary[] = [
    { id: 'ben-1', name: 'Chikondi Phiri', gender: 'female', age: 28, dob: '1998-05-14', phone: '+265888234567', location: 'Chancellor College, Zomba', maritalStatus: 'married', childrenCount: 2, occupation: 'Accountant', status: 'active', createdAt: Date.now() - 30 * 24 * 3600 * 1000 },
    { id: 'ben-2', name: 'Limbani Banda', gender: 'male', age: 34, dob: '1992-09-20', phone: '+265999345678', location: 'Mpondabwino, Zomba', maritalStatus: 'single', childrenCount: 0, occupation: 'High School Teacher', status: 'active', createdAt: Date.now() - 15 * 24 * 3600 * 1000 }
  ];
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(initial));
  return initial;
};

export const beneficiaryService = {
  getBeneficiaries: async (): Promise<Beneficiary[]> => {
    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching beneficiaries...');
      return supabaseService.beneficiaries.getBeneficiaries();
    }
    return getOfflineBeneficiaries();
  },
  getBeneficiary: async (id: string): Promise<Beneficiary | null> => {
    if (shouldUseSupabase()) {
      const list = await supabaseService.beneficiaries.getBeneficiaries();
      return list.find(b => b.id === id) || null;
    }
    const list = getOfflineBeneficiaries();
    return list.find(b => b.id === id) || null;
  },
  addBeneficiary: async (data: Omit<Beneficiary, 'id'>): Promise<string> => {
    if (shouldUseSupabase()) {
      return supabaseService.beneficiaries.addBeneficiary(data);
    }
    const id = 'ben-' + Math.random().toString(36).substr(2, 9);
    const item: Beneficiary = { id, ...data };
    const list = getOfflineBeneficiaries();
    list.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    return id;
  },
  updateBeneficiary: async (id: string, data: Partial<Beneficiary>): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.beneficiaries.updateBeneficiary(id, data);
    }
    const list = getOfflineBeneficiaries();
    const idx = list.findIndex(b => b.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    }
  },
  deleteBeneficiary: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.beneficiaries.deleteBeneficiary(id);
    }
    const list = getOfflineBeneficiaries();
    const filtered = list.filter(b => b.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
