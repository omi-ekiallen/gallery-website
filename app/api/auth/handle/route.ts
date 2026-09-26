import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { userRepo } from '@/lib/db';
import { slugify, RESERVED_HANDLES } from '@/lib/slug';

/** Changes the studio handle — the first segment of every gallery link. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { handle } = await req.json();
    const clean = slugify(handle || '');

    if (!clean || clean.length < 3) {
      return NextResponse.json(
        { error: 'Use at least 3 letters, numbers or dashes' },
        { status: 400 }
      );
    }

    if (RESERVED_HANDLES.has(clean)) {
      return NextResponse.json({ error: 'That address is reserved' }, { status: 409 });
    }

    if (userRepo.handleTaken(clean, user.id)) {
      return NextResponse.json({ error: 'That address is already taken' }, { status: 409 });
    }

    userRepo.updateHandle(user.id, clean);

    return NextResponse.json({
      success: true,
      handle: clean,
      message: 'Studio address updated. Links you shared with the old address will stop working.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Could not update the studio address' },
      { status: 500 }
    );
  }
}
