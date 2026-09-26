import { cookies } from 'next/headers';
import { sessionRepo, orderRepo } from './db';
import { Project } from './types';

export type AccessLevel =
  /** Passcode set and not yet entered: nothing but blurred frames. */
  | 'passcode'
  /** Passcode cleared but the gallery is unpaid: blurred frames, no downloads. */
  | 'unpaid'
  /** Free gallery or paid for: readable previews and downloads. */
  | 'open';

export interface GalleryAccess {
  level: AccessLevel;
  /** True only for `open` — the single flag the download route should trust. */
  canDownload: boolean;
  clientEmail: string | null;
}

/**
 * Single source of truth for what a visitor may see of a gallery. Both gates
 * matter: a free gallery still hides behind its passcode, and a paid gallery
 * still hides until the order clears.
 */
export async function resolveGalleryAccess(project: Project): Promise<GalleryAccess> {
  const cookieStore = await cookies();
  const token = cookieStore.get(`gp_gallery_${project.id}`)?.value;
  const session = token ? sessionRepo.find(token) : undefined;

  const hasPasscode = !!(project.passcode && project.passcode.trim().length > 0);
  const passcodeCleared = !hasPasscode || session?.passcode_verified === 1;
  const clientEmail = session?.client_email || null;

  if (!passcodeCleared) {
    return { level: 'passcode', canDownload: false, clientEmail };
  }

  const isFree = project.price_ngn === 0 || project.is_paywall_active === 0;
  const unlockedBySession = session?.unlocked_downloads === 1;
  const unlockedByOrder = clientEmail
    ? orderRepo.hasCompletedOrder(project.id, clientEmail)
    : false;

  if (isFree || unlockedBySession || unlockedByOrder) {
    return { level: 'open', canDownload: true, clientEmail };
  }

  return { level: 'unpaid', canDownload: false, clientEmail };
}
