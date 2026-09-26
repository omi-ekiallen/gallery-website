export type SubscriptionTier = 'free' | 'tier_2' | 'tier_3';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  priceMonthlyNGN: number;
  storageBytes: number;
  storageLabel: string;
  description: string;
  features: string[];
}

export const TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    priceMonthlyNGN: 0,
    storageBytes: 500 * 1024 * 1024, // 500 MB
    storageLabel: '500 MB',
    description: 'Perfect for trying the platform and delivering your first client session.',
    features: [
      '500 MB High-res storage',
      'Passcode protected galleries',
      'Integrated Paywall & Paystack',
      'Direct client downloads',
      'Unlimited client galleries',
    ],
  },
  tier_2: {
    id: 'tier_2',
    name: 'Pro Creative',
    priceMonthlyNGN: 7500,
    storageBytes: 15 * 1024 * 1024 * 1024, // 15 GB
    storageLabel: '15 GB',
    description: 'Built for working photographers and videographers delivering regular assignments.',
    features: [
      '15 GB High-res storage',
      'Full video & photo support',
      'Custom gallery slugs & branding',
      'Passcode protection',
      'Instant Paystack payouts',
      'Priority download bandwidth',
    ],
  },
  tier_3: {
    id: 'tier_3',
    name: 'Studio Master',
    priceMonthlyNGN: 20000,
    storageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    storageLabel: '100 GB',
    description: 'Maximum capacity for high-volume wedding and commercial production studios.',
    features: [
      '100 GB Massive studio storage',
      'High-bitrate 4K video deliveries',
      'Multi-album client deliveries',
      'Bulk ZIP download packaging',
      'VIP studio support',
    ],
  },
};

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  business_name: string;
  /** URL segment for this studio: /<handle>/gallery/<slug>. */
  handle: string;
  tier: SubscriptionTier;
  storage_used: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  cover_media_id: string | null;
  passcode: string | null;
  price_ngn: number;
  is_paywall_active: number;
  created_at: string;
}

export interface MediaItem {
  id: string;
  project_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  project_id: string;
  client_email: string;
  client_name: string;
  amount_ngn: number;
  paystack_reference: string;
  status: 'pending' | 'success' | 'failed';
  unlocked_at: string | null;
  created_at: string;
}

export interface GallerySession {
  token: string;
  project_id: string;
  client_email: string | null;
  passcode_verified: number;
  unlocked_downloads: number;
  expires_at: string;
}
