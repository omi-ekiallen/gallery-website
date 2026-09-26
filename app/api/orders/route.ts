import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { orderRepo } from '@/lib/db';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = orderRepo.listByUserId(user.id);
  return NextResponse.json({ orders });
}
