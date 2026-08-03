import { useEffect } from 'react';
import { useOrgSettings } from './useOrgSettings';

interface MetaTags {
  title: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export function useDocumentMeta({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
}: MetaTags) {
  const { settings } = useOrgSettings();

  useEffect(() => {
    // Update document title
    const baseTitle = settings.orgName || 'Church Portal';
    const newTitle = title ? `${title} | ${baseTitle}` : baseTitle;
    document.title = newTitle;

    // Helper to update or create meta tags
    const setMetaTag = (attr: string, key: string, content: string | undefined) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      
      if (content) {
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attr, key);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      } else if (element) {
        // If content is undefined/empty, we can optionally remove the meta tag 
        // to prevent stale data from previous routes
        element.remove();
      }
    };

    // Standard meta tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    
    // Open Graph meta tags
    setMetaTag('property', 'og:title', ogTitle || newTitle);
    setMetaTag('property', 'og:description', ogDescription || description);
    setMetaTag('property', 'og:image', ogImage || settings.orgLogo);

  }, [title, description, keywords, ogTitle, ogDescription, ogImage, settings.orgName, settings.orgLogo]);
}
