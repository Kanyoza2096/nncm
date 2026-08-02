import { Expense } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase';
import { supabaseService } from './supabaseService';

const OFFLINE_KEY = 'nncm_offline_expenses';

const getOfflineExpenses = (): Expense[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Expense[] = [
    { id: 'exp-1', category: 'Training & Materials', description: 'Bought 150 copies of Discipleship 101 manual books', amount: 450000, date: Date.now() - 5 * 24 * 3600 * 1000, approvedBy: 'Finance Elder', projectId: 'proj-1' },
    { id: 'exp-2', category: 'Transportation', description: 'Youth cell transport coach charter to Zomba Open Air crusade', amount: 320000, date: Date.now() - 10 * 24 * 3600 * 1000, approvedBy: 'Admin', projectId: 'proj-2' }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(finalInitial));
  return finalInitial;
};

export const expenseService = {
  getExpenses: async (): Promise<Expense[]> => {
    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching expenses...');
      return supabaseService.expenses.getExpenses();
    }
    return getOfflineExpenses();
  },
  logExpense: async (data: Omit<Expense, 'id'>): Promise<string> => {
    let id = '';
    if (shouldUseSupabase()) {
      try {
        id = await supabaseService.expenses.logExpense(data);
      } catch (e) {
        console.error('[Supabase Bridge] Expense logging failed:', e);
      }
    }
    if (!id) {
      id = 'exp-' + Math.random().toString(36).substring(2, 11);
    }
    const item: Expense = { id, ...data };
    const list = getOfflineExpenses();
    const filtered = list.filter(e => e.id !== id);
    filtered.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
    return id;
  },
  deleteExpense: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      try {
        await supabaseService.expenses.deleteExpense(id);
      } catch (e) {
        console.error('[Supabase Bridge] Expense deletion failed:', e);
      }
    }
    const list = getOfflineExpenses();
    const filtered = list.filter(e => e.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
