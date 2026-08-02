import { Testimonial } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase';
import { supabaseService } from './supabaseService';

const OFFLINE_KEY = 'nncm_offline_testimonials';

const getOfflineTestimonials = (): Testimonial[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Testimonial[] = [
    { id: 'test-1', name: 'Brother Emmanuel Phiri', role: 'Congregation Member', organization: 'NNCM Discipleship Group', content: 'Our weekly fellowship and spiritual teachings have deeply transformed my life. I have found true renewal here.', photoURL: '', rating: 5, approved: true, date: Date.now() - 120 * 24 * 3600 * 1000 },
    { id: 'test-2', name: 'Sister Grace Banda', role: 'Youth Ministry Leader', organization: 'NNCM Zomba Board', content: 'Preaching the uncompromised gospel has raised an energetic youth group. The spiritual growth has been amazing.', photoURL: '', rating: 5, approved: true, date: Date.now() - 60 * 24 * 3600 * 1000 }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(finalInitial));
  return finalInitial;
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
    let id = '';
    if (shouldUseSupabase()) {
      try {
        id = await supabaseService.testimonials.createTestimonial(data);
      } catch (e) {
        console.error('[Supabase Bridge] Testimonial creation failed:', e);
      }
    }
    if (!id) {
      id = 'test-' + Math.random().toString(36).substring(2, 11);
    }
    const item: Testimonial = { id, ...data, date: data.date || Date.now() };
    const list = getOfflineTestimonials();
    const filtered = list.filter(t => t.id !== id);
    filtered.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
    return id;
  },
  updateTestimonial: async (id: string, data: Partial<Testimonial>): Promise<void> => {
    if (shouldUseSupabase()) {
      try {
        await supabaseService.testimonials.updateTestimonial(id, data);
      } catch (e) {
        console.error('[Supabase Bridge] Testimonial update failed:', e);
      }
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
      try {
        await supabaseService.testimonials.deleteTestimonial(id);
      } catch (e) {
        console.error('[Supabase Bridge] Testimonial deletion failed:', e);
      }
    }
    const list = getOfflineTestimonials();
    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
