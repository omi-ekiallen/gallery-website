import { NextResponse } from 'next/server';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { ZipArchive } from 'archiver';
import { projectRepo, mediaRepo } from '@/lib/db';
import { resolveGalleryAccess } from '@/lib/access';
import { getFilePath } from '@/lib/storage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string; slug: string }> }
) {
  const { handle, slug } = await params;
  const project = projectRepo.findByHandleAndSlug(handle, slug);

  if (!project) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const mediaId = url.searchParams.get('mediaId');
  const downloadAll = url.searchParams.get('all') === 'true';

  if (!mediaId && !downloadAll) {
    return NextResponse.json({ error: 'Please specify a mediaId or all=true' }, { status: 400 });
  }

  // Both gates apply: the passcode, then the paywall.
  const access = await resolveGalleryAccess(project);

  if (!access.canDownload) {
    return NextResponse.json(
      {
        error:
          access.level === 'passcode'
            ? 'Enter the gallery passcode before downloading.'
            : 'Payment required. Complete the checkout to unlock full-resolution files.',
        priceNgn: project.price_ngn,
      },
      { status: 403 }
    );
  }

  // --- Single File Download ---
  if (mediaId) {
    const media = mediaRepo.findById(mediaId);
    if (!media || media.project_id !== project.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const filePath = getFilePath(media.filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File missing from storage' }, { status: 404 });
    }

    const fileStream = fs.createReadStream(filePath);
    const webStream = Readable.toWeb(fileStream);

    return new Response(webStream as any, {
      headers: {
        'Content-Type': media.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(media.original_name)}"`,
        'Content-Length': media.size_bytes.toString(),
      },
    });
  }

  // --- Bulk ZIP Download ---
  if (downloadAll) {
    const mediaList = mediaRepo.listByProjectId(project.id);
    if (mediaList.length === 0) {
      return NextResponse.json({ error: 'No media items in this project' }, { status: 400 });
    }

    const archive = new ZipArchive();

    for (const media of mediaList) {
      const filePath = getFilePath(media.filename);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: media.original_name });
      }
    }

    archive.finalize();

    const webStream = Readable.toWeb(archive as any);
    const zipName = `${project.slug}-full-resolution.zip`;

    return new Response(webStream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(zipName)}"`,
      },
    });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
