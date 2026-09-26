import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { orderRepo, sessionRepo, projectRepo } from '@/lib/db';
import { verifyPayment } from '@/lib/paystack';

export async function POST(req: Request) {
  try {
    const { reference, projectId } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: 'Transaction reference is required' }, { status: 400 });
    }

    const order = orderRepo.findByReference(reference);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const projId = projectId || order.project_id;
    const project = projectRepo.findById(projId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify status with gateway (or demo validator)
    const verification = await verifyPayment(reference);

    if (verification.status !== 'success') {
      return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 });
    }

    // A live charge must cover the price the gallery asked for
    if (!verification.testMode && verification.amountNgn < order.amount_ngn) {
      return NextResponse.json({ error: 'Payment amount did not match the gallery price' }, { status: 400 });
    }

    // Mark order as completed
    orderRepo.markSuccess(reference);

    // Update or establish client gallery session
    const cookieStore = await cookies();
    let sessionToken = cookieStore.get(`gp_gallery_${project.id}`)?.value;
    const session = sessionToken ? sessionRepo.find(sessionToken) : undefined;

    if (!sessionToken || !session) {
      sessionToken = `gs_${crypto.randomBytes(24).toString('hex')}`;
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    sessionRepo.save({
      token: sessionToken,
      project_id: project.id,
      client_email: order.client_email,
      passcode_verified: 1,
      unlocked_downloads: 1,
      expires_at: expiresAt,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Payment confirmed! Downloads unlocked.',
      unlocked: true,
    });

    response.cookies.set(`gp_gallery_${project.id}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
