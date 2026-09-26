import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { projectRepo, mediaRepo, userRepo } from '@/lib/db';
import { deleteFile } from '@/lib/storage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const project = projectRepo.findById(id);

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const media = mediaRepo.listByProjectId(project.id);

  return NextResponse.json({
    project,
    media,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const project = projectRepo.findById(id);

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const updates: Record<string, any> = {};

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.passcode !== undefined) updates.passcode = body.passcode ? body.passcode.trim() : null;
    if (body.price_ngn !== undefined) updates.price_ngn = Math.max(0, parseInt(body.price_ngn) || 0);
    if (body.cover_media_id !== undefined) updates.cover_media_id = body.cover_media_id;
    if (body.is_paywall_active !== undefined) updates.is_paywall_active = body.is_paywall_active ? 1 : 0;

    if (body.slug !== undefined && body.slug.trim()) {
      const cleanSlug = body.slug.trim().toLowerCase().replace(/[^\w\-]+/g, '');
      if (cleanSlug !== project.slug) {
        const existing = projectRepo.findBySlug(cleanSlug);
        if (existing && existing.id !== project.id) {
          return NextResponse.json({ error: 'This custom URL slug is already taken' }, { status: 409 });
        }
        updates.slug = cleanSlug;
      }
    }

    projectRepo.update(project.id, updates);
    const updated = projectRepo.findById(project.id);

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const project = projectRepo.findById(id);

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Delete all physical files
  const mediaList = mediaRepo.listByProjectId(project.id);
  for (const item of mediaList) {
    await deleteFile(item.filename);
  }

  projectRepo.delete(project.id);

  // Recalculate user storage quota
  userRepo.recalculateStorage(user.id);

  return NextResponse.json({ success: true, message: 'Project deleted' });
}
