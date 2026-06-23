
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
 * Prepends the AwardSpace base uploads URL for all locally stored files.
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  const legacyUploadsUrl = 'https://nncm-church.mywebcommunity.org/uploads';

  // If it's already an absolute URL (Supabase Storage URLs are stored as absolute), or a data URI
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
    // If it was trying to use the local proxy pattern, remove it
    if (path.includes('/api/nncm/files/serve?path=')) {
        const rawPath = path.split('?path=')[1];
        if (rawPath) {
           return `${legacyUploadsUrl}/${rawPath}`;
        }
    }
    return path;
  }
  
  // If it's the relative proxy pattern mapping
  if (path.startsWith('/api/nncm/files/serve')) {
     const rawPath = path.split('?path=')[1];
     if (rawPath) {
        return `${legacyUploadsUrl}/${rawPath}`;
     }
  }
  
  // Any remaining relative paths should fall back to the AwardSpace legacy host, 
  // since new Supabase uploads store absolute public URLs
  const cleanPath = path.replace(/^\//, '');
  return `${legacyUploadsUrl}/${cleanPath}`;
};
