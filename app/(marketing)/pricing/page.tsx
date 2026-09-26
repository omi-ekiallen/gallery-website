import Link from 'next/link';
import type { Metadata } from 'next';
import { TIERS } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Pricing — PayGallery',
  description:
    'Storage that fits your workflow. Start free and upgrade when you need more room. No unlimited plans.',
};

const questions = [
  {
    q: 'Can I start for free?',
    a: 'Yes. Create an account and start on the Free plan.',
  },
  {
    q: 'Can my client view the gallery before paying?',
    a: 'Yes. They can browse the gallery while the frames stay blurred, so you control access to the finished files without hiding the work.',
  },
  {
    q: 'Do I need to use a separate payment platform?',
    a: 'No. Payments are integrated into the delivery workflow and unlock the download automatically once confirmed.',
  },
  {
    q: 'Can I create multiple projects?',
    a: 'Yes, subject to the storage and limits of your plan.',
  },
];

export default function PricingPage() {
  return (
    <div>
      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Pricing</p>
          <h1 className="display-hero mt-6 max-w-3xl">Storage that fits your workflow.</h1>
          <p className="body-lg mt-8 max-w-xl text-ink-soft">
            Start free and upgrade when you need more room. Every plan gives you the tools you need
            to create galleries and deliver your work.
          </p>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 border border-ink">
            {Object.values(TIERS).map((t, i) => (
              <div
                key={t.id}
                className={`p-6 lg:p-8 flex flex-col ${
                  i > 0 ? 'border-t md:border-t-0 md:border-l border-rule' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="headline-md">{t.name}</h2>
                  {t.id === 'tier_2' && <span className="badge label-caps">Most chosen</span>}
                </div>

                <p className="ledger-lg mt-6">
                  {t.priceMonthlyNGN === 0 ? '₦0' : `₦${t.priceMonthlyNGN.toLocaleString()}`}
                </p>
                <p className="label-caps text-ink-soft mt-2">
                  {t.priceMonthlyNGN === 0 ? `${t.storageLabel} included` : `Per month · ${t.storageLabel}`}
                </p>

                <p className="body-md mt-6 text-ink-soft min-h-[60px]">{t.description}</p>

                <ul className="mt-8 space-y-2 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="body-md text-ink-soft flex gap-3">
                      <span className="text-green">—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?tier=${t.id}`}
                  className={`mt-8 w-full ${t.id === 'tier_2' ? 'btn btn-primary' : 'btn btn-outline'}`}
                >
                  {t.id === 'free' ? 'Start free' : `Choose ${t.name.split(' ')[0]}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="label-caps text-ink-soft">No unlimited plans</p>
            <h2 className="headline-lg mt-4">Storage should be simple.</h2>
          </div>
          <div className="body-lg text-ink-soft space-y-4">
            <p>
              Every account has a clear storage allowance, so you know exactly what you are getting.
            </p>
            <p>Need more space? Upgrade your plan.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Questions</p>
          <div className="mt-10 border border-ink">
            {questions.map((item, i) => (
              <div
                key={item.q}
                className={`p-6 lg:p-8 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-3 md:gap-10 ${
                  i > 0 ? 'border-t border-rule' : ''
                }`}
              >
                <h3 className="headline-sm">{item.q}</h3>
                <p className="body-md text-ink-soft">{item.a}</p>
              </div>
            ))}
          </div>

          <Link href="/faq" className="btn btn-outline mt-10">
            Read the full FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
