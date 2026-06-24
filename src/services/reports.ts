import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

export interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  url?: string;
  createdAt: number;
}

const OFFLINE_KEY = 'nncm_offline_reports';

const getOfflineReports = (): Report[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Report[] = [
    { id: 'rep-1', title: 'Q1 Comprehensive Academic Activity Report', type: 'narrative', date: '2026-04-15', size: '2.4 MB', createdAt: Date.now() - 60 * 24 * 3600 * 1000 },
    { id: 'rep-2', title: 'Annual Financial Expenditure Audit (2025)', type: 'financial', date: '2026-05-10', size: '1.8 MB', createdAt: Date.now() - 30 * 24 * 3600 * 1000 }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(finalInitial));
  return finalInitial;
};

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    if (shouldUseSupabase()) {
      return supabaseService.reports.getReports();
    }
    return getOfflineReports();
  },
  getMonthlyReports: async () => {
    return reportService.getMonthlyReport();
  },
  createReport: async (data: Omit<Report, 'id'>): Promise<string> => {
    if (shouldUseSupabase()) {
      return supabaseService.reports.createReport(data);
    }
    const id = 'rep-' + Math.random().toString(36).substr(2, 9);
    const item: Report = { id, ...data };
    const list = getOfflineReports();
    list.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    return id;
  },
  deleteReport: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.reports.deleteReport(id);
    }
    const list = getOfflineReports();
    const filtered = list.filter(r => r.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  },
  getMonthlyReport: async () => {
    if (shouldUseSupabase()) {
      return supabaseService.expenses.getMonthlyReport();
    }
    
    // Dynamically build monthly aggregation from local storage expenses
    const expCached = localStorage.getItem('nncm_offline_expenses');
    const expenses = expCached ? JSON.parse(expCached) : [];
    
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    
    // Inject a representative baseline for illustration
    const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'];
    months.forEach(m => {
      monthlyMap[m] = { income: 5000000 + Math.floor(Math.random() * 2000000), expense: 1200000 + Math.floor(Math.random() * 800000) };
    });
    
    // Sync actual stored offline expenses into the map
    expenses.forEach((e: any) => {
      const dateObj = new Date(e.date);
      if (isNaN(dateObj.getTime())) return;
      const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const amt = Number(e.amount) || 0;
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { income: 4500000, expense: 0 };
      }
      monthlyMap[monthStr].expense += amt;
    });

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense
    }));
  }
};
