import Link from 'next/link';
import { TIERS } from '@/lib/types';

const steps = [
  { n: '01', title: 'Upload', desc: 'Add the full-resolution photos and video files from the shoot.' },
  { n: '02', title: 'Protect', desc: 'Set a passcode and the price your client pays to download.' },
  { n: '03', title: 'Share', desc: 'Send one private link. No accounts, no file transfers.' },
  { n: '04', title: 'Get paid', desc: 'The originals unlock the moment the payment clears.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl">
            PayGallery
          </Link>
          <nav className="flex items-center gap-8 text-[13px]">
            <Link href="/login" className="link-underline">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-solid !py-3 !px-6">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 w-full pt-32 pb-36 sm:pt-44 sm:pb-52">
        <p className="label">For photographers</p>
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05] mt-8 max-w-3xl">
          Deliver the gallery.
          <br />
          Get paid before
          <br />
          the download.
        </h1>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted">
          One private link for each client. They browse the proofs, pay, and the full-resolution
          files unlock instantly.
        </p>
        <div className="mt-14 flex flex-col sm:flex-row gap-4 sm:gap-6">
          <Link href="/register" className="btn btn-solid">
            Start your first gallery
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Sign in to your studio
          </Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-28 sm:py-36">
          <p className="label">How it works</p>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-display text-3xl text-muted">{s.n}</span>
                <h3 className="font-display text-2xl mt-6">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-28 sm:py-36">
          <p className="label">Storage plans</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-8 max-w-xl leading-tight">
            Three plans. No unlimited promises.
          </h2>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
            {Object.values(TIERS).map((t) => (
              <div key={t.id} className="bg-white p-10 sm:p-12 flex flex-col">
                <h3 className="font-display text-3xl">{t.name}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-muted min-h-[72px]">
                  {t.description}
                </p>
                <p className="font-display text-4xl mt-8">
                  {t.priceMonthlyNGN === 0 ? 'Free' : `₦${t.priceMonthlyNGN.toLocaleString()}`}
                  {t.priceMonthlyNGN > 0 && (
                    <span className="text-base text-muted"> / month</span>
                  )}
                </p>
                <p className="label mt-4">{t.storageLabel} storage</p>

                <ul className="mt-10 space-y-3 text-[15px] text-muted flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <span className="text-ink">—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?tier=${t.id}`}
                  className="btn btn-ghost mt-12 w-full"
                >
                  Choose {t.name.split(' ')[0]}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line mt-auto">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-[13px] text-muted">
          <span className="font-display text-xl text-ink">PayGallery</span>
          <div className="flex items-center gap-8">
            <Link href="/login" className="link-underline">
              Sign in
            </Link>
            <Link href="/register" className="link-underline">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
