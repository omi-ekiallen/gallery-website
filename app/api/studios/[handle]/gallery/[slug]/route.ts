import { NextResponse } from 'next/server';
import { projectRepo, mediaRepo, userRepo } from '@/lib/db';
import { isPaystackConfigured } from '@/lib/paystack';
import { resolveGalleryAccess } from '@/lib/access';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string; slug: string }> }
) {
  const { handle, slug } = await params;
  const project = projectRepo.findByHandleAndSlug(handle, slug);

  if (!project) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
  }

  const photographer = userRepo.findById(project.user_id);
  const access = await resolveGalleryAccess(project);
  const media = mediaRepo.listByProjectId(project.id);

  const publicProject = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    coverMediaId: project.cover_media_id,
    priceNgn: project.price_ngn,
    isPaywallActive: project.is_paywall_active === 1,
    photographerName: photographer?.business_name || photographer?.name || 'Photographer',
  };

  // Behind the passcode the frames are still listed, but /api/media only renders
  // them blurred at this access level — enough to show the gallery is real.
  const frames = media.map((m) => ({
    id: m.id,
    filename: m.filename,
    originalName: m.original_name,
    mimeType: m.mime_type,
    sizeBytes: m.size_bytes,
    sortOrder: m.sort_order,
    // The access level rides along so the browser refetches the moment a
    // gallery is unlocked instead of reusing the cached blurred frame.
    previewUrl: `/api/media/${m.filename}?v=${access.level}`,
  }));

  if (access.level === 'passcode') {
    return NextResponse.json({
      requiresPasscode: true,
      accessLevel: access.level,
      project: publicProject,
      media: frames,
      isUnlocked: false,
      paystackConfigured: isPaystackConfigured(),
    });
  }

  return NextResponse.json({
    requiresPasscode: false,
    accessLevel: access.level,
    project: publicProject,
    media: frames,
    isUnlocked: access.level === 'open',
    clientEmail: access.clientEmail,
    paystackConfigured: isPaystackConfigured(),
  });
}
