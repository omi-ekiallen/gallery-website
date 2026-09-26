import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { projectRepo, orderRepo } from '@/lib/db';
import { initializePayment } from '@/lib/paystack';

export async function POST(req: Request) {
  try {
    const { projectId, clientEmail, clientName } = await req.json();

    if (!projectId || !clientEmail) {
      return NextResponse.json({ error: 'Project ID and email are required' }, { status: 400 });
    }

    const project = projectRepo.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.price_ngn <= 0) {
      return NextResponse.json({ error: 'This gallery is already free' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/gallery/${project.slug}?payment_complete=true`;

    const payResult = await initializePayment({
      email: clientEmail.trim(),
      amountNgn: project.price_ngn,
      callbackUrl,
      metadata: {
        projectId: project.id,
        projectSlug: project.slug,
        clientName: clientName || '',
      },
    });

    if (!payResult.success) {
      return NextResponse.json({ error: payResult.message || 'Payment initialization failed' }, { status: 500 });
    }

    // Save pending order
    orderRepo.create({
      id: crypto.randomUUID(),
      project_id: project.id,
      client_email: clientEmail.trim(),
      client_name: (clientName || clientEmail).trim(),
      amount_ngn: project.price_ngn,
      paystack_reference: payResult.reference,
      status: 'pending',
      unlocked_at: null,
    });

    return NextResponse.json({
      success: true,
      reference: payResult.reference,
      authorizationUrl: payResult.authorizationUrl,
      testMode: payResult.testMode,
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize payment' }, { status: 500 });
  }
}
