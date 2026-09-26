import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { userRepo } from '@/lib/db';
import { hashPassword, createAuthCookieValue } from '@/lib/auth';
import { slugify, uniqueSlug, RESERVED_HANDLES } from '@/lib/slug';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, business_name, tier } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existingUser = userRepo.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // The studio handle is the first segment of every gallery link, so it has
    // to be unique and must not collide with the app's own pages.
    const handleBase = slugify(business_name || name) || 'studio';
    const handle = uniqueSlug(handleBase, (candidate) =>
      RESERVED_HANDLES.has(candidate) || userRepo.handleTaken(candidate)
    );

    const newUser = userRepo.create({
      id: userId,
      email,
      password_hash,
      name,
      business_name: business_name || name + ' Photography',
      handle,
      tier: tier && ['free', 'tier_2', 'tier_3'].includes(tier) ? tier : 'free',
    });

    const cookie = createAuthCookieValue(newUser.id);
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        business_name: newUser.business_name,
        handle: newUser.handle,
        tier: newUser.tier,
        storage_used: newUser.storage_used,
      },
    });

    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
