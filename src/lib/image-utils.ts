
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
  
  const baseServeUrl = '/api/nncm/files/serve';
  const legacyUploadsUrl = 'https://nncm-church.mywebcommunity.org/uploads';

  // If it's a legacy uploads URL, convert it to the serve endpoint
  if (path.startsWith(legacyUploadsUrl)) {
    const rawPath = path.replace(legacyUploadsUrl, '').replace(/^\//, '');
    return `${baseServeUrl}?path=${rawPath}`;
  }
  
  // If it's already using the local serve endpoint or starts with the local api pattern, keep it
  if (path.startsWith(baseServeUrl) || path.startsWith('/api/nncm')) {
    return path;
  }
  
  // If it's an absolute third-party URL (but not legacy uploads), return it
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  
  // Clean up the path (remove leading slashes)
  const cleanPath = path.replace(/^\//, '');
  
  return `${baseServeUrl}?path=${cleanPath}`;
};
