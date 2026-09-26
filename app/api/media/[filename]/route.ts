import { NextResponse } from 'next/server';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { getFilePath } from '@/lib/storage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Sanitize filename against directory traversal
  const cleanFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '');
  const filePath = getFilePath(cleanFilename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }

  const stat = await fs.promises.stat(filePath);
  const ext = cleanFilename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };

  const contentType = (ext && mimeTypes[ext]) || 'application/octet-stream';
  const fileStream = fs.createReadStream(filePath);
  const webStream = Readable.toWeb(fileStream);

  return new Response(webStream as any, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': stat.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': 'inline',
    },
  });
}
