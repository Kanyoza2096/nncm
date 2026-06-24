import { Project } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase.ts';
import { supabaseService } from './supabaseService.ts';

const OFFLINE_KEY = 'nncm_offline_projects';

const getOfflineProjects = (): Project[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: Project[] = [
    { id: 'proj-1', title: 'Sanctuary Renovation & Sound System Upgrade', name: 'Sanctuary Renovation', description: 'Upgrading the sound system and sanctuary setup at DMC Campus for modern recording and streaming capabilities.', category: 'Sanctuary operations', location: 'Zomba', budget: 8500000, raised: 3400000, images: [], status: 'active', startDate: Date.now(), endDate: Date.now() + 100000000, createdAt: Date.now() },
    { id: 'proj-2', title: 'Zomba Youth Group Discipleship Initiative', name: 'Youth Group Discipleship', description: 'Weekly gatherings, youth leadership training, camp counseling, and musical instrument training workshops.', category: 'Youth Ministry', location: 'Zomba', budget: 12000000, raised: 8200000, images: [], status: 'active', startDate: Date.now(), endDate: Date.now() + 2000000000, createdAt: Date.now() },
    { id: 'proj-3', title: 'Community Outreach & Free Counseling Program', name: 'Community Outreach', description: 'Spiritual support, grief counseling services, and free food distribution to vulnerable families.', category: 'Charity outreach', location: 'Zomba', budget: 4500000, raised: 4100000, images: [], status: 'active', startDate: Date.now(), endDate: Date.now() + 150000000, createdAt: Date.now() }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(finalInitial));
  return finalInitial;
};

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching projects...');
      return supabaseService.projects.getProjects();
    }
    return getOfflineProjects();
  },
  getPublicProjects: async (): Promise<Project[]> => {
    if (shouldUseSupabase()) {
      return supabaseService.projects.getPublicProjects();
    }
    return getOfflineProjects().filter(p => p.status?.toLowerCase() === 'active');
  },
  createProject: async (data: Omit<Project, 'id'>): Promise<string> => {
    if (shouldUseSupabase()) {
      return supabaseService.projects.createProject(data);
    }
    const id = 'proj-' + Math.random().toString(36).substr(2, 9);
    const item: Project = { id, ...data, createdAt: Date.now() };
    const list = getOfflineProjects();
    list.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    return id;
  },
  updateProject: async (id: string, data: Partial<Project>): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.projects.updateProject(id, data);
    }
    const list = getOfflineProjects();
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    }
  },
  deleteProject: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      return supabaseService.projects.deleteProject(id);
    }
    const list = getOfflineProjects();
    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  },
  getProjectById: async (id: string): Promise<Project | null> => {
    const list = await projectService.getProjects();
    return list.find(p => p.id === id) || null;
  }
};
