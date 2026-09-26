import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { projectRepo, mediaRepo, userRepo } from '@/lib/db';
import { deleteFile } from '@/lib/storage';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, mediaId } = await params;
  const project = projectRepo.findById(id);
  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const mediaItem = mediaRepo.findById(mediaId);
  if (!mediaItem || mediaItem.project_id !== project.id) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }

  // Delete file from disk
  await deleteFile(mediaItem.filename);

  // Delete from DB
  mediaRepo.delete(mediaItem.id);

  // If this was cover, clear or reset
  if (project.cover_media_id === mediaItem.id) {
    const remaining = mediaRepo.listByProjectId(project.id);
    projectRepo.update(project.id, {
      cover_media_id: remaining.length > 0 ? remaining[0].id : null,
    });
  }

  // Recalculate storage
  const updatedStorage = userRepo.recalculateStorage(user.id);

  return NextResponse.json({
    success: true,
    message: 'Media deleted',
    storageUsed: updatedStorage,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, mediaId } = await params;
  const project = projectRepo.findById(id);
  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await req.json();
  if (body.setCover) {
    projectRepo.update(project.id, { cover_media_id: mediaId });
  }

  return NextResponse.json({ success: true, message: 'Updated' });
}
