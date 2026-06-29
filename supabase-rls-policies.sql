-- ==========================================
-- NNCM Church Portal - Row Level Security (RLS) Policies
-- Apply these policies to enable proper access control
-- Run this in Supabase SQL Editor
-- ==========================================

-- ENABLE RLS on all tables
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
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = uid);

-- Admins can view all user profiles
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = uid);

-- Admins can manage all users
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- PROJECTS TABLE POLICIES (Admin Only)
-- ==========================================

CREATE POLICY "Admins can view projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Public can view active projects" ON public.projects
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- BENEFICIARIES TABLE POLICIES (Admin Only)
-- ==========================================

-- Only admins and staff can access beneficiary data (sensitive personal info)
CREATE POLICY "Staff can view beneficiaries" ON public.beneficiaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage beneficiaries" ON public.beneficiaries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- DONORS TABLE POLICIES (Admin & Staff)
-- ==========================================

CREATE POLICY "Staff can view donors" ON public.donors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage donors" ON public.donors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- DONATIONS TABLE POLICIES
-- ==========================================

CREATE POLICY "Staff can view donations" ON public.donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage donations" ON public.donations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- EXPENSES TABLE POLICIES (Admin & Finance)
-- ==========================================

CREATE POLICY "Finance can view expenses" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage expenses" ON public.expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- VOLUNTEERS TABLE POLICIES
-- ==========================================

CREATE POLICY "Admins can view volunteers" ON public.volunteers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage volunteers" ON public.volunteers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- BLOG POSTS TABLE POLICIES
-- ==========================================

-- Public can read published posts
CREATE POLICY "Public can view published posts" ON public.blog_posts
  FOR SELECT USING (published = true);

-- Authors and admins can view drafts
CREATE POLICY "Authors and admins can view drafts" ON public.blog_posts
  FOR SELECT USING (
    published = true OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

-- Only admins and authors can manage
CREATE POLICY "Admins and authors can manage blog posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

-- ==========================================
-- TESTIMONIALS TABLE POLICIES
-- ==========================================

-- Public can read approved testimonials
CREATE POLICY "Public can view approved testimonials" ON public.testimonials
  FOR SELECT USING (approved = true);

-- Admins can view all
CREATE POLICY "Admins can view all testimonials" ON public.testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- Only admins can manage
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- SETTINGS TABLE POLICIES
-- ==========================================

-- Public can read settings
CREATE POLICY "Public can view settings" ON public.settings
  FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Admins can update settings" ON public.settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- GALLERY TABLE POLICIES
-- ==========================================

-- Public can view gallery
CREATE POLICY "Public can view gallery" ON public.gallery
  FOR SELECT USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage gallery" ON public.gallery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- SERMONS TABLE POLICIES
-- ==========================================

-- Public can view sermons
CREATE POLICY "Public can view sermons" ON public.sermons
  FOR SELECT USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage sermons" ON public.sermons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- EVENTS TABLE POLICIES
-- ==========================================

-- Public can view events
CREATE POLICY "Public can view events" ON public.events
  FOR SELECT USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- DEVOTIONALS TABLE POLICIES
-- ==========================================

-- Public can view devotionals
CREATE POLICY "Public can view devotionals" ON public.devotionals
  FOR SELECT USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage devotionals" ON public.devotionals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );

-- ==========================================
-- REPORTS TABLE POLICIES
-- ==========================================

-- Only admins can access reports
CREATE POLICY "Admins can manage reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.uid = auth.uid() AND u.role = 'admin'
    )
  );
