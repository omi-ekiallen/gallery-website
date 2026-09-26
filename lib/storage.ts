import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { userRepo } from './db';
import { TIERS } from './types';

const UPLOADS_DIR = path.join(process.cwd(), 'storage', 'uploads');

export function ensureStorageDir(): string {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  return UPLOADS_DIR;
}

export function getFilePath(filename: string): string {
  ensureStorageDir();
  return path.join(UPLOADS_DIR, filename);
}

export function checkStorageQuota(userId: string, incomingBytes: number): {
  allowed: boolean;
  currentUsed: number;
  quota: number;
  remaining: number;
  tier: string;
} {
  const user = userRepo.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const tierConfig = TIERS[user.tier] || TIERS.free;
  const currentUsed = user.storage_used || 0;
  const quota = tierConfig.storageBytes;
  const remaining = Math.max(0, quota - currentUsed);
  const allowed = (currentUsed + incomingBytes) <= quota;

  return {
    allowed,
    currentUsed,
    quota,
    remaining,
    tier: user.tier,
  };
}

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ filename: string; sizeBytes: number }> {
  ensureStorageDir();

  const ext = path.extname(originalName) || (mimeType.includes('png') ? '.png' : mimeType.includes('mp4') ? '.mp4' : '.jpg');
  const randomId = crypto.randomBytes(16).toString('hex');
  const filename = `${Date.now()}-${randomId}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(filePath, buffer);
  const stats = await fs.promises.stat(filePath);

  return {
    filename,
    sizeBytes: stats.size,
  };
}

export async function deleteFile(filename: string): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete file ${filename}:`, error);
  }
}

export { formatBytes } from './format';

