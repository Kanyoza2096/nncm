import { Donor, Donation } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

const OFFLINE_DONORS_KEY = 'nncm_offline_donors';
const OFFLINE_DONATIONS_KEY = 'nncm_offline_donations';

const getOfflineDonors = (): Donor[] => {
  const cached = localStorage.getItem(OFFLINE_DONORS_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Donor[] = [
    { id: 'donor-1', name: 'Pastor Richie Covenant Partners', email: 'partners@nncm-church.org', phone: '+265882404093', totalDonations: 1500000, createdAt: Date.now(), donorType: 'individual' },
    { id: 'donor-2', name: 'Grace & Mercy Sanctuary Guild', email: 'sanctuary@nncm.org', phone: '+15555550199', totalDonations: 3000000, createdAt: Date.now(), donorType: 'organization' }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_DONORS_KEY, JSON.stringify(finalInitial));
  return finalInitial;
};

const getOfflineDonations = (): Donation[] => {
  const cached = localStorage.getItem(OFFLINE_DONATIONS_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Donation[] = [
    { id: 'don-1', donorId: 'donor-1', donorName: 'Pastor Richie Covenant Partners', amount: 1500000, currency: 'MWK', date: Date.now() - 15 * 24 * 3600 * 1000, notes: 'Special pledge tithing submission for the Zomba Sanctuary structural build.' },
    { id: 'don-2', donorId: 'donor-2', donorName: 'Grace & Mercy Sanctuary Guild', amount: 3000000, currency: 'MWK', date: Date.now() - 30 * 24 * 3600 * 1000, notes: 'Mission partner seed offering for Zomba crusade and outreach logistics.' }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_DONATIONS_KEY, JSON.stringify(finalInitial));
  return finalInitial;
};

export const donorService = {
  getDonors: async (): Promise<Donor[]> => {
    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching donors...');
      return supabaseService.donors.getDonors();
    }
    return getOfflineDonors();
  },
  createDonor: async (data: Omit<Donor, 'id' | 'totalDonations'>): Promise<string> => {
    if (shouldUseSupabase()) {
      return supabaseService.donors.createDonor(data);
    }
    const id = 'donor-' + Math.random().toString(36).substr(2, 9);
    const donor: Donor = { id, ...data, totalDonations: 0, createdAt: Date.now() };
    const list = getOfflineDonors();
    list.push(donor);
    localStorage.setItem(OFFLINE_DONORS_KEY, JSON.stringify(list));
    return id;
  },
  updateDonor: async (id: string, data: Partial<Donor>): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.donors.updateDonor(id, data);
    }
    const list = getOfflineDonors();
    const idx = list.findIndex(d => d.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      localStorage.setItem(OFFLINE_DONORS_KEY, JSON.stringify(list));
    }
  },
  deleteDonor: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.donors.deleteDonor(id);
    }
    const list = getOfflineDonors();
    const filtered = list.filter(d => d.id !== id);
    localStorage.setItem(OFFLINE_DONORS_KEY, JSON.stringify(filtered));
  },
  getDonations: async (donorId?: string): Promise<Donation[]> => {
    if (shouldUseSupabase()) {
      return supabaseService.donors.getDonations(donorId);
    }
    const list = getOfflineDonations();
    if (donorId) {
      return list.filter(d => d.donorId === donorId);
    }
    return list;
  },
  addDonation: async (data: { donorId: string; amount: number; currency?: string; notes: string; date?: number }): Promise<string> => {
    if (shouldUseSupabase()) {
      return supabaseService.donors.addDonation(data);
    }
    const id = 'don-' + Math.random().toString(36).substr(2, 9);
    const donors = getOfflineDonors();
    const donor = donors.find(d => d.id === data.donorId);
    
    const donation: Donation = {
      id,
      donorId: data.donorId,
      amount: data.amount,
      currency: data.currency || 'MWK',
      date: data.date || Date.now(),
      notes: data.notes
    };

    const donations = getOfflineDonations();
    donations.push(donation);
    localStorage.setItem(OFFLINE_DONATIONS_KEY, JSON.stringify(donations));

    if (donor) {
      donor.totalDonations = (donor.totalDonations || 0) + data.amount;
      localStorage.setItem(OFFLINE_DONORS_KEY, JSON.stringify(donors));
    }

    return id;
  },
  createDonation: async (data: { donorName: string; donorEmail: string; amount: number; donationType: string; paymentMethod: string; notes: string }) => {
    // If Supabase is enabled, we'd normally look up a donor by email or create one
    // For this context, we will use a special 'public-donor' or similar, but for logic we'll call addDonation
    return donorService.addDonation({
      donorId: 'public-donor', // fallback
      amount: data.amount,
      notes: `${data.donationType} via ${data.paymentMethod}. Giver: ${data.donorName}. ${data.notes}`,
      date: Date.now()
    });
  },
  deleteDonation: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.donors.deleteDonation(id);
    }
    const donations = getOfflineDonations();
    const found = donations.find(dn => dn.id === id);
    if (!found) return;

    const filtered = donations.filter(dn => dn.id !== id);
    localStorage.setItem(OFFLINE_DONATIONS_KEY, JSON.stringify(filtered));

    const donors = getOfflineDonors();
    const donor = donors.find(d => d.id === found.donorId);
    if (donor) {
      donor.totalDonations = Math.max(0, (donor.totalDonations || 0) - found.amount);
      localStorage.setItem(OFFLINE_DONORS_KEY, JSON.stringify(donors));
    }
  }
};
