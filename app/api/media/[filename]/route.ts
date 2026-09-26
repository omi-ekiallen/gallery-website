import { NextResponse } from 'next/server';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { getDb, projectRepo, userRepo } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { resolveGalleryAccess } from '@/lib/access';
import { getDerivative } from '@/lib/images';
import { MediaItem } from '@/lib/types';

/**
 * Serves browser renderings of a stored file — never the original. What comes
 * back depends on who is asking:
 *   photographer who owns it, or a client with access  → downscaled preview
 *   client still behind the passcode or the paywall    → blurred frame
 * Original files are only ever handed out by the download route, after payment.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const cleanFilename = filename.replace(/[^a-zA-Z0-9_\-.]/g, '');

  const media = getDb()
    .prepare('SELECT * FROM media WHERE filename = ?')
    .get(cleanFilename) as MediaItem | undefined;

  if (!media) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }

  const project = projectRepo.findById(media.project_id);
  if (!project) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }

  const user = await getSessionUser();
  const isOwner = !!user && user.id === project.user_id;

  let mode: 'preview' | 'locked' = 'preview';
  if (!isOwner) {
    const access = await resolveGalleryAccess(project);
    mode = access.level === 'open' ? 'preview' : 'locked';
  }

  // Videos have no still rendering. Locked visitors get nothing at all.
  if (!media.mime_type?.startsWith('image/')) {
    if (mode === 'locked') {
      return NextResponse.json({ error: 'This file is locked' }, { status: 403 });
    }

    const source = `${process.cwd()}/storage/uploads/${cleanFilename}`;
    if (!fs.existsSync(source)) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return new Response(Readable.toWeb(fs.createReadStream(source)) as any, {
      headers: {
        'Content-Type': media.mime_type || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  }

  // Locked frames carry the studio's name, so even a screenshot of a gated
  // gallery says where it came from.
  const owner = userRepo.findById(project.user_id);
  const label = owner?.business_name || owner?.name || 'Preview';

  const derivative = await getDerivative(cleanFilename, media.mime_type, mode, label);
  if (!derivative) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }

  const stat = await fs.promises.stat(derivative);

  return new Response(Readable.toWeb(fs.createReadStream(derivative)) as any, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': stat.size.toString(),
      // Locked frames are never stored by the browser; unlocked ones may be
      // revalidated. The same URL renders differently once the client pays.
      'Cache-Control': mode === 'locked' ? 'private, no-store, max-age=0' : 'private, no-cache',
    },
  });
}
