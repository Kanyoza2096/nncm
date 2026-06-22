import { Expense } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

const OFFLINE_KEY = 'nncm_offline_expenses';

const getOfflineExpenses = (): Expense[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Expense[] = [
    { id: 'exp-1', category: 'Training & Materials', description: 'Bought 150 copies of Discipleship 101 manual books', amount: 450000, date: Date.now() - 5 * 24 * 3600 * 1000, approvedBy: 'Finance Elder', projectId: 'proj-1' },
    { id: 'exp-2', category: 'Transportation', description: 'Youth cell transport coach charter to Zomba Open Air crusade', amount: 320000, date: Date.now() - 10 * 24 * 3600 * 1000, approvedBy: 'Admin', projectId: 'proj-2' }
  ];
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(initial));
  return initial;
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
    if (shouldUseSupabase()) {
      return supabaseService.expenses.logExpense(data);
    }
    const id = 'exp-' + Math.random().toString(36).substr(2, 9);
    const item: Expense = { id, ...data };
    const list = getOfflineExpenses();
    list.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    return id;
  },
  deleteExpense: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.expenses.deleteExpense(id);
    }
    const list = getOfflineExpenses();
    const filtered = list.filter(e => e.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
