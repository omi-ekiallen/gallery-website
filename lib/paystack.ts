export interface InitializePaymentParams {
  email: string;
  amountNgn: number;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl?: string;
  reference: string;
  /** True when no Paystack secret key is configured and the charge was simulated locally. */
  testMode: boolean;
  message?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  reference: string;
  amountNgn: number;
  status: 'success' | 'failed' | 'abandoned';
  customerEmail?: string;
  paidAt?: string;
  testMode: boolean;
}

/** Paystack is live only once a secret key is present in the environment. */
export function isPaystackConfigured(): boolean {
  return !!process.env.PAYSTACK_SECRET_KEY;
}

function reference(): string {
  return `GP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  // No key configured yet: simulate the charge so the delivery flow can be tested end to end.
  if (!secret) {
    return { success: true, reference: reference(), testMode: true };
  }

  try {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amountNgn * 100), // Paystack charges in kobo
        reference: reference(),
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });

    const data = await res.json();
    if (data.status && data.data) {
      return {
        success: true,
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
        testMode: false,
      };
    }

    return {
      success: false,
      reference: '',
      testMode: false,
      message: data.message || 'Paystack could not start this transaction',
    };
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    // A configured key must never fall back to a simulated charge.
    return {
      success: false,
      reference: '',
      testMode: false,
      message: 'Could not reach Paystack. Please try again.',
    };
  }
}

export async function verifyPayment(ref: string): Promise<VerifyPaymentResponse> {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    return {
      success: true,
      reference: ref,
      amountNgn: 0,
      status: 'success',
      paidAt: new Date().toISOString(),
      testMode: true,
    };
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await res.json();
    if (data.status && data.data) {
      const isSuccess = data.data.status === 'success';
      return {
        success: isSuccess,
        reference: data.data.reference,
        amountNgn: Math.round(data.data.amount / 100),
        status: isSuccess ? 'success' : 'failed',
        customerEmail: data.data.customer?.email,
        paidAt: data.data.paid_at,
        testMode: false,
      };
    }

    return { success: false, reference: ref, amountNgn: 0, status: 'failed', testMode: false };
  } catch (error) {
    console.error('Paystack verification error:', error);
    return { success: false, reference: ref, amountNgn: 0, status: 'failed', testMode: false };
  }
}
