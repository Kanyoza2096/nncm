import { Testimonial } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

const OFFLINE_KEY = 'nncm_offline_testimonials';

const getOfflineTestimonials = (): Testimonial[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Testimonial[] = [
    { id: 'test-1', name: 'Brother Emmanuel Phiri', role: 'Congregation Member', organization: 'NNCM Discipleship Group', content: 'Our weekly fellowship and spiritual teachings have deeply transformed my life. I have found true renewal here.', photoURL: '', rating: 5, approved: true, date: Date.now() - 120 * 24 * 3600 * 1000 },
    { id: 'test-2', name: 'Sister Grace Banda', role: 'Youth Ministry Leader', organization: 'NNCM Zomba Board', content: 'Preaching the uncompromised gospel has raised an energetic youth group. The spiritual growth has been amazing.', photoURL: '', rating: 5, approved: true, date: Date.now() - 60 * 24 * 3600 * 1000 }
  ];
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(initial));
  return initial;
};

export const testimonialService = {
  getTestimonials: async (approvedOnly: boolean = false): Promise<Testimonial[]> => {
    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching testimonials...');
      return supabaseService.testimonials.getTestimonials(approvedOnly);
    }
    const list = getOfflineTestimonials();
    if (approvedOnly) {
      return list.filter(t => t.approved);
    }
    return list;
  },
  createTestimonial: async (data: Omit<Testimonial, 'id'>): Promise<string> => {
    if (shouldUseSupabase()) {
      return supabaseService.testimonials.createTestimonial(data);
    }
    const id = 'test-' + Math.random().toString(36).substr(2, 9);
    const item: Testimonial = { id, ...data, date: data.date || Date.now() };
    const list = getOfflineTestimonials();
    list.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    return id;
  },
  updateTestimonial: async (id: string, data: Partial<Testimonial>): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.testimonials.updateTestimonial(id, data);
    }
    const list = getOfflineTestimonials();
    const idx = list.findIndex(t => t.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    }
  },
  deleteTestimonial: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.testimonials.deleteTestimonial(id);
    }
    const list = getOfflineTestimonials();
    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
