import { NextResponse } from 'next/server';
import { userRepo } from '@/lib/db';
import { verifyPassword, createAuthCookieValue } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = userRepo.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Recalculate storage for fresh metrics
    userRepo.recalculateStorage(user.id);
    const freshUser = userRepo.findById(user.id)!;

    const cookie = createAuthCookieValue(freshUser.id);
    const response = NextResponse.json({
      success: true,
      user: {
        id: freshUser.id,
        email: freshUser.email,
        name: freshUser.name,
        business_name: freshUser.business_name,
        tier: freshUser.tier,
        storage_used: freshUser.storage_used,
      },
    });

    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
