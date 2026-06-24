import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SEO_FILE = path.join(process.cwd(), "seo_settings.json");

interface SeoSettings {
  title: string;
  description: string;
  imageUrl: string;
  siteName: string;
}

const defaultSeo: SeoSettings = {
  title: "New Nature In Christ Ministry (NNCM)",
  description: "Transforming lives by the power of the Holy Spirit, teaching the uncompromised word of God, and raising a Christ-minded generation in Zomba, Malawi.",
  imageUrl: "/logo.png",
  siteName: "NNCM Portal"
};

function getSeoSettings(): SeoSettings {
  try {
    if (fs.existsSync(SEO_FILE)) {
      const data = fs.readFileSync(SEO_FILE, "utf-8");
      return { ...defaultSeo, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("Error reading SEO settings:", err);
  }
  return defaultSeo;
}

function saveSeoSettings(settings: Partial<SeoSettings>) {
  try {
    const current = getSeoSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(SEO_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving SEO settings:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch SEO settings
  app.get("/api/seo", (req, res) => {
    res.json(getSeoSettings());
  });

  // API Route to update SEO settings
  app.post("/api/seo", (req, res) => {
    const { title, description, imageUrl, siteName } = req.body;
    saveSeoSettings({ title, description, imageUrl, siteName });
    res.json({ success: true, settings: getSeoSettings() });
  });

  // API route for Gemini chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Filter out system message if it's in the messages array
      const chatMessages = messages.filter((m: any) => m.role !== 'system');
      
      const history = chatMessages.slice(0, -1).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const lastMessage = chatMessages[chatMessages.length - 1].content;

      const contents = history.map(h => ({
        role: h.role,
        parts: h.parts
      }));
      contents.push({ role: 'user', parts: [{ text: lastMessage }] });

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });
      const text = result.text;

      res.json({ text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to contact Gemini API" });
    }
  });

  // Mock report export endpoint
  app.get("/api/nncm/reports/export", (req, res) => {
    const { type, format } = req.query;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=export_${type}_${Date.now()}.${format}`);
    res.send(`Export data for ${type} in ${format} format.\nThis is a mock export for demonstration.`);
  });

  // Dynamic PWA & SEO Sitemap XML Endpoint
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'nncm.pages.dev';
      const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
      const baseUrl = `${proto}://${host}`;

      const staticRoutes = [
        '', 'about', 'leadership', 'sermons', 'scriptures', 
        'events', 'ministries', 'prayer', 'donate', 
        'register', 'blog', 'contact', 'projects', 'transparency', 'volunteer', 'gallery'
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Append static pages
      staticRoutes.forEach(route => {
        const fullUrl = route === '' ? baseUrl : `${baseUrl}/${route}`;
        xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
      });

      // Try to fetch dynamic pages from Supabase
      try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iacefkmaacznavqjkelj.supabase.co';
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhY2Vma21hYWN6bmF2cWprZWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzg0NzgsImV4cCI6MjA5NzYxNDQ3OH0.T_Klz3ccS1Z7dPNDNw33NjZMUxdQGC_fZEUJGqb1a0Y';
        
        if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
          const supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);

          // Fetch dynamic blogs from Supabase table
          const { data: blogs, error: blogsError } = await supabaseInstance.from('blogs').select('id');
          if (!blogsError && blogs) {
            blogs.forEach((blog: any) => {
              xml += `  <url>\n    <loc>${baseUrl}/blog/${blog.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
            });
          }

          // Fetch dynamic projects from Supabase table
          const { data: projects, error: projectsError } = await supabaseInstance.from('projects').select('id');
          if (!projectsError && projects) {
            projects.forEach((project: any) => {
              xml += `  <url>\n    <loc>${baseUrl}/projects/${project.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
            });
          }
        }
      } catch (dbError) {
        console.error("Error fetching dynamic data for sitemap from Supabase:", dbError);
      }

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (err: any) {
      console.error("Sitemap generation error:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');
          const seo = getSeoSettings();
          
          // Escape helper for HTML injection safety
          const escapeHtml = (str: string) => {
            return str
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
          };

          const safeTitle = escapeHtml(seo.title);
          const safeDesc = escapeHtml(seo.description);
          let safeImg = escapeHtml(seo.imageUrl);
          const safeSite = escapeHtml(seo.siteName);

          // If the SEO image path is relative (e.g., /logo.png), convert to absolute URL so crawlers can load it
          if (safeImg.startsWith('/')) {
            const host = req.headers['x-forwarded-host'] || req.headers.host || 'nncm.pages.dev';
            const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
            safeImg = `${proto}://${host}${safeImg}`;
          }

          // Replace elements in the static HTML file
          html = html.replace(/<title>.*?<\/title>/gi, `<title>${safeTitle}</title>`);
          html = html.replace(/<meta name="title" content=".*?" \/>/gi, `<meta name="title" content="${safeTitle}" />`);
          html = html.replace(/<meta name="description" content=".*?" \/>/gi, `<meta name="description" content="${safeDesc}" />`);
          
          html = html.replace(/<meta property="og:title" content=".*?" \/>/gi, `<meta property="og:title" content="${safeTitle}" />`);
          html = html.replace(/<meta property="og:description" content=".*?" \/>/gi, `<meta property="og:description" content="${safeDesc}" />`);
          html = html.replace(/<meta property="og:image" content=".*?" \/>/gi, `<meta property="og:image" content="${safeImg}" />`);
          html = html.replace(/<meta property="og:site_name" content=".*?" \/>/gi, `<meta property="og:site_name" content="${safeSite}" />`);
          
          html = html.replace(/<meta property="twitter:title" content=".*?" \/>/gi, `<meta property="twitter:title" content="${safeTitle}" />`);
          html = html.replace(/<meta property="twitter:description" content=".*?" \/>/gi, `<meta property="twitter:description" content="${safeDesc}" />`);
          html = html.replace(/<meta property="twitter:image" content=".*?" \/>/gi, `<meta property="twitter:image" content="${safeImg}" />`);

          res.send(html);
        } else {
          res.sendFile(indexPath);
        }
      } catch (err) {
        console.error("Error serving SEO index.html", err);
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
