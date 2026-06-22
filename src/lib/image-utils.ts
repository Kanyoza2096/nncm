
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
