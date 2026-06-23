
import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload.
 * Default targets: max 1MB size, 1920px max width/height.
 */
export const compressImage = async (file: File): Promise<File> => {
  // Only compress images
  if (!file.type.startsWith('image/')) return file;
  
  // Skip if it's already small enough (under 200KB)
  if (file.size < 200 * 1024) return file;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8
  };

  try {
    console.log(`[Image Utils] Compressing ${file.name} (original size: ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    const compressedFile = await imageCompression(file, options);
    console.log(`[Image Utils] Compression complete (new size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Create a new file with the original name and the compressed blob
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('[Image Utils] Compression failed, using original file', error);
    return file;
  }
};

/**
 * Resolves a complete, absolute URL for any image path stored in the database.
 * Prepends the AwardSpace base uploads URL for all legacy files, 
 * and handles Supabase storage relative or absolute paths dynamically.
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  const legacyUploadsUrl = 'https://nncm-church.mywebcommunity.org/uploads';

  // Retrieve active Supabase URL from Vite env variables, falling back to user's known active container URL
  const supabaseUrlEnv = import.meta.env.VITE_SUPABASE_URL;
  const baseSupabaseUrl = (supabaseUrlEnv && !supabaseUrlEnv.includes('placeholder') && !supabaseUrlEnv.includes('placeholder.supabase.co'))
    ? supabaseUrlEnv.replace(/\/$/, '')
    : 'https://iacefkmaacznavqjkelj.supabase.co';

  const cleanPath = path.trim();

  // If it's already an absolute URL or a data URI or a blob, handle potential proxies and return
  if (cleanPath.startsWith('http') || cleanPath.startsWith('data:') || cleanPath.startsWith('blob:')) {
    // If it was trying to use the local proxy pattern, remove it
    if (cleanPath.includes('/api/nncm/files/serve?path=')) {
        const rawPath = cleanPath.split('?path=')[1];
        if (rawPath) {
           return `${legacyUploadsUrl}/${rawPath}`;
        }
    }
    return cleanPath;
  }
  
  // If it's the relative proxy pattern mapping
  if (cleanPath.startsWith('/api/nncm/files/serve')) {
     const rawPath = cleanPath.split('?path=')[1];
     if (rawPath) {
        return `${legacyUploadsUrl}/${rawPath}`;
     }
  }

  // Check if it's a relative path belonging to Supabase storage (e.g. contains bucket names or 'storage/' keyword)
  const isSupabasePath = 
    cleanPath.startsWith('attachments/') || 
    cleanPath.startsWith('logos/') || 
    cleanPath.startsWith('avatars/') || 
    cleanPath.startsWith('projects/') || 
    cleanPath.startsWith('reports/') ||
    cleanPath.includes('storage/v1/') ||
    cleanPath.startsWith('gallery/');

  if (isSupabasePath) {
    const strippedPath = cleanPath.replace(/^\//, '');
    
    // If the path contains the full storage prefix already, prefix it with the base host
    if (strippedPath.includes('storage/v1/object/public/')) {
      const remaining = strippedPath.split('storage/v1/object/public/')[1];
      return `${baseSupabaseUrl}/storage/v1/object/public/${remaining}`;
    }
    
    // If it is inside attachments/gallery or gallery/ folder
    if (strippedPath.startsWith('gallery/')) {
      return `${baseSupabaseUrl}/storage/v1/object/public/attachments/${strippedPath}`;
    }

    return `${baseSupabaseUrl}/storage/v1/object/public/${strippedPath}`;
  }
  
  // Any remaining generic relative paths fall back to the AwardSpace legacy host
  const strippedRelative = cleanPath.replace(/^\//, '');
  return `${legacyUploadsUrl}/${strippedRelative}`;
};
