export type Role = 'visitor' | 'member' | 'pastor' | 'ministry_leader' | 'finance_officer' | 'admin' | 'super_admin' | 'staff' | 'volunteer' | 'readership' | 'secretary' | 'treasurer' | 'deacon' | 'elder';

export interface User {
  id: string;
  uid?: string; // fallback for some contexts
  name: string;
  email: string;
  whatsapp?: string;
  role: Role;
  status: 'active' | 'inactive';
  photoURL?: string;
  createdAt: number;
}

export interface Beneficiary {
  id: string;
  name: string;
  email?: string;
  category?: string;
  address?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  dob: string;
  phone: string;
  location: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | string;
  childrenCount: number;
  occupation: string;
  status: 'active' | 'inactive';
  churchGroup?: string;
  koboId?: string;
  rawKoboData?: any;
  assignedTo?: string;
  createdAt: number;
}

export interface BeneficiaryCase {
  id: string;
  beneficiaryId: string;
  caseType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  assignedTo: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: number;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  donorType: 'individual' | 'organization' | 'corporate';
  type?: string; // mapping for convenience
  totalDonations: number;
  totalDonated?: number; // mapping for convenience
  assignedTo?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName?: string;
  donorEmail?: string;
  amount: number;
  currency: string;
  notes: string;
  date: number;
  createdAt?: number;
  donationType?: string;
  paymentMethod?: string;
  assignedTo?: string;
}

export interface Project {
  id: string;
  name: string;
  title: string; // Made required to match components
  description: string;
  category: string;
  location: string;
  budget: number | string;
  targetAmount?: number; // mapping
  raised?: string | number;
  currentAmount?: number; // mapping
  status: 'active' | 'completed' | 'on-hold' | string;
  image?: string;
  images: string[]; // for multi-image project views
  startDate?: number;
  endDate?: number;
  assignedTo?: string;
  createdAt: number;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  dueDate: number;
}

export interface Expense {
  id: string;
  projectId: string;
  amount: number;
  category: string;
  description: string;
  date: number;
  approvedBy: string;
  assignedTo?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  skills: string[];
  availability: string;
  status: 'active' | 'inactive';
  assignedProject?: string;
  createdAt: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  coverImage?: string;
  published: boolean;
  authorId: string;
  authorName?: string;
  author?: { name: string; avatar?: string };
  publishedAt: number;
  createdAt: number;
  summary?: string;
  category?: string;
  imageUrl?: string;
  date?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  author?: string; // mapping
  role: string;
  content: string;
  photoURL?: string;
  approved: boolean;
  organization?: string;
  image?: string;
  rating?: number;
  status?: string;
  date: number;
}

export interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  partnerType: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  entityType: string;
  entityId?: string;
  details: string;
  createdAt: number;
}

export interface Attachment {
  id: string;
  entityType: string;
  entityId: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface Settings {
  id?: string | number;
  organizationName?: string;
  organizationLogo?: string;
  email?: string;
  phone?: string;
  address?: string;
  koboApiUrl?: string;
  koboToken?: string;
  koboFormId?: string;
  koboLastSyncAt?: number;
  orgName?: string;
  orgEmail?: string;
  orgAbout?: string;
  orgLogo?: string;
  orgPhone?: string;
  orgAddress?: string;
  vision?: string;
  mission?: string;
  motto?: string;
  tagline?: string;
  aboutText?: string;
  directorName?: string;
  directorTitle?: string;
  directorBio?: string;
  directorImage?: string;
  directorWhatsApp?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  koboAssetUid?: string;
  mapLatitude?: number;
  mapLongitude?: number;
}

export interface MonthlyFinancialReport {
  id: string;
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  reportUrl?: string;
  status: 'draft' | 'published';
  createdAt: number;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  content: string;
  date: number;
}

export interface Sermon {
  id: string;
  title: string;
  pastor: string;
  category: 'Sunday Service' | 'Midweek Service' | 'Conference' | 'Youth' | 'Crusade' | string;
  date: string;
  videoUrl?: string; // e.g. Youtube embed ID or live stream link
  audioUrl?: string;
  notes?: string;
  excerpt: string;
  coverImage: string;
  downloadsCount: number;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  category: 'Conference' | 'Crusade' | 'Prayer Meeting' | 'Bible Study' | 'Sunday Service' | string;
  date: string;
  time: string;
  location: string;
  registrationOpen: boolean;
  registeredCount: number;
  image: string;
}

export interface MinistryGroup {
  id: string;
  name: string;
  description: string;
  leaders: string[];
  membersCount: number;
  featuredImage: string;
  contactEmail: string;
}

export interface PrayerCenterRequest {
  id: string;
  name?: string; // anonymous if not specified
  isAnonymous: boolean;
  requestText: string;
  category: 'Healing' | 'Financial Provision' | 'Family' | 'Spiritual Growth' | 'Deliverance' | 'Other' | string;
  prayerCount: number;
  isPraiseReport: boolean;
  status: 'pending' | 'approved' | 'answered';
  createdAt: number;
}

export interface CounselingRequest {
  id: string;
  memberName: string;
  memberEmail: string;
  phone: string;
  topic: 'Family & Marriage' | 'Spiritual Guidance' | 'Mental Health' | 'Grief Support' | 'Financial Counseling' | 'Other' | string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: 'pending' | 'scheduled' | 'compeleted' | 'cancelled';
  assignedPastor?: string;
  remarks_feedback?: string;
  createdAt: number;
}

export interface Devotional {
  id: string;
  date: string; // YYYY-MM-DD
  scripture: string; // e.g., John 3:16
  scriptureText: string;
  title: string;
  reflection: string;
  prayer: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  category: 'Bible Study Outline' | 'Book' | 'PDF Leaflet' | 'Devotional Material' | string;
  fileSize: string;
  fileType: 'pdf' | 'doc' | 'epub' | string;
  downloadUrl: string;
  coverImage: string;
  description: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  baptized: boolean;
  baptismDate?: string;
  familyGroup?: string;
  joinedMinistries: string[]; // IDs of ministries
  attendanceQRSecret: string; // Unique seed for QR code check-in
  photoUrl?: string;
}

export interface AttendanceCheckIn {
  id: string;
  memberId: string;
  memberName: string;
  type: 'Service' | 'Ministry' | 'Event' | string;
  targetId: string; // ID of the specific service, ministry, or event
  targetName: string;
  checkInTime: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category?: string;
  createdAt: number;
}
