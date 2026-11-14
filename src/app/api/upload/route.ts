import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured, uploadBufferToR2 } from '@/lib/storage/r2';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';
    const bucket = (formData.get('bucket') as string) || 'platform-assets';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    // ── File Security Shield ──
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum permitted limit (10MB).' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'upload.bin';
    const lowerName = fileName.toLowerCase();
    const FORBIDDEN_EXTENSIONS = [
      '.exe', '.bat', '.sh', '.cmd', '.dll', '.scr', '.vbs', '.msi', '.ps1', '.jar', '.com', '.pif'
    ];
    if (FORBIDDEN_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
      return NextResponse.json(
        { success: false, error: 'Executable and script uploads are strictly prohibited.' },
        { status: 400 }
      );
    }

    // Sanitize folder path against directory traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, '').replace(/\.\./g, '').slice(0, 40) || 'uploads';

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';

    // 1. Primary: Cloudflare R2 (Unlimited Egress, $0 bandwidth costs)
    if (isR2Configured()) {
      try {
        const publicUrl = await uploadBufferToR2(buffer, fileName, contentType, safeFolder);
        return NextResponse.json({
          success: true,
          url: publicUrl,
          provider: 'cloudflare-r2',
        });
      } catch (r2Err: any) {
        console.warn('Cloudflare R2 upload error, attempting fallback:', r2Err);
      }
    }

    // 2. Secondary: Supabase Storage fallback
    const supabaseAdmin = getSupabaseAdmin();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${safeFolder}/${Date.now()}_${cleanFileName}`;

    try {
      const { data, error: sbErr } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType,
          cacheControl: '3600',
          upsert: true,
        });

      if (!sbErr && data) {
        const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
        if (urlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            provider: 'supabase',
          });
        }
      }
    } catch (sbErr: any) {
      console.warn('Supabase storage upload error:', sbErr);
    }

    // 3. Fallback: Base64 data URL
    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      url: base64,
      provider: 'base64-fallback',
      isFallback: true,
    });
  } catch (err: any) {
    console.error('File upload server route error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Upload failed' }, { status: 500 });
  }
}
