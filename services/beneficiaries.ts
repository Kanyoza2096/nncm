import { Beneficiary } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase';
import { supabaseService } from './supabaseService';

const OFFLINE_KEY = 'nncm_offline_members';

const getOfflineBeneficiaries = (): Beneficiary[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Beneficiary[] = [
    { id: 'ben-1', name: 'Chikondi Phiri', gender: 'female', age: 28, dob: '1998-05-14', phone: '+265888234567', location: 'Chancellor College, Zomba', maritalStatus: 'married', childrenCount: 2, occupation: 'Accountant', status: 'active', churchGroup: 'Youths', createdAt: Date.now() - 30 * 24 * 3600 * 1000 },
    { id: 'ben-2', name: 'Limbani Banda', gender: 'male', age: 34, dob: '1992-09-20', phone: '+265999345678', location: 'Mpondabwino, Zomba', maritalStatus: 'single', childrenCount: 0, occupation: 'High School Teacher', status: 'active', churchGroup: 'Youths', createdAt: Date.now() - 15 * 24 * 3600 * 1000 },
    { id: 'ben-3', name: 'Sister Sandra Phiri', gender: 'female', age: 42, dob: '1984-03-12', phone: '+265999888777', location: 'Zomba Town Center', maritalStatus: 'married', childrenCount: 3, occupation: 'Retail Director', status: 'active', churchGroup: "Women's Fellowship", createdAt: Date.now() - 10 * 24 * 3600 * 1000 },
    { id: 'ben-4', name: 'Elder John Banda', gender: 'male', age: 52, dob: '1974-07-22', phone: '+265888111222', location: 'Sadzi Campus', maritalStatus: 'married', childrenCount: 4, occupation: 'Academy Lecturer', status: 'active', churchGroup: "Men's Fellowship", createdAt: Date.now() - 5 * 24 * 3600 * 1000 },
    { id: 'ben-5', name: 'Little Gift Chirwa', gender: 'female', age: 8, dob: '2018-02-18', phone: '+265999000111', location: 'Mpondabwino, Zomba', maritalStatus: 'single', childrenCount: 0, occupation: 'NNCM Kid Club Member', status: 'active', churchGroup: "Children's Ministry", createdAt: Date.now() - 2 * 24 * 3600 * 1000 }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(finalInitial));
  return finalInitial;
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
    let id = '';
    if (shouldUseSupabase()) {
      try {
        id = await supabaseService.beneficiaries.addBeneficiary(data);
      } catch (e) {
        console.error('[Supabase Bridge] Beneficiary addition failed:', e);
      }
    }
    if (!id) {
      id = 'ben-' + Math.random().toString(36).substring(2, 11);
    }
    const item: Beneficiary = { id, ...data };
    const list = getOfflineBeneficiaries();
    const filtered = list.filter(b => b.id !== id);
    filtered.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
    return id;
  },
  updateBeneficiary: async (id: string, data: Partial<Beneficiary>): Promise<void> => {
    if (shouldUseSupabase()) {
      try {
        await supabaseService.beneficiaries.updateBeneficiary(id, data);
      } catch (e) {
        console.error('[Supabase Bridge] Beneficiary update failed:', e);
      }
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
      try {
        await supabaseService.beneficiaries.deleteBeneficiary(id);
      } catch (e) {
        console.error('[Supabase Bridge] Beneficiary deletion failed:', e);
      }
    }
    const list = getOfflineBeneficiaries();
    const filtered = list.filter(b => b.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
