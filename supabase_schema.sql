-- ==========================================
-- NNCM Church Portal - Full Supabase Schema Setup
-- Use this script in the Supabase SQL Editor to initialize your database tables.
-- ==========================================

-- 1. Create Users Table (IF NOT EXISTS to prevent relation "users" already exists error)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    uid TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'visitor',
    status TEXT NOT NULL DEFAULT 'active',
    photo_url TEXT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- 2. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    location TEXT,
    budget NUMERIC DEFAULT 0,
    raised NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    image TEXT,
    start_date BIGINT,
    end_date BIGINT,
    assigned_to TEXT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- 3. Create Beneficiaries ( souls / church family registry ) Table
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    category TEXT,
    address TEXT,
    gender TEXT,
    age NUMERIC DEFAULT 0,
    dob TEXT,
    phone TEXT,
    location TEXT DEFAULT 'Unknown',
    marital_status TEXT DEFAULT 'single',
    children_count NUMERIC DEFAULT 0,
    occupation TEXT,
    status TEXT DEFAULT 'active',
    kobo_id TEXT,
    raw_kobo_data JSONB,
    assigned_to TEXT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- 4. Create Donors Table
CREATE TABLE IF NOT EXISTS public.donors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    donor_type TEXT DEFAULT 'individual',
    total_donations NUMERIC DEFAULT 0,
    assigned_to TEXT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000,
    updated_at BIGINT
);

-- 5. Create Donations Table
CREATE TABLE IF NOT EXISTS public.donations (
    id TEXT PRIMARY KEY,
    donor_id TEXT REFERENCES public.donors(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'MWK',
    notes TEXT,
    date BIGINT DEFAULT extract(epoch from now()) * 1000,
    assigned_to TEXT
);

-- 6. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date BIGINT DEFAULT extract(epoch from now()) * 1000,
    approved_by TEXT,
    assigned_to TEXT
);

-- 7. Create Volunteers Table
CREATE TABLE IF NOT EXISTS public.volunteers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT,
    skills TEXT, -- Comma-separated or single string
    availability TEXT,
    status TEXT DEFAULT 'active',
    assigned_project TEXT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- 8. Create Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    published BOOLEAN DEFAULT false,
    author_id TEXT,
    author_name TEXT,
    published_at BIGINT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- 9. Create Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    content TEXT NOT NULL,
    photo_url TEXT,
    approved BOOLEAN DEFAULT false,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);

-- 10. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY DEFAULT 1,
    organization_name TEXT DEFAULT 'New Nature In Christ Ministry',
    organization_logo TEXT,
    org_about TEXT,
    email TEXT DEFAULT 'richiefa88@gmail.com',
    phone TEXT DEFAULT '+265 882404093',
    address TEXT DEFAULT 'Zomba, Malawi',
    kobo_api_url TEXT,
    kobo_token TEXT,
    kobo_form_id TEXT,
    kobo_last_sync_at NUMERIC,
    vision TEXT,
    mission TEXT,
    motto TEXT,
    facebook_url TEXT,
    twitter_url TEXT,
    youtube_url TEXT,
    instagram_url TEXT,
    updated_at TEXT
);

-- First, alter the email column of the existing settings table (if it exists) to allow nulls
ALTER TABLE IF EXISTS public.settings ALTER COLUMN email DROP NOT NULL;

-- Safely add social columns if the settings table already exists
ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Ensure there is at least one row in settings
INSERT INTO public.settings (id, organization_name, email, phone, address)
VALUES (1, 'New Nature In Christ Ministry', 'richiefa88@gmail.com', '+265 882404093', 'Zomba, Malawi')
ON CONFLICT (id) DO NOTHING;

-- 11. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    date BIGINT DEFAULT extract(epoch from now()) * 1000,
    size TEXT,
    url TEXT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000
);


-- 12. Create Gallery Table
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'Sunday Service',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 13. Create Sermons Table
CREATE TABLE IF NOT EXISTS public.sermons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    pastor TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    video_url TEXT,
    audio_url TEXT,
    notes TEXT,
    excerpt TEXT,
    cover_image TEXT,
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 14. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    registration_open BOOLEAN DEFAULT TRUE,
    registered_count INT DEFAULT 0,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR FREE FLOW AND TO FIX PERMISSION ERRORS 
-- This completely resolves "permission denied for table" errors in development setup.
-- ==========================================

ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.beneficiaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sermons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;


-- ==========================================
-- OPTIONAL: IF YOU PREFER KEEPING RLS ENABLED, run the commands below instead to allow all access:
-- ==========================================
/*
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated read/write access policies
CREATE POLICY "Allow public select of users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert of users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of users" ON public.users FOR DELETE USING (true);

CREATE POLICY "Allow public select of projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert of projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Allow public select of beneficiaries" ON public.beneficiaries FOR SELECT USING (true);
CREATE POLICY "Allow public insert of beneficiaries" ON public.beneficiaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of beneficiaries" ON public.beneficiaries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of beneficiaries" ON public.beneficiaries FOR DELETE USING (true);

CREATE POLICY "Allow public select of donors" ON public.donors FOR SELECT USING (true);
CREATE POLICY "Allow public insert of donors" ON public.donors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of donors" ON public.donors FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of donors" ON public.donors FOR DELETE USING (true);

CREATE POLICY "Allow public select of donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Allow public insert of donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of donations" ON public.donations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of donations" ON public.donations FOR DELETE USING (true);

CREATE POLICY "Allow public select of expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert of expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of expenses" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Allow public select of volunteers" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "Allow public insert of volunteers" ON public.volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of volunteers" ON public.volunteers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of volunteers" ON public.volunteers FOR DELETE USING (true);

CREATE POLICY "Allow public select of blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert of blog_posts" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of blog_posts" ON public.blog_posts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of blog_posts" ON public.blog_posts FOR DELETE USING (true);

CREATE POLICY "Allow public select of testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public insert of testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of testimonials" ON public.testimonials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of testimonials" ON public.testimonials FOR DELETE USING (true);

CREATE POLICY "Allow public select of settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert of settings" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of settings" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of settings" ON public.settings FOR DELETE USING (true);

CREATE POLICY "Allow public select of reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert of reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update of reports" ON public.reports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete of reports" ON public.reports FOR DELETE USING (true);
*/
