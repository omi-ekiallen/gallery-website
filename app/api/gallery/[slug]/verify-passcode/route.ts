import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { projectRepo, sessionRepo } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = projectRepo.findBySlug(slug);

  if (!project) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
  }

  const { passcode } = await req.json();

  if (!project.passcode || project.passcode.trim() === '') {
    return NextResponse.json({ success: true, message: 'No passcode required' });
  }

  if (!passcode || passcode.trim() !== project.passcode.trim()) {
    return NextResponse.json({ error: 'Incorrect passcode. Please try again.' }, { status: 401 });
  }

  // Passcode matched! Create or update gallery session
  const token = `gs_${crypto.randomBytes(24).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  sessionRepo.save({
    token,
    project_id: project.id,
    client_email: null,
    passcode_verified: 1,
    unlocked_downloads: 0,
    expires_at: expiresAt,
  });

  const response = NextResponse.json({ success: true, message: 'Access granted' });
  response.cookies.set(`gp_gallery_${project.id}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
