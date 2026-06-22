import { Settings } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

const OFFLINE_KEY = 'nncm_offline_settings';

const getOfflineSettings = (): Settings => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Settings = {
    id: 'settings-1',
    orgName: 'New Nature In Christ Ministry',
    tagline: 'Preaching the uncompromised gospel and building faithful disciples.',
    aboutText: 'The church is a Pentecostal church fully relying on the Holy Spirit and His ministration. The purpose of the church is to preach and teach the word of God and make disciples of Jesus Christ who will belong to planted and established self-supporting churches.',
    email: 'richiefa88@gmail.com',
    phone: '+265 882404093',
    address: 'Zomba, Malawi',
    directorName: 'Pastor Richie Mkandawire',
    directorTitle: 'Senior Pastor & Founder',
    directorBio: 'Pastor Richie founded New Nature In Christ Ministry with a burning desire to see lives transformed by the power of the Holy Spirit, teaching the uncompromised word of God, and raising a Christ-minded generation.',
    directorImage: '',
    directorWhatsApp: '+265882404093',
    facebookUrl: 'https://facebook.com/new_nature_in_christ_ministry',
    twitterUrl: 'https://twitter.com/new_nature_in_christ_ministry',
    youtubeUrl: 'https://youtube.com/new_nature_in_christ_ministry',
    instagramUrl: 'https://instagram.com/new_nature_in_christ_ministry',
    koboApiUrl: '',
    koboToken: '',
    koboFormId: '',
    mapLatitude: -13.9626,
    mapLongitude: 33.7741
  };
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(initial));
  return initial;
};

export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching settings...');
      return supabaseService.settings.getSettings();
    }
    return getOfflineSettings();
  },
  getPublicHome: async (): Promise<any> => {
    if (shouldUseSupabase()) {
      try {
        const settings = await supabaseService.settings.getSettings();
        const projects = await supabaseService.projects.getPublicProjects();
        const testimonials = await supabaseService.testimonials.getTestimonials(true);
        
        const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget), 0);
        const totalRaised = projects.reduce((sum, p) => sum + Number(p.raised || 0), 0);
        
        return {
          settings,
          statistics: {
            projectsCount: projects.length,
            totalBudget,
            totalRaised,
            beneficiariesCount: 152,
            volunteersCount: 28
          },
          projects: projects.slice(0, 3),
          testimonials: testimonials.slice(0, 3)
        };
      } catch (err) {
        console.error('[Supabase Home Aggregator] Error aggregating public metrics', err);
      }
    }
    
    // Offline / unconfigured fallback home data aggregator from local storage keys
    const settings = getOfflineSettings();
    const projectCached = localStorage.getItem('nncm_offline_projects');
    const projects = projectCached ? JSON.parse(projectCached) : [];
    const testCached = localStorage.getItem('nncm_offline_testimonials');
    const testimonials = testCached ? JSON.parse(testCached) : [];
    
    return {
      settings,
      statistics: {
        projectsCount: projects.length || 3,
        totalBudget: 25000000,
        totalRaised: 15700000,
        beneficiariesCount: 152,
        volunteersCount: 28
      },
      projects: projects.slice(0, 3),
      testimonials: testimonials.slice(0, 3).filter((t: any) => t.status === 'approved')
    };
  },
  updateSettings: async (data: Partial<Settings>): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.settings.updateSettings(data);
    }
    const current = getOfflineSettings();
    const updated = { ...current, ...data };
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(updated));
  }
};
