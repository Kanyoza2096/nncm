// @ts-nocheck

/**
 * Compresses an image file before upload.
 * Default targets: max 1MB size, 1920px max width/height.
 */
export const compressImage = async (file: File): Promise<File> => {
  // Only compress images
  if (!file.type.startsWith('image/')) return file;
  
  // Skip if it's already small enough (under 200KB)
  if (file.size < 200 * 1024) return file;

  // Dynamic import — only loads the library when needed
  try {
    const imageCompression = (await import('browser-image-compression')).default;
    
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8
    };

    console.log(`[Image Utils] Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    const compressedFile = await imageCompression(file, options);
    console.log(`[Image Utils] Compressed (${(compressedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    
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
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  const legacyUploadsUrl = 'https://nncm-church.mywebcommunity.org/uploads';

  // Next.js environment variables
  const supabaseUrlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const baseSupabaseUrl = (supabaseUrlEnv && !supabaseUrlEnv.includes('placeholder'))
    ? supabaseUrlEnv.replace(/\/$/, '')
    : 'https://iacefkmaacznavqjkelj.supabase.co';

  const cleanPath = path.trim();

  // Already absolute URL, data URI, or blob
  if (cleanPath.startsWith('http') || cleanPath.startsWith('data:') || cleanPath.startsWith('blob:')) {
    if (cleanPath.includes('/api/nncm/files/serve?path=')) {
      const rawPath = cleanPath.split('?path=')[1];
      if (rawPath) return `${legacyUploadsUrl}/${rawPath}`;
    }
    return cleanPath;
  }
  
  // Relative proxy pattern
  if (cleanPath.startsWith('/api/nncm/files/serve')) {
    const rawPath = cleanPath.split('?path=')[1];
    if (rawPath) return `${legacyUploadsUrl}/${rawPath}`;
  }

  // Supabase storage paths
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
    
    if (strippedPath.includes('storage/v1/object/public/')) {
      const remaining = strippedPath.split('storage/v1/object/public/')[1];
      return `${baseSupabaseUrl}/storage/v1/object/public/${remaining}`;
    }
    
    if (strippedPath.startsWith('gallery/')) {
      return `${baseSupabaseUrl}/storage/v1/object/public/attachments/${strippedPath}`;
    }

    return `${baseSupabaseUrl}/storage/v1/object/public/${strippedPath}`;
  }
  
  // Fallback to legacy host
  const strippedRelative = cleanPath.replace(/^\//, '');
  return `${legacyUploadsUrl}/${strippedRelative}`;
};
