import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { userRepo } from '@/lib/db';
import { TIERS, SubscriptionTier } from '@/lib/types';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tier } = await req.json();
    if (!tier || !TIERS[tier as SubscriptionTier]) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    userRepo.updateTier(user.id, tier);
    const updatedUser = userRepo.findById(user.id)!;

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${TIERS[tier as SubscriptionTier].name}`,
      tier: updatedUser.tier,
      tierConfig: TIERS[tier as SubscriptionTier],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update plan' }, { status: 500 });
  }
}
