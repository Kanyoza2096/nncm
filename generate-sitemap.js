import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

// Load environment variables safely
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

async function generate() {
  // 1. Static public routes from App.tsx
  const staticRoutes = [
    '', 'about', 'leadership', 'sermons', 'scriptures', 
    'events', 'ministries', 'prayer', 'donate', 
    'register', 'blog', 'contact', 'projects', 'transparency', 'volunteer', 'gallery'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Append static pages
  staticRoutes.forEach(route => {
    const path = route === '' ? '' : `/${route}`;
    xml += `  <url>\n    <loc>https://nncm.pages.dev${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  });

  try {
    if (supabase) {
      // 2. Fetch dynamic blog_posts from Supabase table
      const { data: blog_posts, error: blog_postsError } = await supabase.from('blog_posts').select('id');
      if (!blog_postsError && blog_posts) {
        blog_posts.forEach(blog => {
          xml += `  <url>\n    <loc>https://nncm.pages.dev/blog/${blog.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });
      } else {
        console.warn("Could not fetch blogs from Supabase:", blog_postsError);
      }

      // 3. Fetch dynamic projects from Supabase table
      const { data: projects, error: projectsError } = await supabase.from('projects').select('id');
      if (!projectsError && projects) {
        projects.forEach(project => {
          xml += `  <url>\n    <loc>https://nncm.pages.dev/projects/${project.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        });
      } else {
        console.warn("Could not fetch projects from Supabase:", projectsError);
      }
    }
  } catch (error) {
    console.error("Error fetching dynamic data for sitemap:", error);
  }

  xml += `</urlset>`;

  // Ensure output directory exists
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist', { recursive: true });
  }

  // Write it straight into your Vite distribution/output folder
  fs.writeFileSync('./dist/sitemap.xml', xml);
  console.log("Automated Dynamic Sitemap Generated Successfully at ./dist/sitemap.xml!");
}

generate();
