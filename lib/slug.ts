/** Turns any label into a URL-safe slug: "Ade Visuals" → "ade-visuals". */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Paths that would collide with the app's own pages if a studio claimed them.
 * A studio handle is the first URL segment, so this list has to stay in step
 * with the top-level routes.
 */
export const RESERVED_HANDLES = new Set([
  'api',
  'dashboard',
  'login',
  'register',
  'gallery',
  'pricing',
  'how-it-works',
  'for-photographers',
  'faq',
  'help',
  'support',
  'privacy',
  'terms',
  'legal',
  'about',
  'contact',
  'admin',
  'settings',
  'account',
  'static',
  '_next',
  'assets',
  'public',
  'www',
]);

/** Appends -2, -3 … until `isTaken` says the candidate is free. */
export function uniqueSlug(base: string, isTaken: (candidate: string) => boolean): string {
  let candidate = base;
  let counter = 2;
  while (isTaken(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}
