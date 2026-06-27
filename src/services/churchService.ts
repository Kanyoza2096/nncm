import { 
  Sermon, 
  ChurchEvent, 
  MinistryGroup, 
  PrayerCenterRequest, 
  CounselingRequest, 
  Devotional, 
  LibraryResource, 
  MemberProfile, 
  AttendanceCheckIn,
  GalleryImage
} from '../types';
import { shouldUseSupabase } from '../lib/supabase';
import { supabaseService } from './supabaseService';

const KEYS = {
  SERMONS: 'nncm_sermons',
  EVENTS: 'nncm_events',
  MINISTRIES: 'nncm_ministries',
  PRAYERS: 'nncm_prayers',
  COUNSELING: 'nncm_counseling',
  DEVOTIONALS: 'nncm_devotionals',
  LIBRARY: 'nncm_library',
  MEMBERS: 'nncm_members',
  ATTENDANCE: 'nncm_attendance',
  GALLERY: 'nncm_gallery'
};

// Initial Seed Data
const initialSermons: Sermon[] = [
  {
    id: 'serm-1',
    title: 'Walking in Your New Creation Identity',
    pastor: 'Pastor Richie Mkandawire',
    category: 'Sunday Service',
    date: '2026-06-14',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder embed
    audioUrl: '#',
    notes: 'Key scriptures: 2 Cor 5:17, Gal 2:20, Rom 8:1. 1. Old things are completely passed away. 2. You possess the very nature of God now. 3. Walking in power, authority, and love is your natural spiritual state.',
    excerpt: 'Discover the profound truths of 2 Corinthians 5:17 and how navigating daily challenges as a new creation changes everything.',
    coverImage: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    downloadsCount: 142
  },
  {
    id: 'serm-2',
    title: 'Unshakable Faith in Trial Seasons',
    pastor: 'Pastor Mercy Mkandawire',
    category: 'Midweek Service',
    date: '2526-06-10',
    audioUrl: '#',
    notes: 'Key scriptures: James 1:2-4, Heb 11:1, Isaiah 43:2. Faith does not deny the trial, it supersedes it.',
    excerpt: 'An empowering service encouraging believers to anchor their souls in the immutable promises of God during turbulent financial or emotional storms.',
    coverImage: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80',
    downloadsCount: 88
  },
  {
    id: 'serm-3',
    title: 'Raising the Gideon Generation',
    pastor: 'Pastor Caleb Banda',
    category: 'Youth',
    date: '2026-06-07',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    excerpt: 'Mobilizing youth in Zomba to step out of hiding, overcome insecurity, and embrace God’s call to transform the nation.',
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    downloadsCount: 195
  },
  {
    id: 'serm-4',
    title: 'Zomba Deliverance Festival - Night of Miracles',
    pastor: 'Pastor Richie Mkandawire',
    category: 'Crusade',
    date: '2026-05-24',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    excerpt: 'Witness high-definition praise, healing testimonies, and the practical manifestation of God’s liberating grace.',
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
    downloadsCount: 312
  }
];

const initialEvents: ChurchEvent[] = [
  {
    id: 'evt-1',
    title: 'Zomba Youth Fire Conference 2026',
    description: 'An explosive weekend conference empowering youths, students, and young professionals with spiritual warfare keys, career mentoring, and leadership tools. Register now to reserve your seat!',
    category: 'Conference',
    date: '2026-07-15',
    time: '08:30 AM - 04:00 PM',
    location: 'NNCM Main Auditorium, Zomba',
    registrationOpen: true,
    registeredCount: 340,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'evt-2',
    title: 'National Healing & Deliverance Crusade',
    description: 'Three nights of specialized prayers, prophetic counseling, salvation, and miracle breakthroughs. Bring the sick, the oppressed, and all seekers of divine transformation.',
    category: 'Crusade',
    date: '2026-08-20',
    time: '04:30 PM - 09:00 PM',
    location: 'Zomba Community Ground',
    registrationOpen: false,
    registeredCount: 1205,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'evt-3',
    title: 'Weekly Interactive Bible Exposition',
    description: 'Join Pastor Richie as we systematically dissect scriptures, answering difficult theological and practical questions. Perfect for deep spiritual rooting.',
    category: 'Bible Study',
    date: '2026-06-24',
    time: '05:30 PM - 07:00 PM',
    location: 'NNCM Fellowship Hall & Zoom Link',
    registrationOpen: true,
    registeredCount: 88,
    image: 'https://images.unsplash.com/photo-1504052434569-70ad083e0b77?auto=format&fit=crop&w=800&q=80'
  }
];

const initialMinistries: MinistryGroup[] = [
  {
    id: 'min-children',
    name: "Children's Ministry (NNCM Kids)",
    description: 'Nurturing the youngest disciples in a safe, fun, and spirit-filled environment. Weekly engaging sermons, memory verses, and biblically-themed arts and crafts.',
    leaders: ['Sister Sandra Phiri', 'Auntie Martha Gondwe'],
    membersCount: 120,
    featuredImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'children@nncm-church.org'
  },
  {
    id: 'min-youth',
    name: 'Youth Ministry (Nature Shakers)',
    description: 'Dynamic, passionate, and mission-oriented youth community tackling modern lifestyles, academic pursuit, and relational boundaries with the fire of the Holy Spirit.',
    leaders: ['Pastor Caleb Banda', 'Minister John Chiumia'],
    membersCount: 210,
    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a004b0db644?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'youth@nncm-church.org'
  },
  {
    id: 'min-women',
    name: "Women's Ministry (Daughters of Grace)",
    description: 'Empowering women to lead excellent lives as wives, mothers, business leaders, and spiritual pillars of the tabernacle. Hosts seasonal retreat assemblies.',
    leaders: ['Pastor Mrs. Mercy Mkandawire', 'Deaconess Joyce Phiri'],
    membersCount: 185,
    featuredImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'women@nncm-church.org'
  },
  {
    id: 'min-men',
    name: "Men's Fellowship (Kingdom Pillars)",
    description: 'Encouraging men to bear executive leadership in the home, excel in local enterprise, support church building projects, and cultivate rich brotherhood accountability.',
    leaders: ['Elder John Banda', 'Brother David Mwale'],
    membersCount: 140,
    featuredImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'men@nncm-church.org'
  },
  {
    id: 'min-worship',
    name: 'Worship Team (NNCM Voices)',
    description: 'A team of dedicated singers and musicians ushering the congregation into standard-def praise and deep, heart-warming adoration before the Throne of Grace.',
    leaders: ['Pastor Caleb Banda', 'Brother David Phiri'],
    membersCount: 45,
    featuredImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'worship@nncm-church.org'
  },
  {
    id: 'min-prayer',
    name: 'Prayer & Intercessory Team',
    description: 'The engine room of NNCM. Standing in the gap with fasting, weekly prayer chains, running the Prayer Wall, and releasing covering over church leaders and ministries.',
    leaders: ['Sister Martha Chirwa', 'Brother Paul Chunga'],
    membersCount: 38,
    featuredImage: 'https://images.unsplash.com/photo-1445620466293-d631639f714c?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'intercessors@nncm-church.org'
  }
];

const initialDevotionals: Devotional[] = [
  {
    id: 'dev-1',
    date: '2026-06-21',
    title: 'The Reality of the New Nature',
    scripture: '2 Corinthians 5:17',
    scriptureText: '"Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new."',
    reflection: 'What does it mean to be a new creation? It means your spirit has undergone a complete, divine rebirth. You are not a patched-up version of your old self. The old record of failure, guilt, and generational bondage has been completely erased. You have been infused with the very life (Zoe) and righteousness of God. When you wake up, recognize that you are navigating the day not in your fleshly strength, but in your new Christ-nature. Speak victory over your business, your health, and your family.',
    prayer: 'Heavenly Father, I thank Your grace for the exchange at the cross of Calvary. I believe that I am a brand new creation in Christ Jesus today. I declare that the power of sin, sickness, and poverty is broken over my life. I step out in confidence and walk in my new, divine identity. In Jesus’ Name, Amen!'
  },
  {
    id: 'dev-2',
    date: '2026-06-22',
    title: 'Walking in Quiet Assurance',
    scripture: 'Psalm 23:1-2',
    scriptureText: '"The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters."',
    reflection: 'The world often rushes under stress, anxiety, and panic. However, your Great Shepherd leads with peace and perfect provision. To lie down in green pastures represents trust in his timing and supply. When thoughts of inadequacy prompt worry, remember who is leading you today. Relax and declare: "Because the Lord is my Shepherd, I am thoroughly supplied, shielded, and safe."',
    prayer: 'Loving Father, I yield my plans and my worries to Your great care today. Guide my steps. Lead me away from noisy confusion and establish me beside still waters of peace. Thank You for meeting all my financial, physical, and spiritual needs. Amen!'
  }
];

const initialLibrary: LibraryResource[] = [
  {
    id: 'lib-1',
    title: 'Kingdom Financial Stewardship Blueprint',
    author: 'Pastor Richie Mkandawire',
    category: 'Book',
    fileSize: '3.1 MB',
    fileType: 'pdf',
    downloadUrl: '#',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
    description: 'A comprehensive study on the spiritual laws of tithing, corporate giving, personal budgeting, and breaking poverty mindsets under Malawian and African economies.'
  },
  {
    id: 'lib-2',
    title: 'Discipleship 101: Foundation Course Manual',
    author: 'NNCM Christian Education Board',
    category: 'Bible Study Outline',
    fileSize: '1.8 MB',
    fileType: 'pdf',
    downloadUrl: '#',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=300&q=80',
    description: 'The mandatory foundation guide for new converts and members covering Water Baptism, Holy Spirit baptism, Scriptural integrity, prayer foundations, and sharing your faith.'
  },
  {
    id: 'lib-3',
    title: '7 Keys to Dynamic and Prevailing Prayer',
    author: 'Pastor Mrs. Mercy Mkandawire',
    category: 'Devotional Material',
    fileSize: '850 KB',
    fileType: 'pdf',
    downloadUrl: '#',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
    description: 'A practical, field-tested prayer manual unlocking the dynamics of alignment, authority, pleading the blood, and standing resilient in warfare intercession.'
  }
];

const initialPrayers: PrayerCenterRequest[] = [
  {
    id: 'pray-1',
    name: 'Sister Brenda Mwale',
    isAnonymous: false,
    requestText: 'Please stand with me in praying for my mother who is undergoing surgery in Zomba Central Hospital. We declare complete divine healing over her body.',
    category: 'Healing',
    prayerCount: 22,
    isPraiseReport: false,
    status: 'approved',
    createdAt: Date.now() - 36 * 3600000
  },
  {
    id: 'pray-2',
    isAnonymous: true,
    requestText: 'Faced with multiple rental debts and business failures. Asking God for an immediate financial door-opening and favor with my landlord in Chinangwa.',
    category: 'Financial Provision',
    prayerCount: 15,
    isPraiseReport: false,
    status: 'approved',
    createdAt: Date.now() - 12 * 3600000
  },
  {
    id: 'pray-3',
    name: 'Brother Thomas Gondwe',
    isAnonymous: false,
    requestText: 'PRAISE REPORT! Last month I asked for prayers for my university admissions. I have been accepted into the University of Malawi (Chancellor College) with a full government bursary! God is faithful!',
    category: 'Spiritual Growth',
    prayerCount: 10,
    isPraiseReport: true,
    status: 'approved',
    createdAt: Date.now() - 4 * 3600000
  }
];

const initialCounseling: CounselingRequest[] = [
  {
    id: 'couns-1',
    memberName: 'Chikondi Phiri',
    memberEmail: 'chikondi@example.com',
    phone: '+265888222111',
    topic: 'Family & Marriage',
    preferredDate: '2026-06-25',
    preferredTime: '10:00 AM',
    notes: 'My wife and I would love to meet Pastor Richie or Pastor Mrs. Mkandawire for pre-marital blessing counseling and relational advice.',
    status: 'pending',
    createdAt: Date.now()
  }
];

const initialMembers: MemberProfile[] = [
  {
    id: 'mem-1',
    userId: 'usr_member',
    name: 'George Kumwenda',
    email: 'member@example.com',
    phone: '+265999121212',
    baptized: true,
    baptismDate: '2025-12-25',
    familyGroup: 'Lumbadzi Fellowship Wing',
    joinedMinistries: ['min-youth', 'min-worship'],
    attendanceQRSecret: 'nncm_qr_mem_1',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  }
];

const initialAttendance: AttendanceCheckIn[] = [
  {
    id: 'att-1',
    memberId: 'mem-1',
    memberName: 'George Kumwenda',
    type: 'Service',
    targetId: 'serm-1',
    targetName: 'Sunday Celebration Service (DMC Campus)',
    checkInTime: Date.now() - 2 * 3600000
  }
];

const initialGallery: GalleryImage[] = [
  {
    id: 'gal-1',
    url: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=1200&q=80',
    title: 'Sunday Morning Worship',
    category: 'Sunday Service',
    createdAt: Date.now() - 5 * 24 * 3600 * 1000
  },
  {
    id: 'gal-2',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    title: 'Leadership Strategy Meeting',
    category: 'Fellowship & Meetings',
    createdAt: Date.now() - 10 * 24 * 3600 * 1000
  },
  {
    id: 'gal-3',
    url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80',
    title: 'Youth Choir Ministry Rehearsal',
    category: 'Youth',
    createdAt: Date.now() - 14 * 24 * 3600 * 1000
  },
  {
    id: 'gal-4',
    url: 'https://images.unsplash.com/photo-1481142512143-6dfac66be189?auto=format&fit=crop&w=1200&q=80',
    title: 'Community Outreach Service',
    category: 'Crusade & Outreaches',
    createdAt: Date.now() - 20 * 24 * 3600 * 1000
  }
];

// Helper to safely get or set local lists
function getList<T>(key: string, initial: T[]): T[] {
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn('Failed parsing cached list for ' + key);
    }
  }
  const disableMock = localStorage.getItem('nncm_disable_mock_seeds') !== 'false'; // defaults to true (clean slate)
  const finalInitial = disableMock ? [] : initial;
  localStorage.setItem(key, JSON.stringify(finalInitial));
  return finalInitial;
}

function saveList<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const churchService = {
  // 1. Sermons
  sermons: {
    getAll: async (): Promise<Sermon[]> => {
      if (shouldUseSupabase()) {
        try {
          console.log('[Supabase Bridge] Fetching sermons...');
          return await supabaseService.church.sermons.getAll();
        } catch (e) {
          console.warn('[Supabase Bridge] Fallback to local storage for sermons:', e);
        }
      }
      const list = getList(KEYS.SERMONS, initialSermons);
      return [...list].sort((a, b) => b.date.localeCompare(a.date));
    },
    getById: async (id: string): Promise<Sermon | null> => {
      if (shouldUseSupabase()) {
        try {
          const list = await supabaseService.church.sermons.getAll();
          return list.find(s => s.id === id) || null;
        } catch (e) {
          console.warn('[Supabase Bridge] Fallback to local storage for getById:', e);
        }
      }
      const list = getList(KEYS.SERMONS, initialSermons);
      return list.find(s => s.id === id) || null;
    },
    create: async (sermon: Omit<Sermon, 'id' | 'downloadsCount'>): Promise<string> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.sermons.create(sermon);
        } catch (e) {
          console.error('[Supabase Bridge] Creating sermon failed, trying local storage:', e);
        }
      }
      const list = getList(KEYS.SERMONS, initialSermons);
      const id = 'serm-' + Math.random().toString(36).substring(2, 11);
      const newItem: Sermon = { ...sermon, id, downloadsCount: 0 };
      list.unshift(newItem);
      saveList(KEYS.SERMONS, list);
      return id;
    },
    update: async (id: string, updates: Partial<Sermon>): Promise<void> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.sermons.update(id, updates);
        } catch (e) {
          console.error('[Supabase Bridge] Updating sermon failed, trying local storage:', e);
        }
      }
      const list = getList(KEYS.SERMONS, initialSermons);
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        saveList(KEYS.SERMONS, list);
      }
    },
    delete: async (id: string): Promise<void> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.sermons.delete(id);
        } catch (e) {
          console.error('[Supabase Bridge] Deleting sermon failed, trying local storage:', e);
        }
      }
      const list = getList(KEYS.SERMONS, initialSermons);
      const filtered = list.filter(s => s.id !== id);
      saveList(KEYS.SERMONS, filtered);
    },
    incrementDownload: async (id: string): Promise<void> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.sermons.incrementDownload(id);
        } catch (e) {
          console.warn('[Supabase Bridge] sermon download increment fallback:', e);
        }
      }
      const list = getList(KEYS.SERMONS, initialSermons);
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx].downloadsCount += 1;
        saveList(KEYS.SERMONS, list);
      }
    }
  },

  // 2. Events
  events: {
    getAll: async (): Promise<ChurchEvent[]> => {
      if (shouldUseSupabase()) {
        try {
          console.log('[Supabase Bridge] Fetching events...');
          return await supabaseService.church.events.getAll();
        } catch (e) {
          console.warn('[Supabase Bridge] Fallback to local storage for events:', e);
        }
      }
      return getList(KEYS.EVENTS, initialEvents);
    },
    create: async (evt: Omit<ChurchEvent, 'id' | 'registeredCount'>): Promise<string> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.events.create(evt);
        } catch (e) {
          console.error('[Supabase Bridge] Event creation in Supabase failed:', e);
        }
      }
      const list = getList(KEYS.EVENTS, initialEvents);
      const id = 'evt-' + Math.random().toString(36).substring(2, 11);
      const newItem: ChurchEvent = { ...evt, id, registeredCount: 0 };
      list.unshift(newItem);
      saveList(KEYS.EVENTS, list);
      return id;
    },
    update: async (id: string, updates: Partial<ChurchEvent>): Promise<void> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.events.update(id, updates);
        } catch (e) {
          console.error('[Supabase Bridge] Event update in Supabase failed:', e);
        }
      }
      const list = getList(KEYS.EVENTS, initialEvents);
      const idx = list.findIndex(e => e.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        saveList(KEYS.EVENTS, list);
      }
    },
    delete: async (id: string): Promise<void> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.events.delete(id);
        } catch (e) {
          console.error('[Supabase Bridge] Event deletion in Supabase failed:', e);
        }
      }
      const list = getList(KEYS.EVENTS, initialEvents);
      const filtered = list.filter(e => e.id !== id);
      saveList(KEYS.EVENTS, filtered);
    },
    register: async (id: string): Promise<void> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.events.register(id);
        } catch (e) {
          console.warn('[Supabase Bridge] Event registration fallback:', e);
        }
      }
      const list = getList(KEYS.EVENTS, initialEvents);
      const idx = list.findIndex(e => e.id === id);
      if (idx !== -1) {
        list[idx].registeredCount += 1;
        saveList(KEYS.EVENTS, list);
      }
    }
  },

  // 3. Ministries
  ministries: {
    getAll: async (): Promise<MinistryGroup[]> => getList(KEYS.MINISTRIES, initialMinistries),
    create: async (ministry: Omit<MinistryGroup, 'id' | 'membersCount'>): Promise<string> => {
      const list = getList(KEYS.MINISTRIES, initialMinistries);
      const id = 'min-' + Math.random().toString(36).substring(2, 11);
      const newItem: MinistryGroup = { ...ministry, id, membersCount: 0 };
      list.unshift(newItem);
      saveList(KEYS.MINISTRIES, list);
      return id;
    },
    update: async (id: string, updates: Partial<MinistryGroup>): Promise<void> => {
      const list = getList(KEYS.MINISTRIES, initialMinistries);
      const idx = list.findIndex(m => m.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        saveList(KEYS.MINISTRIES, list);
      }
    },
    delete: async (id: string): Promise<void> => {
      const list = getList(KEYS.MINISTRIES, initialMinistries);
      const filtered = list.filter(m => m.id !== id);
      saveList(KEYS.MINISTRIES, filtered);
    },
    updateCount: async (id: string, change: number): Promise<void> => {
      const list = getList(KEYS.MINISTRIES, initialMinistries);
      const idx = list.findIndex(m => m.id === id);
      if (idx !== -1) {
        list[idx].membersCount = Math.max(0, list[idx].membersCount + change);
        saveList(KEYS.MINISTRIES, list);
      }
    }
  },

  // 4. Prayer Wall & requests
  prayers: {
    getAll: async (): Promise<PrayerCenterRequest[]> => getList(KEYS.PRAYERS, initialPrayers).sort((a,b)=> b.createdAt - a.createdAt),
    submit: async (prayer: Omit<PrayerCenterRequest, 'id' | 'prayerCount' | 'status' | 'createdAt'>): Promise<string> => {
      const list = getList(KEYS.PRAYERS, initialPrayers);
      const id = 'pray-' + Math.random().toString(36).substring(2, 11);
      const newItem: PrayerCenterRequest = {
        ...prayer,
        id,
        prayerCount: 1,
        status: 'approved', // Auto-approve for preview sandbox
        createdAt: Date.now()
      };
      list.unshift(newItem);
      saveList(KEYS.PRAYERS, list);
      return id;
    },
    incrementPrayerCount: async (id: string): Promise<void> => {
      const list = getList(KEYS.PRAYERS, initialPrayers);
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx].prayerCount += 1;
        saveList(KEYS.PRAYERS, list);
      }
    },
    delete: async (id: string): Promise<void> => {
      const list = getList(KEYS.PRAYERS, initialPrayers);
      const filtered = list.filter(p => p.id !== id);
      saveList(KEYS.PRAYERS, filtered);
    }
  },

  // 5. Counseling Requests
  counseling: {
    getAll: async (): Promise<CounselingRequest[]> => getList(KEYS.COUNSELING, initialCounseling),
    request: async (req: Omit<CounselingRequest, 'id' | 'status' | 'createdAt'>): Promise<string> => {
      const list = getList(KEYS.COUNSELING, initialCounseling);
      const id = 'couns-' + Math.random().toString(36).substring(2, 11);
      const newItem: CounselingRequest = {
        ...req,
        id,
        status: 'pending',
        createdAt: Date.now()
      };
      list.unshift(newItem);
      saveList(KEYS.COUNSELING, list);
      return id;
    },
    update: async (id: string, updates: Partial<CounselingRequest>): Promise<void> => {
      const list = getList(KEYS.COUNSELING, initialCounseling);
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        saveList(KEYS.COUNSELING, list);
      }
    }
  },

  // 6. Devotionals
  devotionals: {
    getAll: async (): Promise<Devotional[]> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.devotionals.getAll();
        } catch (e) {
          console.warn('[Devotional Service] Supabase fetch failed, falling back to local:', e);
        }
      }
      const list = getList(KEYS.DEVOTIONALS, initialDevotionals);
      return list.length > 0 ? list : initialDevotionals;
    },
    getForDate: async (date: string): Promise<Devotional | null> => {
      try {
        const response = await fetch('/api/gemini/devotional');
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const dynamicDev = await response.json();
            if (dynamicDev && dynamicDev.title) {
              return dynamicDev;
            }
          } else {
            console.warn('[Devotional Service] /api/gemini/devotional returned non-JSON response:', contentType);
          }
        }
      } catch (e) {
        console.warn('[Devotional Service] Could not fetch dynamic devotional from API, trying database:', e);
      }

      if (shouldUseSupabase()) {
        try {
          const dbDev = await supabaseService.church.devotionals.getForDate(date);
          if (dbDev) return dbDev;
        } catch (e) {
          console.warn('[Devotional Service] Supabase query failed, falling back to local:', e);
        }
      }

      const list = getList(KEYS.DEVOTIONALS, initialDevotionals);
      const matched = list.find(d => d.date === date) || list[0];
      if (matched) return matched;
      
      // Hard fallback to initialDevotionals to ensure Daily Bread is ALWAYS visible in production SPA mode
      const initialMatched = initialDevotionals.find(d => d.date === date) || initialDevotionals[0];
      return initialMatched || null;
    },
    create: async (dev: Omit<Devotional, 'id'>): Promise<string> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.devotionals.create(dev);
        } catch (e) {
          console.warn('[Devotional Service] Supabase create failed, falling back to local:', e);
        }
      }
      const list = getList(KEYS.DEVOTIONALS, initialDevotionals);
      const id = 'dev-' + Math.random().toString(36).substring(2, 11);
      const newItem: Devotional = { ...dev, id };
      list.unshift(newItem);
      saveList(KEYS.DEVOTIONALS, list);
      return id;
    }
  },

  // 7. Library
  library: {
    getAll: async (): Promise<LibraryResource[]> => getList(KEYS.LIBRARY, initialLibrary),
    create: async (res: Omit<LibraryResource, 'id'>): Promise<string> => {
      const list = getList(KEYS.LIBRARY, initialLibrary);
      const id = 'lib-' + Math.random().toString(36).substring(2, 11);
      const newItem: LibraryResource = { ...res, id };
      list.unshift(newItem);
      saveList(KEYS.LIBRARY, list);
      return id;
    },
    delete: async (id: string): Promise<void> => {
      const list = getList(KEYS.LIBRARY, initialLibrary);
      const filtered = list.filter(l => l.id !== id);
      saveList(KEYS.LIBRARY, filtered);
    }
  },

  // 8. Member Profiles
  members: {
    getAll: async (): Promise<MemberProfile[]> => getList(KEYS.MEMBERS, initialMembers),
    getByUserId: async (userId: string): Promise<MemberProfile | null> => {
      const list = getList(KEYS.MEMBERS, initialMembers);
      return list.find(m => m.userId === userId) || null;
    },
    createOrUpdate: async (userId: string, data: Partial<MemberProfile>): Promise<void> => {
      const list = getList(KEYS.MEMBERS, initialMembers);
      const idx = list.findIndex(m => m.userId === userId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
      } else {
        const id = 'mem-' + Math.random().toString(36).substring(2, 11);
        const newProfile: MemberProfile = {
          id,
          userId,
          name: data.name || 'New Member',
          email: data.email || 'member@example.com',
          phone: data.phone || '',
          baptized: data.baptized || false,
          baptismDate: data.baptismDate,
          familyGroup: data.familyGroup || 'Home Fellowship Wing',
          joinedMinistries: data.joinedMinistries || [],
          attendanceQRSecret: 'nncm_qr_' + Math.random().toString(36).substring(2, 8),
          photoUrl: data.photoUrl
        };
        list.push(newProfile);
      }
      saveList(KEYS.MEMBERS, list);
    }
  },

  // 9. Attendance Check-ins
  attendance: {
    getAll: async (): Promise<AttendanceCheckIn[]> => getList(KEYS.ATTENDANCE, initialAttendance),
    checkIn: async (checkIn: Omit<AttendanceCheckIn, 'id' | 'checkInTime'>): Promise<string> => {
      const list = getList(KEYS.ATTENDANCE, initialAttendance);
      const id = 'att-' + Math.random().toString(36).substring(2, 11);
      const newItem: AttendanceCheckIn = {
        ...checkIn,
        id,
        checkInTime: Date.now()
      };
      list.unshift(newItem);
      saveList(KEYS.ATTENDANCE, list);
      return id;
    }
  },

  // 10. Gallery Images
  gallery: {
    getAll: async (): Promise<GalleryImage[]> => {
      if (shouldUseSupabase()) {
        try {
          console.log('[Supabase Bridge] Fetching gallery...');
          return await supabaseService.church.gallery.getAll();
        } catch (e) {
          console.error('[Supabase Bridge] Gallery load failed from Supabase:', e);
          return []; // Strictly return empty instead of falling back to default/mock lists
        }
      }
      return getList(KEYS.GALLERY, initialGallery);
    },
    create: async (img: Omit<GalleryImage, 'id' | 'createdAt'>): Promise<string> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.gallery.create(img);
        } catch (e) {
          console.error('[Supabase Bridge] Creating gallery record in Supabase failed:', e);
          throw e; // Fail fast rather than writing mock items to local storage
        }
      }
      const list = getList(KEYS.GALLERY, initialGallery);
      const id = 'gal-' + Math.random().toString(36).substring(2, 11);
      const newItem: GalleryImage = {
        ...img,
        id,
        createdAt: Date.now()
      };
      list.unshift(newItem);
      saveList(KEYS.GALLERY, list);
      return id;
    },
    delete: async (id: string): Promise<void> => {
      if (shouldUseSupabase()) {
        try {
          return await supabaseService.church.gallery.delete(id);
        } catch (e) {
          console.error('[Supabase Bridge] Deleting gallery record in Supabase failed:', e);
          throw e; // Fail fast rather than performing local mock updates
        }
      }
      const list = getList(KEYS.GALLERY, initialGallery);
      const filtered = list.filter(g => g.id !== id);
      saveList(KEYS.GALLERY, filtered);
    }
  }
};
