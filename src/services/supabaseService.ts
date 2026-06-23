import { supabase } from '../lib/supabase.ts';
import { Project, Beneficiary, Donor, Donation, Expense, Volunteer, Settings, BlogPost, Testimonial, User } from '../types';
import { toast } from 'sonner';
import { generateUUID } from '../lib/id-utils';

const logError = (context: string, error: any) => {
  console.error(`[Supabase Error] ${context}:`, error);
  
  // Skip generic toast for business logic errors that the UI handles specifically
  // 23505: Unique violation (e.g. duplicate email)
  const isHandledError = error?.code === '23505' || (error?.message && error.message.includes('unique constraint'));
  
  if (!isHandledError) {
    const msg = error?.message || error?.details || JSON.stringify(error);
    toast.error(`Database Error: ${context}`, {
      description: msg,
      duration: 8000,
    });
  }
};

// Helper to generate compliant unique identifiers
const generateId = () => generateUUID();

// Field name mappings for camelCase <-> snake_case translation
const camelToSnakeMap: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  assignedTo: 'assigned_to',
  organizationName: 'organization_name',
  organizationLogo: 'organization_logo',
  orgAbout: 'org_about',
  koboApiUrl: 'kobo_api_url',
  koboToken: 'kobo_token',
  koboFormId: 'kobo_form_id',
  koboLastSyncAt: 'kobo_last_sync_at',
  photoURL: 'photo_url',
  photoUrl: 'photo_url',
  maritalStatus: 'marital_status',
  childrenCount: 'children_count',
  koboId: 'kobo_id',
  rawKoboData: 'raw_kobo_data',
  beneficiaryId: 'beneficiary_id',
  caseType: 'case_type',
  startDate: 'start_date',
  endDate: 'end_date',
  projectId: 'project_id',
  dueDate: 'due_date',
  approvedBy: 'approved_by',
  donorType: 'donor_type',
  totalDonations: 'total_donations',
  donorId: 'donor_id',
  assignedProject: 'assigned_project',
  featuredImage: 'featured_image',
  publishedAt: 'published_at',
  authorId: 'author_id',
  authorName: 'author_name',
  partnerType: 'partner_type',
  userId: 'user_id',
  entityType: 'entity_type',
  entityId: 'entity_id',
  uploadedBy: 'uploaded_by',
  uploadedAt: 'uploaded_at',
  whatsapp: 'whatsapp',
  vision: 'vision',
  mission: 'mission',
  motto: 'motto',
  facebookUrl: 'facebook_url',
  twitterUrl: 'twitter_url',
  youtubeUrl: 'youtube_url',
  instagramUrl: 'instagram_url',
  videoUrl: 'video_url',
  audioUrl: 'audio_url',
  downloadsCount: 'downloads_count',
  coverImage: 'cover_image',
  registrationOpen: 'registration_open',
  registeredCount: 'registered_count',
};

const snakeToCamelMap: Record<string, string> = {
  id: 'id',
  uid: 'uid',
  name: 'name',
  email: 'email',
  role: 'role',
  status: 'status',
  age: 'age',
  dob: 'dob',
  phone: 'phone',
  location: 'location',
  occupation: 'occupation',
  description: 'description',
  priority: 'priority',
  budget: 'budget',
  raised: 'raised',
  image: 'image',
  title: 'title',
  completed: 'completed',
  amount: 'amount',
  currency: 'currency',
  notes: 'notes',
  date: 'date',
  skills: 'skills',
  availability: 'availability',
  slug: 'slug',
  excerpt: 'excerpt',
  content: 'content',
  published: 'published',
  logo: 'logo',
  website: 'website',
  read: 'read',
  message: 'message',
  details: 'details',
  whatsapp: 'whatsapp',
};

// Populate snakeToCamelMap from camelToSnakeMap while ensuring specificity
for (const [camel, snake] of Object.entries(camelToSnakeMap)) {
  if (snake === 'photo_url' && camel === 'photoURL') {
    snakeToCamelMap[snake] = 'photoURL';
  } else if (!snakeToCamelMap[snake]) {
    snakeToCamelMap[snake] = camel;
  }
}
snakeToCamelMap['organization_name'] = 'organizationName';
snakeToCamelMap['organization_logo'] = 'organizationLogo';

const toDB = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toDB);
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const dbKey = camelToSnakeMap[key] || key;
    result[dbKey] = value;
  }
  return result;
};

const fromDB = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(fromDB);
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const appKey = snakeToCamelMap[key] || key;
    result[appKey] = value;
  }
  return result;
};

export const supabaseService = {
  // 1. Projects
  projects: {
    getProjects: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(p => {
        const item = fromDB(p);
        return {
          ...item,
          startDate: p.start_date ? Number(p.start_date) : null,
          endDate: p.end_date ? Number(p.end_date) : null,
          createdAt: Number(p.created_at)
        };
      }) as Project[];
    },
    getPublicProjects: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active');
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(p => {
        const item = fromDB(p);
        return {
          ...item,
          startDate: p.start_date ? Number(p.start_date) : null,
          endDate: p.end_date ? Number(p.end_date) : null,
          createdAt: Number(p.created_at)
        };
      }) as Project[];
    },
    createProject: async (project: Omit<Project, 'id'>): Promise<string> => {
      const id = generateId();
      const { error } = await supabase.from('projects').insert([toDB({
        id,
        name: project.name,
        title: project.title || '',
        description: project.description,
        category: project.category || '',
        budget: Number(project.budget) || 0,
        raised: Number(project.raised) || 0,
        status: project.status,
        image: project.image || null,
        startDate: project.startDate || null,
        endDate: project.endDate || null,
        assignedTo: project.assignedTo || null,
        createdAt: Date.now()
      })]);
      if (error) { logError("Database operation error", error); throw error; }
      return id;
    },
    updateProject: async (id: string, project: Partial<Project>): Promise<void> => {
      const updateData: any = { ...project };
      if (project.budget !== undefined) updateData.budget = Number(project.budget) || 0;
      if (project.raised !== undefined) updateData.raised = Number(project.raised) || 0;
      
      const { error } = await supabase.from('projects').update(toDB(updateData)).eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    },
    deleteProject: async (id: string): Promise<void> => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    }
  },

  // 2. Beneficiaries
  beneficiaries: {
    getBeneficiaries: async (): Promise<Beneficiary[]> => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(b => {
        const item = fromDB(b);
        return {
          ...item,
          address: b.location || '',
          createdAt: Number(b.created_at)
        };
      }) as Beneficiary[];
    },
    addBeneficiary: async (beneficiary: Omit<Beneficiary, 'id'>): Promise<string> => {
      const id = generateId();
      const { error } = await supabase.from('beneficiaries').insert([toDB({
        id,
        name: beneficiary.name,
        email: beneficiary.email || null,
        category: beneficiary.category || 'Local Resident',
        gender: beneficiary.gender || 'other',
        age: Number(beneficiary.age) || 0,
        dob: beneficiary.dob || null,
        phone: beneficiary.phone || null,
        location: beneficiary.address || beneficiary.location || 'Unknown',
        maritalStatus: beneficiary.maritalStatus || 'single',
        childrenCount: Number(beneficiary.childrenCount) || 0,
        occupation: beneficiary.occupation || null,
        status: beneficiary.status || 'active',
        koboId: beneficiary.koboId || null,
        rawKoboData: beneficiary.rawKoboData || null,
        assignedTo: beneficiary.assignedTo || null,
        createdAt: Date.now()
      })]);
      if (error) { logError("Database operation error", error); throw error; }
      return id;
    },
    updateBeneficiary: async (id: string, beneficiary: Partial<Beneficiary>): Promise<void> => {
      const updateData: any = { ...beneficiary };
      if (beneficiary.age !== undefined) updateData.age = Number(beneficiary.age) || 0;
      if (beneficiary.childrenCount !== undefined) updateData.childrenCount = Number(beneficiary.childrenCount) || 0;
      if (beneficiary.address !== undefined) {
        updateData.location = beneficiary.address;
        delete updateData.address;
      }
      
      const { error } = await supabase.from('beneficiaries').update(toDB(updateData)).eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    },
    deleteBeneficiary: async (id: string): Promise<void> => {
      const { error } = await supabase.from('beneficiaries').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    }
  },

  // 3. Donors
  donors: {
    getDonors: async (): Promise<Donor[]> => {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(d => {
        const item = fromDB(d);
        return {
          ...item,
          totalDonations: Number(d.total_donations || 0),
          createdAt: Number(d.created_at)
        };
      }) as Donor[];
    },
    createDonor: async (donor: Omit<Donor, 'id' | 'totalDonations'>): Promise<string> => {
      const id = generateId();
      const { error } = await supabase.from('donors').insert([toDB({
        id,
        name: donor.name,
        email: donor.email,
        phone: donor.phone || null,
        donorType: donor.donorType || 'individual',
        totalDonations: 0,
        assignedTo: donor.assignedTo || null,
        createdAt: Date.now()
      })]);
      if (error) { logError("Database operation error", error); throw error; }
      return id;
    },
    updateDonor: async (id: string, donor: Partial<Donor>): Promise<void> => {
      const { error } = await supabase.from('donors').update(toDB(donor)).eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    },
    deleteDonor: async (id: string): Promise<void> => {
      const { error } = await supabase.from('donors').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    },
    getDonations: async (donorId?: string): Promise<Donation[]> => {
      let query = supabase.from('donations').select('*').order('date', { ascending: false });
      if (donorId) {
        query = query.eq('donor_id', donorId);
      }
      const { data, error } = await query;
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(d => {
        const item = fromDB(d);
        return {
          ...item,
          amount: Number(d.amount),
          date: Number(d.date)
        };
      }) as Donation[];
    },
    addDonation: async (donation: { donorId: string; amount: number; currency?: string; notes: string; date?: number }): Promise<string> => {
      const id = generateId();
      const date = donation.date || Date.now();
      const { error: donationError } = await supabase.from('donations').insert([toDB({
        id,
        donorId: donation.donorId,
        amount: Number(donation.amount) || 0,
        currency: donation.currency || 'MWK',
        notes: donation.notes || '',
        date,
        assignedTo: null
      })]);
      if (donationError) throw donationError;

      // Increment totalDonor Donations
      const { data: donor } = await supabase.from('donors').select('total_donations').eq('id', donation.donorId).single();
      if (donor) {
        const nextTotal = Number(donor.total_donations || 0) + Number(donation.amount);
        await supabase.from('donors').update(toDB({ totalDonations: nextTotal })).eq('id', donation.donorId);
      }
      return id;
    },
    deleteDonation: async (id: string): Promise<void> => {
      const { data: donation } = await supabase.from('donations').select('*').eq('id', id).single();
      if (donation) {
        const { data: donor } = await supabase.from('donors').select('total_donations').eq('id', donation.donor_id).single();
        if (donor) {
          const nextTotal = Math.max(0, Number(donor.total_donations || 0) - Number(donation.amount));
          await supabase.from('donors').update(toDB({ totalDonations: nextTotal })).eq('id', donation.donor_id);
        }
      }
      const { error } = await supabase.from('donations').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    }
  },

  // 4. Expenses
  expenses: {
    getExpenses: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(e => {
        const item = fromDB(e);
        return {
          ...item,
          amount: Number(e.amount),
          date: Number(e.date)
        };
      }) as Expense[];
    },
    logExpense: async (expense: Omit<Expense, 'id'>): Promise<string> => {
      const id = generateId();
      const { error } = await supabase.from('expenses').insert([toDB({
        id,
        projectId: expense.projectId,
        amount: Number(expense.amount) || 0,
        category: expense.category,
        description: expense.description,
        date: Number(expense.date),
        approvedBy: expense.approvedBy,
        assignedTo: expense.assignedTo || null
      })]);
      if (error) { logError("Database operation error", error); throw error; }
      return id;
    },
    deleteExpense: async (id: string): Promise<void> => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    },
    getMonthlyReport: async () => {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) { logError("Database fetch error", error); return []; }

      const monthlyStats: Record<string, { month: string; amount: number; budget: number }> = {};
      (data || []).forEach(e => {
        const dt = new Date(Number(e.date));
        const key = dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyStats[key]) {
          monthlyStats[key] = { month: key, amount: 0, budget: 0 };
        }
        monthlyStats[key].amount += Number(e.amount || 0);
      });
      return Object.values(monthlyStats);
    }
  },

  // 5. Volunteers
  volunteers: {
    getVolunteers: async (): Promise<Volunteer[]> => {
      const { data, error } = await supabase.from('volunteers').select('*');
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(v => {
        const item = fromDB(v);
        return {
          ...item,
          skills: typeof item.skills === 'string' ? item.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.skills) ? item.skills : [])
        };
      }) as Volunteer[];
    },
    registerVolunteer: async (volunteer: Omit<Volunteer, 'id'>): Promise<string> => {
      const id = generateId();
      const { error } = await supabase.from('volunteers').insert([toDB({
        id,
        name: volunteer.name,
        email: volunteer.email,
        skills: Array.isArray(volunteer.skills) ? volunteer.skills.join(', ') : (volunteer.skills || ''),
        availability: volunteer.availability || '',
        status: volunteer.status || 'active',
        assignedProject: volunteer.assignedProject || null
      })]);
      if (error) { logError("Database operation error", error); throw error; }
      return id;
    },
    updateVolunteer: async (id: string, volunteer: Partial<Volunteer>): Promise<void> => {
      const updateData = { ...volunteer };
      if (volunteer.skills !== undefined) {
        updateData.skills = Array.isArray(volunteer.skills) ? volunteer.skills.join(', ') : (volunteer.skills || '') as any;
      }
      const { error } = await supabase.from('volunteers').update(toDB(updateData)).eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    },
    deleteVolunteer: async (id: string): Promise<void> => {
      const { error } = await supabase.from('volunteers').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    }
  },

  // 6. Blog
  blog: {
    getBlogPosts: async (publishedOnly: boolean = false): Promise<BlogPost[]> => {
      let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
      if (publishedOnly) {
        query = query.eq('published', true);
      }
      const { data, error } = await query;
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(b => {
        const item = fromDB(b);
        return {
          ...item,
          published: Boolean(b.published),
          publishedAt: Number(b.published_at)
        };
      }) as BlogPost[];
    },
    getBlogPostBySlug: async (slug: string): Promise<BlogPost | null> => {
      const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
      if (error) return null;
      const item = fromDB(data);
      return {
        ...item,
        published: Boolean(data.published),
        publishedAt: Number(data.published_at)
      } as BlogPost;
    },
    getBlogPostById: async (id: string): Promise<BlogPost | null> => {
      const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
      if (error) return null;
      const item = fromDB(data);
      return {
        ...item,
        published: Boolean(data.published),
        publishedAt: Number(data.published_at)
      } as BlogPost;
    },
    createBlogPost: async (post: Omit<BlogPost, 'id' | 'slug'>): Promise<string> => {
      const id = generateId();
      const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + id.substring(0, 4);
      const { error } = await supabase.from('blog_posts').insert([toDB({
        id,
        slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage || null,
        published: post.published || false,
        authorId: post.authorId,
        authorName: post.authorName || '',
        publishedAt: Date.now()
      })]);
      if (error) { logError("Database operation error", error); throw error; }
      return id;
    },
    updateBlogPost: async (id: string, post: Partial<BlogPost>): Promise<void> => {
      const { error } = await supabase.from('blog_posts').update(toDB(post)).eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    },
    deleteBlogPost: async (id: string): Promise<void> => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    }
  },

  // 7. Testimonials
  testimonials: {
    getTestimonials: async (approvedOnly: boolean = false): Promise<Testimonial[]> => {
      let query = supabase.from('testimonials').select('*');
      if (approvedOnly) {
        query = query.eq('approved', true);
      }
      const { data, error } = await query;
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(t => {
        const item = fromDB(t);
        return {
          ...item,
          approved: Boolean(t.approved)
        };
      }) as Testimonial[];
    },
    createTestimonial: async (t: Omit<Testimonial, 'id'>): Promise<string> => {
      const id = generateId();
      const { error } = await supabase.from('testimonials').insert([toDB({
        id,
        name: t.name,
        role: t.role,
        content: t.content,
        photoURL: t.photoURL || null,
        approved: t.approved || false
      })]);
      if (error) { logError("Database operation error", error); throw error; }
      return id;
    },
    updateTestimonial: async (id: string, t: Partial<Testimonial>): Promise<void> => {
      const { error } = await supabase.from('testimonials').update(toDB(t)).eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    },
    deleteTestimonial: async (id: string): Promise<void> => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    }
  },

  // 8. Settings
  settings: {
    getSettings: async (): Promise<Settings> => {
      let dbData: any = null;
      try {
        // Fetch the most recent settings record
        const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        if (!error && data) {
          dbData = data;
        }
      } catch (err) {
        console.warn('[Settings Loading Fallback] Could not fetch settings from Supabase, relying on cache:', err);
      }

      let localData: any = {};
      try {
        const cached = localStorage.getItem('nncm_offline_settings');
        if (cached) {
          localData = JSON.parse(cached);
        }
      } catch (e) {
        console.warn('[Settings Loading Fallback] LocalStorage settings read error:', e);
      }

      const item = dbData ? fromDB(dbData) : {};
      
      // Merge: database is baseline, if data exists in DB it should be the source of truth
      const mergedOrgName = item.organizationName || item.orgName || localData.orgName || localData.organizationName || 'New Nature In Christ Ministry';
      const mergedOrgLogo = item.organizationLogo || item.orgLogo || localData.orgLogo || localData.organizationLogo || '';
      const mergedEmail = item.email || item.orgEmail || localData.email || localData.orgEmail || 'richiefa88@gmail.com';
      const mergedPhone = item.phone || item.orgPhone || localData.phone || localData.orgPhone || '+265 882404093';
      const mergedAddress = item.address || item.orgAddress || localData.address || localData.orgAddress || 'Zomba, Malawi';
      const mergedKoboApiUrl = item.koboApiUrl || localData.koboApiUrl || '';
      const mergedKoboToken = item.koboToken || localData.koboToken || '';
      const mergedKoboFormId = item.koboFormId || localData.koboFormId || '';
      const mergedKoboLastSyncAt = item.koboLastSyncAt ? Number(item.koboLastSyncAt) : (localData.koboLastSyncAt !== undefined ? Number(localData.koboLastSyncAt) : 0);
      
      const mergedVision = item.vision || localData.vision || 'To reach the whole world with the word of Christ Jesus, and systematic preaching and teaching the word of God in the power of the Holy Spirit, and ensuring that our members are living according to God’s original plan.';
      const mergedMission = item.mission || localData.mission || 'Preaching and teaching Christ where the name of the Lord has never been heard (Romans 15:20)';
      const mergedMotto = item.motto || localData.motto || 'NNC- Christ minded generation';
      
      const mergedFacebook = item.facebookUrl || localData.facebookUrl || 'https://facebook.com/new_nature_in_christ_ministry';
      const mergedTwitter = item.twitterUrl || localData.twitterUrl || 'https://twitter.com/new_nature_in_christ_ministry';
      const mergedYoutube = item.youtubeUrl || localData.youtubeUrl || 'https://youtube.com/new_nature_in_christ_ministry';
      const mergedInstagram = item.instagramUrl || localData.instagramUrl || 'https://instagram.com/new_nature_in_christ_ministry';

      let rawAbout = item.orgAbout || localData.orgAbout || '';
      let aboutStr = '';
      if (rawAbout) {
        if (typeof rawAbout === 'object') {
          aboutStr = rawAbout.content || JSON.stringify(rawAbout);
        } else {
          aboutStr = String(rawAbout);
        }
      }

      return {
        id: item.id || 1,
        orgName: mergedOrgName,
        organizationName: mergedOrgName,
        orgLogo: mergedOrgLogo,
        organizationLogo: mergedOrgLogo,
        orgAbout: aboutStr,
        email: mergedEmail,
        orgEmail: mergedEmail,
        phone: mergedPhone,
        orgPhone: mergedPhone,
        address: mergedAddress,
        orgAddress: mergedAddress,
        koboApiUrl: mergedKoboApiUrl,
        koboToken: mergedKoboToken,
        koboFormId: mergedKoboFormId,
        koboLastSyncAt: mergedKoboLastSyncAt,
        vision: mergedVision,
        mission: mergedMission,
        motto: mergedMotto,
        facebookUrl: mergedFacebook,
        twitterUrl: mergedTwitter,
        youtubeUrl: mergedYoutube,
        instagramUrl: mergedInstagram
      } as unknown as Settings;
    },
    updateSettings: async (settings: Partial<Settings>): Promise<void> => {
      // 1. Immediately cache the updates in localStorage to guarantee real-time updates and perfect reliability across pages even on failure
      try {
        const cached = localStorage.getItem('nncm_offline_settings');
        const existing = cached ? JSON.parse(cached) : {};
        const updated = { ...existing, ...settings };

        // Ensure key consistency for internal localData
        if (settings.organizationName !== undefined) updated.orgName = settings.organizationName;
        if (settings.organizationLogo !== undefined) updated.orgLogo = settings.organizationLogo;

        localStorage.setItem('nncm_offline_settings', JSON.stringify(updated));
      } catch (locErr) {
        console.warn('[Settings Local Sync] LocalStorage update failed:', locErr);
      }

      // Convert keys to backend database compatible snake_case fields
      const dbSettings: any = {};
      
      const incomingOrgName = settings.orgName || settings.organizationName;
      if (incomingOrgName !== undefined) dbSettings.organizationName = incomingOrgName;

      const incomingOrgLogo = settings.orgLogo || settings.organizationLogo;
      if (incomingOrgLogo !== undefined) dbSettings.organizationLogo = incomingOrgLogo;

      if (settings.orgAbout !== undefined) dbSettings.orgAbout = settings.orgAbout;
      
      const incomingEmail = settings.email || settings.orgEmail;
      if (incomingEmail !== undefined) dbSettings.email = incomingEmail;
      
      const incomingPhone = settings.phone || settings.orgPhone;
      if (incomingPhone !== undefined) dbSettings.phone = incomingPhone;
      
      const incomingAddress = settings.address || settings.orgAddress;
      if (incomingAddress !== undefined) dbSettings.address = incomingAddress;

      if (settings.facebookUrl !== undefined) dbSettings.facebookUrl = settings.facebookUrl;
      if (settings.twitterUrl !== undefined) dbSettings.twitterUrl = settings.twitterUrl;
      if (settings.youtubeUrl !== undefined) dbSettings.youtubeUrl = settings.youtubeUrl;
      if (settings.instagramUrl !== undefined) dbSettings.instagramUrl = settings.instagramUrl;

      if (settings.koboApiUrl !== undefined) dbSettings.koboApiUrl = settings.koboApiUrl;
      if (settings.koboToken !== undefined) dbSettings.koboToken = settings.koboToken;
      if (settings.koboFormId !== undefined) dbSettings.koboFormId = settings.koboFormId;
      if (settings.koboLastSyncAt !== undefined) dbSettings.koboLastSyncAt = settings.koboLastSyncAt;
      if (settings.vision !== undefined) dbSettings.vision = settings.vision;
      if (settings.mission !== undefined) dbSettings.mission = settings.mission;
      if (settings.motto !== undefined) dbSettings.motto = settings.motto;

      try {
        // Try to identify the existing settings ID to avoid creating multiple records
        const { data: existing } = await supabase.from('settings').select('id').limit(1).maybeSingle();
        const idToUse = existing?.id || 1;
        
        let payload = toDB(dbSettings);
        let { error } = await supabase.from('settings').upsert({ id: idToUse, ...payload, updated_at: new Date().toISOString() });
        
        // Fallback if the Supabase database schema hasn't been updated with the newest columns
        if (error && error.message?.includes('schema cache')) {
           console.warn('[Settings Supabase Sync] Schema cache error detected, retrying without new columns...', error);
           const missingCols = ['facebook_url', 'twitter_url', 'instagram_url', 'youtube_url', 'vision', 'mission', 'motto'];
           missingCols.forEach(col => delete payload[col]);
           const fallbackResp = await supabase.from('settings').upsert({ id: idToUse, ...payload, updated_at: new Date().toISOString() });
           error = fallbackResp.error;
           if (!error) {
              toast.info("Settings saved, but some new fields failed. Please run the SQL schema update in your Supabase dashboard to support the new fields.", { duration: 8000 });
           }
        }
        
        if (error) {
          console.error('[Settings Supabase Sync] Supabase update failed:', error);
          if (error.message && (error.message.includes('permission') || error.code === '42501')) {
            toast.info("Saved locally. Cloud database sync is restricted in this session.");
            return;
          }
          throw error;
        }
        toast.success("Organization settings saved permanently.");
      } catch (err: any) {
        console.error('[Settings Safe-Fail handler] Error updating settings table:', err);
        const errorMsg = err?.message || "Check your internet connection.";
        toast.error("Could not save to cloud: " + errorMsg);
      }
    }
  },

  // 9. Reports
  reports: {
    getReports: async () => {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(r => {
        const item = fromDB(r);
        return {
          ...item,
          createdAt: Number(r.created_at)
        };
      });
    },
    createReport: async (report: any) => {
      const id = generateId();
      const { error } = await supabase.from('reports').insert([toDB({
        id,
        title: report.title,
        type: report.type,
        date: report.date,
        size: report.size,
        url: report.url || null,
        createdAt: Date.now()
      })]);
      if (error) { logError("Database operation error", error); throw error; }
      return id;
    },
    deleteReport: async (id: string) => {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    }
  },

  // 10. Auth Profiles
  auth: {
    getUserProfile: async (uid: string): Promise<User | null> => {
      const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single();
      if (error) return null;
      const item = fromDB(data);
      return {
        ...item,
        createdAt: Number(data.created_at)
      } as User;
    },
    createUserProfile: async (uid: string, profile: Partial<User>): Promise<void> => {
      const id = generateId();
      const { error } = await supabase.from('users').upsert(toDB({
        id,
        uid,
        email: profile.email || '',
        name: profile.name || '',
        role: profile.role || 'staff',
        status: 'active',
        createdAt: Date.now()
      }));
      if (error) { logError("Database operation error", error); throw error; }
    },
    getAllProfiles: async (): Promise<User[]> => {
      const { data, error } = await supabase.from('users').select('*').order('name');
      if (error) { logError("Database fetch error", error); return []; }
      return (data || []).map(u => ({
        ...fromDB(u),
        createdAt: Number(u.created_at)
      })) as User[];
    },
    deleteUserProfile: async (id: string): Promise<void> => {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) { logError("Database operation error", error); throw error; }
    }
  },
  
  // 11. Custom church integration module
  church: {
    gallery: {
      getAll: async (): Promise<any[]> => {
        const candidateTables = ['gallery', 'nncm_gallery', 'gallery_images'];
        let lastError = null;
        for (const table of candidateTables) {
          try {
            const { data, error } = await supabase.from(table).select('*');
            if (!error && data) {
              return data.map(item => ({
                id: item.id || String(item.created_at || Math.random()),
                title: item.title || 'Untitled Image',
                description: item.description || '',
                url: item.url || item.image_url || '',
                category: item.category || 'Sunday Service',
                createdAt: typeof item.created_at === 'number' ? item.created_at : 
                           item.created_at ? new Date(item.created_at).getTime() : Date.now()
              }));
            }
            if (error && error.code !== '42P01') {
              lastError = error;
            }
          } catch (e) {
            console.error(`[Supabase Bridge] Failed reading from ${table}:`, e);
          }
        }
        if (lastError) {
          console.error('[Supabase Bridge] Gallery fetch error:', lastError);
        }
        throw new Error('Gallery table not accessible in Supabase');
      },
      create: async (img: any): Promise<string> => {
        const id = generateId();
        const candidateTables = ['gallery', 'nncm_gallery', 'gallery_images'];
        for (const table of candidateTables) {
          try {
            const payload = {
              id,
              title: img.title,
              description: img.description || '',
              url: img.url,
              category: img.category || 'Sunday Service',
              created_at: new Date().toISOString()
            };
            const { error } = await supabase.from(table).insert([payload]);
            if (!error) return id;
          } catch (e) {
            console.error(`[Supabase Bridge] Insert failed into ${table}:`, e);
          }
        }
        throw new Error('No writable gallery table found in Supabase');
      },
      delete: async (id: string): Promise<void> => {
        const candidateTables = ['gallery', 'nncm_gallery', 'gallery_images'];
        for (const table of candidateTables) {
          try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (!error) return;
          } catch (e) {
            console.error(`[Supabase Bridge] Delete failed on ${table}:`, e);
          }
        }
        throw new Error('No accessible gallery table found in Supabase to delete from');
      }
    },
    sermons: {
      getAll: async (): Promise<any[]> => {
        const candidateTables = ['sermons', 'nncm_sermons'];
        let lastError = null;
        for (const table of candidateTables) {
          try {
            const { data, error } = await supabase.from(table).select('*');
            if (!error && data) {
              return data.map(item => {
                const mapped = fromDB(item);
                return {
                  ...mapped,
                  downloadsCount: Number(item.downloads_count) || 0
                };
              });
            }
            if (error && error.code !== '42P01') {
              lastError = error;
            }
          } catch (e) {
            console.error(`[Supabase Bridge] Failed reading from ${table}:`, e);
          }
        }
        if (lastError) {
          console.error('[Supabase Bridge] Sermons fetch error:', lastError);
        }
        throw new Error('Sermons table not accessible in Supabase');
      },
      create: async (sermon: any): Promise<string> => {
        const id = 'serm-' + Math.random().toString(36).substring(2, 11);
        const candidateTables = ['sermons', 'nncm_sermons'];
        for (const table of candidateTables) {
          try {
            const payload = toDB({
              id,
              ...sermon,
              downloadsCount: 0,
              createdAt: Date.now()
            });
            const { error } = await supabase.from(table).insert([payload]);
            if (!error) return id;
          } catch (e) {
            console.error(`[Supabase Bridge] Sermon creation failed in ${table}:`, e);
          }
        }
        throw new Error('No writable sermons table found in Supabase');
      },
      update: async (id: string, updates: any): Promise<void> => {
        const candidateTables = ['sermons', 'nncm_sermons'];
        for (const table of candidateTables) {
          try {
            const payload = toDB(updates);
            const { error } = await supabase.from(table).update(payload).eq('id', id);
            if (!error) return;
          } catch (e) {
            console.error(`[Supabase Bridge] Sermon update failed in ${table}:`, e);
          }
        }
        throw new Error('No writable sermons table found in Supabase to update');
      },
      delete: async (id: string): Promise<void> => {
        const candidateTables = ['sermons', 'nncm_sermons'];
        for (const table of candidateTables) {
          try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (!error) return;
          } catch (e) {
            console.error(`[Supabase Bridge] Sermon deletion failed in ${table}:`, e);
          }
        }
        throw new Error('No writable sermons table found in Supabase to delete from');
      },
      incrementDownload: async (id: string): Promise<void> => {
        const candidateTables = ['sermons', 'nncm_sermons'];
        for (const table of candidateTables) {
          try {
            const { data, error: selectErr } = await supabase.from(table).select('downloads_count').eq('id', id).single();
            if (!selectErr && data) {
              const current = Number(data.downloads_count) || 0;
              const { error: updateErr } = await supabase.from(table).update({ downloads_count: current + 1 }).eq('id', id);
              if (!updateErr) return;
            }
          } catch (e) {
            console.error(`[Supabase Bridge] Downloads increment failed in ${table}:`, e);
          }
        }
      }
    },
    events: {
      getAll: async (): Promise<any[]> => {
        const candidateTables = ['events', 'nncm_events', 'church_events'];
        let lastError = null;
        for (const table of candidateTables) {
          try {
            const { data, error } = await supabase.from(table).select('*');
            if (!error && data) {
              return data.map(item => {
                const mapped = fromDB(item);
                return {
                  ...mapped,
                  registeredCount: Number(item.registered_count) || 0,
                  registrationOpen: Boolean(item.registration_open)
                };
              });
            }
            if (error && error.code !== '42P01') {
              lastError = error;
            }
          } catch (e) {
            console.error(`[Supabase Bridge] Failed reading from ${table}:`, e);
          }
        }
        if (lastError) {
          console.error('[Supabase Bridge] Events fetch error:', lastError);
        }
        throw new Error('Events table not accessible in Supabase');
      },
      create: async (evt: any): Promise<string> => {
        const id = 'evt-' + Math.random().toString(36).substring(2, 11);
        const candidateTables = ['events', 'nncm_events', 'church_events'];
        for (const table of candidateTables) {
          try {
            const payload = toDB({
              id,
              ...evt,
              registeredCount: 0,
              createdAt: Date.now()
            });
            const { error } = await supabase.from(table).insert([payload]);
            if (!error) return id;
          } catch (e) {
            console.error(`[Supabase Bridge] Event creation failed in ${table}:`, e);
          }
        }
        throw new Error('No writable events table found in Supabase');
      },
      update: async (id: string, updates: any): Promise<void> => {
        const candidateTables = ['events', 'nncm_events', 'church_events'];
        for (const table of candidateTables) {
          try {
            const payload = toDB(updates);
            const { error } = await supabase.from(table).update(payload).eq('id', id);
            if (!error) return;
          } catch (e) {
            console.error(`[Supabase Bridge] Event update failed in ${table}:`, e);
          }
        }
        throw new Error('No writable events table found in Supabase to update');
      },
      delete: async (id: string): Promise<void> => {
        const candidateTables = ['events', 'nncm_events', 'church_events'];
        for (const table of candidateTables) {
          try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (!error) return;
          } catch (e) {
            console.error(`[Supabase Bridge] Event deletion failed in ${table}:`, e);
          }
        }
        throw new Error('No writable events table found in Supabase to delete from');
      },
      register: async (id: string): Promise<void> => {
        const candidateTables = ['events', 'nncm_events', 'church_events'];
        for (const table of candidateTables) {
          try {
            const { data, error: selectErr } = await supabase.from(table).select('registered_count').eq('id', id).single();
            if (!selectErr && data) {
              const current = Number(data.registered_count) || 0;
              const { error: updateErr } = await supabase.from(table).update({ registered_count: current + 1 }).eq('id', id);
              if (!updateErr) return;
            }
          } catch (e) {
            console.error(`[Supabase Bridge] Event registration failed in ${table}:`, e);
          }
        }
      }
    }
  }
};
