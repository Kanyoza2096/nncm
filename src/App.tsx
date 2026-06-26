import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { AuthProvider } from './hooks/useAuth';
import { OrgSettingsProvider } from './hooks/useOrgSettings';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/layout/PWAInstallPrompt';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import Layout from './components/layout/Layout';

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const AboutUs = lazy(() => import('./pages/public/AboutUs'));
const Sermons = lazy(() => import('./pages/public/Sermons'));
const Scriptures = lazy(() => import('./pages/public/Scriptures'));
const EventsCalendar = lazy(() => import('./pages/public/EventsCalendar'));
const Ministries = lazy(() => import('./pages/public/Ministries'));
const PrayerCenter = lazy(() => import('./pages/public/PrayerCenter'));
const OnlineGiving = lazy(() => import('./pages/public/OnlineGiving'));
const MemberRegistration = lazy(() => import('./pages/public/MemberRegistration'));
const Blog = lazy(() => import('./pages/public/Blog'));
const BlogDetail = lazy(() => import('./pages/public/BlogDetail'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Donate = lazy(() => import('./pages/public/Donate'));
const DonateThankYou = lazy(() => import('./pages/public/DonateThankYou'));
const Projects = lazy(() => import('./pages/public/Projects'));
const ProjectDetail = lazy(() => import('./pages/public/ProjectDetail'));
const Transparency = lazy(() => import('./pages/public/Transparency'));
const Volunteer = lazy(() => import('./pages/public/Volunteer'));
const Leadership = lazy(() => import('./pages/public/Leadership'));
const Gallery = lazy(() => import('./pages/public/Gallery'));

// Admin Pages (Lazy Loaded)
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Beneficiaries = lazy(() => import('./pages/admin/Beneficiaries'));
const Donors = lazy(() => import('./pages/admin/Donors'));
const Donations = lazy(() => import('./pages/admin/Donations'));
const AdminProjects = lazy(() => import('./pages/admin/Projects'));
const Expenses = lazy(() => import('./pages/admin/Expenses'));
const Volunteers = lazy(() => import('./pages/admin/Volunteers'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Users = lazy(() => import('./pages/admin/Users'));
const Health = lazy(() => import('./pages/admin/Health'));
const AIAssistant = lazy(() => import('./pages/admin/AIAssistant'));
const AdminBlog = lazy(() => import('./pages/admin/Blog'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));
const AdminSermons = lazy(() => import('./pages/admin/Sermons'));
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const Readership = lazy(() => import('./pages/admin/Readership'));

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-600/10"></div>
      <p className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] animate-pulse">Syncing Sanctuary Portal...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OrgSettingsProvider>
          <BrowserRouter>
            <Helmet>
              <title>New Nature In Christ Ministry</title>
              <meta name="description" content="Welcome to New Nature In Christ Ministry. Connect with our community, read sermons, blogs, and support our mission." />
              <meta name="keywords" content="church, ministry, Jesus Christ, faith, sermons, blogs, charity, Malawi" />
              <meta property="og:title" content="New Nature In Christ Ministry" />
              <meta property="og:description" content="Welcome to New Nature In Christ Ministry. Connect with our community, read sermons, blogs, and support our mission." />
              <meta property="og:type" content="website" />
            </Helmet>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/leadership" element={<Leadership />} />
                  <Route path="/sermons" element={<Sermons />} />
                  <Route path="/scriptures" element={<Scriptures />} />
                  <Route path="/events" element={<EventsCalendar />} />
                  <Route path="/ministries" element={<Ministries />} />
                  <Route path="/prayer" element={<PrayerCenter />} />
                  <Route path="/give" element={<Navigate to="/donate" replace />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/donate/thank-you" element={<DonateThankYou />} />
                  <Route path="/register" element={<MemberRegistration />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogDetail />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/transparency" element={<Transparency />} />
                  <Route path="/volunteer" element={<Volunteer />} />
                  <Route path="/gallery" element={<Gallery />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/staff-register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Admin Routes - Layout handles Auth protection internally */}
                <Route path="/admin" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="beneficiaries" element={<Beneficiaries />} />
                  <Route path="donors" element={<Donors />} />
                  <Route path="donations" element={<Donations />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="volunteers" element={<Volunteers />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="users" element={<Users />} />
                  <Route path="health" element={<Health />} />
                  <Route path="ai-assistant" element={<AIAssistant />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="sermons" element={<AdminSermons />} />
                  <Route path="events" element={<AdminEvents />} />
                  <Route path="gallery" element={<AdminGallery />} />
                  <Route path="readership" element={<Readership />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <PWAInstallPrompt />
            <Toaster position="top-right" richColors expand closeButton />
          </BrowserRouter>
        </OrgSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
