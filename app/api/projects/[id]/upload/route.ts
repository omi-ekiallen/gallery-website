import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getSessionUser } from '@/lib/auth';
import { projectRepo, mediaRepo, userRepo } from '@/lib/db';
import { checkStorageQuota, saveUploadedFile, formatBytes } from '@/lib/storage';


export async function POST(
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
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Calculate total incoming size
    const totalIncomingBytes = files.reduce((acc, f) => acc + f.size, 0);

    // Check storage limits for this user's subscription tier
    const quotaCheck = checkStorageQuota(user.id, totalIncomingBytes);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: `Storage limit exceeded! This upload requires ${formatBytes(totalIncomingBytes)}, but your ${quotaCheck.tier.toUpperCase()} plan only has ${formatBytes(quotaCheck.remaining)} available. Please upgrade your plan.`,
          quota: quotaCheck,
        },
        { status: 413 }
      );
    }

    const uploadedMedia = [];
    let isFirst = !project.cover_media_id;

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name || 'untitled';
      const mimeType = file.type || 'application/octet-stream';

      const saved = await saveUploadedFile(buffer, originalName, mimeType);

      const mediaId = crypto.randomUUID();
      const mediaItem = mediaRepo.create({
        id: mediaId,
        project_id: project.id,
        filename: saved.filename,
        original_name: originalName,
        mime_type: mimeType,
        size_bytes: saved.sizeBytes,
        width: null,
        height: null,
        sort_order: 0,
      });

      uploadedMedia.push(mediaItem);

      // Set first uploaded item as cover if none set
      if (isFirst) {
        projectRepo.update(project.id, { cover_media_id: mediaId });
        isFirst = false;
      }
    }

    // Recalculate and update user's storage
    const newStorage = userRepo.recalculateStorage(user.id);

    return NextResponse.json({
      success: true,
      uploadedCount: uploadedMedia.length,
      media: uploadedMedia,
      storageUsed: newStorage,
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload files' }, { status: 500 });
  }
}
