import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { userRepo } from './db';
import { User } from './types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'gallery-paywall-secret-key-salt-2025';
const COOKIE_NAME = 'gp_auth_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: { id: string; role?: string; exp: number }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken<T = any>(token: string): T | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(data)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (parsed.exp && parsed.exp < Date.now()) {
      return null; // Expired
    }
    return parsed as T;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken<{ id: string }>(token);
  if (!payload || !payload.id) return null;

  const user = userRepo.findById(payload.id);
  if (!user) return null;

  // Make sure storage is in sync
  userRepo.recalculateStorage(user.id);
  return userRepo.findById(user.id) || null;
}

export function createAuthCookieValue(userId: string): { name: string; value: string; options: any } {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const token = createToken({ id: userId, exp });
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    },
  };
}
