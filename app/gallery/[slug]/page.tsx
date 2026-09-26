'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { formatBytes } from '@/lib/format';

export default function ClientGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [gallery, setGallery] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [paystackConfigured, setPaystackConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [verifyingPasscode, setVerifyingPasscode] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const fetchGallery = useCallback(async () => {
    try {
      const res = await fetch(`/api/gallery/${slug}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'This gallery could not be loaded');
        return;
      }

      setRequiresPasscode(data.requiresPasscode);
      setGallery(data.project);
      setMedia(data.media || []);
      setIsUnlocked(data.isUnlocked || false);
      setPaystackConfigured(data.paystackConfigured !== false);
      if (data.clientEmail) setClientEmail(data.clientEmail);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Paystack sends the client back here with ?reference=…&trxref=… — confirm it, then tidy the URL.
  useEffect(() => {
    const url = new URL(window.location.href);
    const reference = url.searchParams.get('reference') || url.searchParams.get('trxref');
    if (!reference) return;

    (async () => {
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'We could not confirm that payment');
        setIsUnlocked(true);
        setJustUnlocked(true);
        await fetchGallery();
      } catch (err: any) {
        setPayError(err.message);
      } finally {
        window.history.replaceState({}, '', `/gallery/${slug}`);
      }
    })();
  }, [slug, fetchGallery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') setActiveIndex((p) => (p! > 0 ? p! - 1 : media.length - 1));
      if (e.key === 'ArrowRight') setActiveIndex((p) => (p! < media.length - 1 ? p! + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, media.length]);

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingPasscode(true);
    setPasscodeError(null);

    try {
      const res = await fetch(`/api/gallery/${slug}/verify-passcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'That passcode is not correct');

      await fetchGallery();
    } catch (err: any) {
      setPasscodeError(err.message);
    } finally {
      setVerifyingPasscode(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setPayError(null);

    try {
      const initRes = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: gallery.id,
          clientEmail,
          clientName: clientName || clientEmail.split('@')[0],
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || 'Payment could not be started');

      if (initData.authorizationUrl) {
        window.location.href = initData.authorizationUrl;
        return;
      }

      // Test mode: no Paystack key configured, so confirm the order locally.
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: initData.reference, projectId: gallery.id }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment could not be confirmed');

      setIsUnlocked(true);
      setShowCheckout(false);
      setJustUnlocked(true);
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="label">Loading</p>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl">Gallery unavailable</h1>
        <p className="mt-6 text-[15px] text-muted max-w-sm leading-relaxed">
          {error || 'This link does not point to a gallery.'}
        </p>
        <Link href="/" className="btn btn-ghost mt-12">
          Go to PayGallery
        </Link>
      </div>
    );
  }

  if (requiresPasscode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-sm text-center">
          <p className="label">{gallery.photographerName}</p>
          <h1 className="font-display text-4xl mt-6">{gallery.title}</h1>
          <p className="mt-6 text-[15px] text-muted leading-relaxed">
            This gallery is private. Enter the passcode your photographer sent you.
          </p>

          <form onSubmit={handleVerifyPasscode} className="mt-14">
            <input
              type="password"
              required
              autoFocus
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Passcode"
              className="field text-center tracking-[0.3em]"
            />

            {passcodeError && <p className="mt-6 text-[13px]">{passcodeError}</p>}

            <button type="submit" disabled={verifyingPasscode} className="btn btn-solid w-full mt-10">
              {verifyingPasscode ? 'Checking…' : 'View gallery'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isFree = gallery.priceNgn === 0 || !gallery.isPaywallActive;
  const showPaywallBar = !isFree || isUnlocked;
  const current = activeIndex !== null ? media[activeIndex] : null;

  return (
    <div className="min-h-screen flex flex-col pb-40">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between gap-6">
          <span className="font-display text-xl truncate">{gallery.photographerName}</span>
          <span className="label shrink-0">
            {isUnlocked ? 'Unlocked' : isFree ? 'Open gallery' : `₦${gallery.priceNgn.toLocaleString()} to download`}
          </span>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 w-full pt-28 pb-20 sm:pt-40 sm:pb-28">
        <p className="label">Your gallery</p>
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl mt-8 leading-[1.05] max-w-3xl break-words">
          {gallery.title}
        </h1>
        {gallery.description && (
          <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted">{gallery.description}</p>
        )}
        <p className="label mt-12">
          {media.length} files · click any photo to view it larger
        </p>
      </section>

      <main className="max-w-6xl mx-auto px-6 sm:px-10 w-full flex-1">
        {media.length === 0 ? (
          <p className="text-[15px] text-muted">
            Your photographer has not added any files to this gallery yet.
          </p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-10 [column-fill:_balance]">
            {media.map((item, idx) => {
              const isVideo = item.mimeType?.startsWith('video/');
              return (
                <div key={item.id} className="break-inside-avoid mb-10">
                  <button
                    onClick={() => setActiveIndex(idx)}
                    className="block w-full bg-soft overflow-hidden"
                  >
                    {isVideo ? (
                      <span className="flex items-center justify-center aspect-video label">
                        Video · {item.originalName}
                      </span>
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt={item.originalName}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    )}
                  </button>

                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <span className="text-[12px] text-muted truncate">{item.originalName}</span>
                    {isUnlocked && (
                      <a
                        href={`/api/gallery/${slug}/download?mediaId=${item.id}`}
                        className="text-[12px] link-underline shrink-0"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showPaywallBar && media.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-line">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-[15px]">
                {isUnlocked
                  ? justUnlocked
                    ? 'Payment confirmed. Your files are ready.'
                    : 'Your files are unlocked.'
                  : `Download all ${media.length} original files`}
              </p>
              <p className="label mt-2">
                {isUnlocked
                  ? 'Full resolution · one ZIP archive'
                  : `₦${gallery.priceNgn.toLocaleString()} · full resolution`}
              </p>
            </div>

            {isUnlocked ? (
              <a href={`/api/gallery/${slug}/download?all=true`} className="btn btn-solid">
                Download everything
              </a>
            ) : (
              <button onClick={() => setShowCheckout(true)} className="btn btn-solid">
                Pay ₦{gallery.priceNgn.toLocaleString()}
              </button>
            )}
          </div>
        </div>
      )}

      {activeIndex !== null && current && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="border-b border-line px-6 sm:px-10 h-20 flex items-center justify-between gap-6">
            <span className="label">
              {activeIndex + 1} / {media.length}
            </span>
            <div className="flex items-center gap-8 text-[13px]">
              {isUnlocked ? (
                <a
                  href={`/api/gallery/${slug}/download?mediaId=${current.id}`}
                  className="link-underline"
                >
                  Download
                </a>
              ) : (
                <button
                  onClick={() => {
                    setActiveIndex(null);
                    setShowCheckout(true);
                  }}
                  className="link-underline"
                >
                  Unlock to download
                </button>
              )}
              <button onClick={() => setActiveIndex(null)} className="text-muted hover:text-ink transition">
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 sm:p-12 min-h-0">
            {current.mimeType?.startsWith('video/') ? (
              <div className="text-center">
                <p className="font-display text-3xl">{current.originalName}</p>
                <p className="label mt-4">Video file · {formatBytes(current.sizeBytes)}</p>
              </div>
            ) : (
              <img
                src={current.previewUrl}
                alt={current.originalName}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>

          <div className="border-t border-line px-6 sm:px-10 h-20 flex items-center justify-between">
            <button
              onClick={() => setActiveIndex((p) => (p! > 0 ? p! - 1 : media.length - 1))}
              className="text-[13px] text-muted hover:text-ink transition"
            >
              ← Previous
            </button>
            <span className="label truncate px-6">{current.originalName}</span>
            <button
              onClick={() => setActiveIndex((p) => (p! < media.length - 1 ? p! + 1 : 0))}
              className="text-[13px] text-muted hover:text-ink transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="max-w-sm mx-auto px-6 py-20 sm:py-28">
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="label">Checkout</p>
                <h2 className="font-display text-4xl mt-5">Unlock your files</h2>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-[13px] text-muted hover:text-ink transition mt-2"
              >
                Close
              </button>
            </div>

            <div className="mt-12 border-y border-line py-8 flex items-baseline justify-between gap-6">
              <span className="text-[15px] truncate">{gallery.title}</span>
              <span className="font-display text-3xl shrink-0">
                ₦{gallery.priceNgn.toLocaleString()}
              </span>
            </div>

            <form onSubmit={handlePay} className="mt-12 space-y-10">
              <div>
                <label className="label block mb-3">Your name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Optional"
                  className="field"
                />
              </div>

              <div>
                <label className="label block mb-3">Your email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="field"
                />
                <p className="mt-3 text-[12px] text-muted leading-relaxed">
                  Your receipt and your access to this gallery are tied to this address.
                </p>
              </div>

              {payError && <p className="text-[13px] text-ink border-l border-ink pl-4">{payError}</p>}

              <button type="submit" disabled={paying} className="btn btn-solid w-full">
                {paying
                  ? 'Working…'
                  : paystackConfigured
                    ? `Pay ₦${gallery.priceNgn.toLocaleString()} with Paystack`
                    : `Complete test payment`}
              </button>

              {!paystackConfigured && (
                <p className="text-[12px] text-muted leading-relaxed">
                  Test mode: no Paystack keys are configured, so no card is charged and the gallery
                  unlocks immediately.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
