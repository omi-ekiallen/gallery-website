import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { TIERS } from '@/lib/types';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const tierConfig = TIERS[user.tier] || TIERS.free;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      business_name: user.business_name,
      tier: user.tier,
      storage_used: user.storage_used,
      tierConfig,
    },
  });
}
