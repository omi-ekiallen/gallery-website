/**
 * Everything the marketing and legal pages need to name you. The source copy
 * left these as [Product Name], [support email] and so on — fill them in here
 * once and every page updates.
 */
export const SITE = {
  productName: 'PayGallery',
  companyName: 'PayGallery',
  websiteUrl: 'https://your-domain.com',
  supportEmail: 'support@your-domain.com',
  privacyEmail: 'privacy@your-domain.com',
  supportHours: '1–2 business days',
  /** Shown on the policy pages. Update when you publish a new version. */
  legalEffectiveDate: '26 September 2026',
  legalLastUpdated: '26 September 2026',
} as const;

export const MARKETING_NAV = [
  { name: 'How it works', href: '/how-it-works' },
  { name: 'For photographers', href: '/for-photographers' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Help', href: '/help' },
] as const;

export const FOOTER_LEGAL = [
  { name: 'Privacy policy', href: '/privacy' },
  { name: 'Terms & conditions', href: '/terms' },
] as const;
