import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  success: boolean;
  url: string;
  isFallback: boolean;
  error?: string;
}

/**
 * Helper to convert a File to Base64 Data URL (resilient client-side fallback)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image or asset to Supabase Storage with graceful Base64 fallback.
 * Works seamlessly whether Supabase Storage buckets are provisioned or in offline/demo mode.
 */
export async function uploadFileToStorage(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    bucket = 'platform-assets',
    folder = 'uploads',
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  } = options;

  // 1. Validate File Size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      success: false,
      url: '',
      isFallback: false,
      error: `File size exceeds the ${maxSizeMB}MB limit.`,
    };
  }

  // 2. Validate MIME Type if configured
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      success: false,
      url: '',
      isFallback: false,
      error: `Unsupported file format. Please upload: ${allowedTypes.map((t) => t.split('/')[1]).join(', ')}`,
    };
  }

  // 3. Attempt unified Server Upload API (Cloudflare R2 / Supabase fallback)
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('bucket', bucket);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return {
          success: true,
          url: data.url,
          isFallback: Boolean(data.isFallback),
        };
      }
    }
  } catch (apiErr) {
    console.warn('API upload route notice, attempting direct fallback:', apiErr);
  }

  // 4. Direct Supabase Storage fallback (if client configured)
  if (isSupabaseConfigured()) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const filePath = `${folder}/${timestamp}_${cleanFileName}`;

      const { data, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadErr && data) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        if (urlData?.publicUrl) {
          return {
            success: true,
            url: urlData.publicUrl,
            isFallback: false,
          };
        }
      }
    } catch (storageErr) {
      console.warn('Direct storage connection notice:', storageErr);
    }
  }

  // 5. Client-side Base64 Fallback (guarantees preview & persistence without bucket dependency)
  try {
    const base64Url = await fileToBase64(file);
    return {
      success: true,
      url: base64Url,
      isFallback: true,
    };
  } catch (err) {
    return {
      success: false,
      url: '',
      isFallback: true,
      error: 'Failed to read file from your device.',
    };
  }
}
