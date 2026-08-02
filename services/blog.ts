import { BlogPost } from '../types';
import { isSupabaseConfigured, shouldUseSupabase } from '../lib/supabase';
import { supabaseService } from './supabaseService';

const OFFLINE_KEY = 'nncm_offline_blog';

const getOfflineBlogPosts = (): BlogPost[] => {
  const cached = localStorage.getItem(OFFLINE_KEY);
  if (cached) return JSON.parse(cached);
  const initial: BlogPost[] = [
    { id: 'blog-1', title: 'Empowering Young Girls: The Scholastic Lifespans', slug: 'empowering-young-girls-scholastic-lifespans', excerpt: 'How targeted educational scholarship support is breaking generational poverty loops in Zomba District.', content: '# Empowering Young Girls\n\nSupporting girls education is one of the most effective ways to foster sustainable community progression.', authorId: 'system', authorName: 'Madolitso Banda', published: true, category: 'Education', featuredImage: '', publishedAt: Date.now(), createdAt: Date.now() },
    { id: 'blog-2', title: 'Vocational Sewing Lab Launch', slug: 'vocational-sewing-lab-launch', excerpt: 'Highlighting the launch event and starter kit handouts at our rural female entrepreneurship hub.', content: '# Sewing Lab Launch\n\nWe officially launched the center with 12 new premium sewing machines and start-up toolkit bundles.', authorId: 'system', authorName: 'Comfort Phiri', published: true, category: 'Vocational', featuredImage: '', publishedAt: Date.now(), createdAt: Date.now() }
  ];
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(finalInitial));
  return finalInitial;
};

export const blogService = {
  getBlogPosts: async (publishedOnly: boolean = false): Promise<BlogPost[]> => {
    const mapPost = (b: BlogPost) => ({
      ...b,
      author: b.author || { name: b.authorName || 'Staff Writer' },
      coverImage: b.coverImage || b.featuredImage || '',
      createdAt: b.createdAt || b.publishedAt || Date.now()
    });

    if (shouldUseSupabase()) {
      console.log('[Supabase Bridge] Fetching blog posts...');
      const data = await supabaseService.blog.getBlogPosts(publishedOnly);
      return data.map(mapPost);
    }
    let list = getOfflineBlogPosts();
    if (publishedOnly) {
      list = list.filter(b => b.published);
    }
    return list.map(mapPost);
  },
  getBlogPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    if (shouldUseSupabase()) {
      return supabaseService.blog.getBlogPostBySlug(slug);
    }
    const list = getOfflineBlogPosts();
    return list.find(b => b.slug === slug) || null;
  },
  getBlogPostById: async (id: string): Promise<BlogPost | null> => {
    if (shouldUseSupabase()) {
      return supabaseService.blog.getBlogPostById(id);
    }
    const list = getOfflineBlogPosts();
    return list.find(b => b.id === id) || null;
  },
  createBlogPost: async (data: Omit<BlogPost, 'id' | 'slug'>): Promise<string> => {
    let id = '';
    if (shouldUseSupabase()) {
      try {
        id = await supabaseService.blog.createBlogPost(data);
      } catch (e) {
        console.error('[Supabase Bridge] Blog post creation failed:', e);
      }
    }
    if (!id) {
      id = 'blog-' + Math.random().toString(36).substring(2, 11);
    }
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const item: BlogPost = { id, slug, ...data };
    const list = getOfflineBlogPosts();
    const filtered = list.filter(b => b.id !== id);
    filtered.push(item);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
    return id;
  },
  updateBlogPost: async (id: string, data: Partial<BlogPost>): Promise<void> => {
    if (shouldUseSupabase()) {
      try {
        await supabaseService.blog.updateBlogPost(id, data);
      } catch (e) {
        console.error('[Supabase Bridge] Blog post update failed:', e);
      }
    }
    const list = getOfflineBlogPosts();
    const idx = list.findIndex(b => b.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      if (data.title && !data.slug) {
        list[idx].slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
    }
  },
  deleteBlogPost: async (id: string): Promise<void> => {
    if (shouldUseSupabase()) {
      try {
        await supabaseService.blog.deleteBlogPost(id);
      } catch (e) {
        console.error('[Supabase Bridge] Blog post deletion failed:', e);
      }
    }
    const list = getOfflineBlogPosts();
    const filtered = list.filter(b => b.id !== id);
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered));
  }
};
