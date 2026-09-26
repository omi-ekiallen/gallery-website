import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { projectRepo, mediaRepo, userRepo, sessionRepo, orderRepo } from '@/lib/db';
import { isPaystackConfigured } from '@/lib/paystack';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = projectRepo.findBySlug(slug);

  if (!project) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
  }

  const photographer = userRepo.findById(project.user_id);
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(`gp_gallery_${project.id}`)?.value;
  const session = sessionToken ? sessionRepo.find(sessionToken) : undefined;

  // Check if passcode is required
  const hasPasscode = !!(project.passcode && project.passcode.trim().length > 0);
  const isPasscodeVerified = !hasPasscode || !!(session && session.passcode_verified === 1);

  if (!isPasscodeVerified) {
    return NextResponse.json({
      requiresPasscode: true,
      project: {
        id: project.id,
        title: project.title,
        slug: project.slug,
        description: project.description,
        photographerName: photographer?.business_name || photographer?.name || 'Photographer',
      },
      media: [],
      isUnlocked: false,
    });
  }

  // Passcode is cleared or not needed. Fetch media items.
  const media = mediaRepo.listByProjectId(project.id);

  // Check paywall status:
  // Unlocked if: price is 0 OR session has unlocked_downloads OR completed order exists
  const isFree = project.price_ngn === 0 || project.is_paywall_active === 0;
  const isUnlockedBySession = !!(session && session.unlocked_downloads === 1);
  const isUnlockedByOrder = session?.client_email ? orderRepo.hasCompletedOrder(project.id, session.client_email) : false;
  const isUnlocked = isFree || isUnlockedBySession || isUnlockedByOrder;

  return NextResponse.json({
    requiresPasscode: false,
    project: {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      coverMediaId: project.cover_media_id,
      priceNgn: project.price_ngn,
      isPaywallActive: project.is_paywall_active === 1,
      photographerName: photographer?.business_name || photographer?.name || 'Photographer',
    },
    media: media.map(m => ({
      id: m.id,
      filename: m.filename,
      originalName: m.original_name,
      mimeType: m.mime_type,
      sizeBytes: m.size_bytes,
      sortOrder: m.sort_order,
      previewUrl: `/api/media/${m.filename}`,
    })),
    isUnlocked,
    clientEmail: session?.client_email || null,
    paystackConfigured: isPaystackConfigured(),
  });
}
