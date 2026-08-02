import { supabase } from './supabase';
import { compressImage } from './image-utils';

/**
 * Maps a generic folder/bucket string to one of the 5 real Supabase buckets:
 * - 'logos' (for organization branding)
 * - 'avatars' (for team members, testimonials, leadership)
 * - 'projects' (for project cover images, blogs, etc.)
 * - 'reports' (for public audit and activity reports)
 * - 'attachments' (for beneficiary documents, case attachments, and general storage)
 */
export function getTargetBucketAndPath(folderOrBucket: string, originalFileName: string): { bucket: string; filePath: string } {
  const clean = folderOrBucket.toLowerCase().trim();
  const fileExt = originalFileName.split('.').pop() || 'png';
  const uniqueName = `${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`;

  let bucket = 'attachments'; // Default safe bucket
  let subfolder = '';

  if (clean === 'logos' || clean === 'logo') {
    bucket = 'logos';
  } else if (clean === 'leadership' || clean === 'avatars' || clean === 'users' || clean === 'avatar') {
    bucket = 'avatars';
  } else if (clean === 'projects' || clean === 'project' || clean === 'blog') {
    bucket = 'projects';
    subfolder = clean;
  } else if (clean === 'reports' || clean === 'report') {
    bucket = 'reports';
  } else if (clean === 'attachments' || clean === 'general' || clean === 'beneficiaries' || clean === 'cases') {
    bucket = 'attachments';
    subfolder = clean;
  } else {
    // Check if the input itself is directly one of the five buckets
    if (['logos', 'projects', 'avatars', 'reports', 'attachments'].includes(clean)) {
      bucket = clean;
    } else {
      bucket = 'attachments';
      subfolder = clean;
    }
  }

  // Build the clean relative path inside that bucket
  const filePath = subfolder ? `${subfolder}/${uniqueName}` : uniqueName;
  return { bucket, filePath };
}

/**
 * Uploads a file directly to a Supabase Storage bucket.
 * If the bucket is not configured or fails, it falls back to a local Object URL
 * so that the client preview remains interactive and holds the image in memory.
 * 
 * @param file - The File object retrieved from an input element
 * @param bucketOrFolder - The requested bucket or folder category
 * @returns The public URL of the uploaded file or local fallback URL
 */
export async function uploadFileToSupabase(file: File, bucketOrFolder: string = 'attachments'): Promise<{ url: string; fallback: boolean; errorMsg?: string }> {
  try {
    // Compress image if it is an image
    console.log(`[Storage] Processing file: ${file.name}`);
    const processedFile = await compressImage(file);
    
    const { bucket, filePath } = getTargetBucketAndPath(bucketOrFolder, processedFile.name);
    
    if (processedFile !== file) {
      console.log(`[Storage] Image compressed from ${(file.size/1024).toFixed(2)}KB to ${(processedFile.size/1024).toFixed(2)}KB`);
    }

    console.log(`[Supabase Storage] Attempting upload of processed file to resolved bucket "${bucket}" with path "${filePath}"`);
    
    // First let's check if the client is initialized
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log(`[Supabase Storage] Upload success! Public URL: ${publicUrl}`);
    return { url: publicUrl, fallback: false };
  } catch (error: any) {
    console.warn('[Supabase Storage Warning] Could not upload via Supabase storage. Converting to highly-persistent Base64 DataURL.', error.message || error);
    
    // Generate a highly-persistent Base64 Data URL fallback so that files/images can be serialized and saved persistently
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        console.log(`[Supabase Storage Fallback] Converted ${file.name} to persistent Base64 DataURI successfully.`);
        resolve({ 
          url: base64Url, 
          fallback: true, 
          errorMsg: error.message || 'Storage bucket not accessible. Ensure you have created public buckets named "logos", "avatars", "projects", "reports", and "attachments" in Supabase Storage.'
        });
      };
      reader.onerror = () => {
        const localUrl = URL.createObjectURL(file);
        resolve({ 
          url: localUrl, 
          fallback: true, 
          errorMsg: 'Could not read file as Base64. Defaulted to transient local URL.'
        });
      };
      reader.readAsDataURL(file);
    });
  }
}
