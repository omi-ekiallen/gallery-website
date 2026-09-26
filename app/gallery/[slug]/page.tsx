import { redirect, notFound } from 'next/navigation';
import { findLegacyGalleryBySlug } from '@/lib/db';

/**
 * Gallery links used to be /gallery/<slug>. They now carry the studio handle,
 * so anything already shared with a client keeps working by redirecting.
 */
export default async function LegacyGalleryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const match = findLegacyGalleryBySlug(slug);

  if (!match) notFound();

  redirect(`/${match.handle}/gallery/${match.slug}`);
}
