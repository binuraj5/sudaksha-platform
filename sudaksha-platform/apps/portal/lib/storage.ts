/**
 * S3 Object Storage Utility
 * SEPL/INT/2026/IMPL-GAPS-01 Step G20
 * Patent claim C-09 — report PDF persistence infrastructure
 *
 * Used for:
 *   • Persisting generated report PDFs (Report.fileUrl stores the S3 key)
 *   • Generating short-lived signed URLs for client downloads
 *
 * Configure via env vars (see .env.example):
 *   AWS_REGION             default: ap-south-1
 *   AWS_ACCESS_KEY_ID      required for uploads
 *   AWS_SECRET_ACCESS_KEY  required for uploads
 *   AWS_S3_BUCKET          default: sudaksha-reports
 *
 * Graceful degradation:
 *   • S3 client construction never throws — credentials are passed even if
 *     blank (AWS SDK lazily fails at call time, not at boot).
 *   • Each call site catches errors so a missing/misconfigured S3 setup
 *     doesn't break the report-generation flow — fileUrl just remains unset.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION ?? 'ap-south-1';
const BUCKET = process.env.AWS_S3_BUCKET ?? 'sudaksha-reports';

// Singleton — survives Next.js HMR in dev, reused across route handlers.
const globalForS3 = globalThis as unknown as { s3?: S3Client };

export const s3: S3Client =
  globalForS3.s3 ??
  new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  });

if (process.env.NODE_ENV !== 'production') globalForS3.s3 = s3;

/**
 * Returns true when the AWS credentials env vars are present. Use this at
 * call sites to short-circuit upload attempts in environments without S3
 * configured (local dev, demo deployments, etc.).
 */
export function isS3Configured(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    (process.env.AWS_S3_BUCKET ?? BUCKET),
  );
}

/**
 * Uploads a generated PDF buffer for a given report ID. Returns the S3 key
 * (relative path within the bucket) on success — store this in Report.fileUrl.
 *
 * Key format: reports/<year>/<reportId>.pdf
 *   year-prefixed so we can apply lifecycle rules (e.g. archive >2 years old).
 *
 * Throws if S3 is unreachable / unauthorised — callers should wrap in try/catch
 * and treat failure as "PDF not persisted" (don't fail the whole user flow).
 */
export async function uploadReportPDF(
  reportId: string,
  pdfBuffer: Buffer | Uint8Array,
  contentType: string = 'application/pdf',
): Promise<string> {
  const year = new Date().getFullYear();
  const key = `reports/${year}/${reportId}.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: pdfBuffer,
      ContentType: contentType,
      // ServerSideEncryption: 'AES256' — uncomment if bucket policy requires
    }),
  );

  return key;
}

/**
 * Generates a short-lived signed URL for downloading a report PDF.
 * Default expiry: 1 hour. Caller should redirect to the returned URL.
 *
 * Throws on missing/inaccessible object.
 */
export async function getReportSignedUrl(
  key: string,
  expiresInSeconds: number = 3600,
): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

/**
 * Cheap existence check — used by the download endpoint to return 404 instead
 * of redirecting to a signed URL that points at nothing.
 */
export async function reportExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}
