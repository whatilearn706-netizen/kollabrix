import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

export function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() || '';
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID?.trim() || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY?.trim() || '',
    },
  });
}

/**
 * Uploads a file buffer directly to Cloudflare R2 bucket (zero-egress cost).
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder = 'uploads'
): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME?.trim() || '';
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${Date.now()}_${cleanName}`;

  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const publicBase = (
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    process.env.R2_PUBLIC_URL ||
    ''
  ).replace(/\/$/, '');

  if (publicBase) {
    return `${publicBase}/${key}`;
  }

  return `https://${bucket}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}
