import Link from 'next/link';
import { TIERS } from '@/lib/types';

const steps = [
  { n: '01', title: 'Upload', desc: "Create a project and upload your client's photos or videos." },
  { n: '02', title: 'Share', desc: 'Create a private gallery and send the link to your client.' },
  { n: '03', title: 'Get paid', desc: 'Set your price and let your client pay securely before downloading.' },
  { n: '04', title: 'Deliver', desc: 'Once payment is confirmed, your client gets access to their downloads.' },
];

const occasions = [
  'Weddings',
  'Birthdays',
  'Corporate events',
  'Portrait sessions',
  'Graduations',
  'Brand shoots',
  'Events & celebrations',
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">For photographers</p>
          <h1 className="display-hero mt-6 max-w-3xl">
            Your work deserves to be paid for before it leaves your hands.
          </h1>
          <p className="body-lg mt-8 max-w-xl text-ink-soft">
            Upload your photos, create a beautiful client gallery, share the link, and collect
            payment before your client downloads the final files.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/register" className="btn btn-primary">
              Get started free
            </Link>
            <Link href="/how-it-works" className="btn btn-outline">
              See how it works
            </Link>
          </div>

          <p className="body-sm text-ink-soft mt-8">
            No unlimited plans. No complicated setup. Just a simpler way to deliver client work.
          </p>
        </div>
      </section>

      <section className="band">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-7 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {[
            { label: 'Client galleries', value: 'Private link' },
            { label: 'Access control', value: 'Passcode' },
            { label: 'Settlement', value: 'Paystack' },
            { label: 'Delivery', value: 'ZIP archive' },
          ].map((item) => (
            <div key={item.label}>
              <p className="label-caps text-ink-soft">{item.label}</p>
              <p className="ledger-md mt-2">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="label-caps text-ink-soft">The problem</p>
            <h2 className="headline-lg mt-4">Stop chasing clients for payment after delivery.</h2>
          </div>
          <div className="body-lg text-ink-soft space-y-4">
            <p>You&rsquo;ve finished the shoot. The photos are edited. The gallery is ready. The client is waiting.</p>
            <p className="text-ink">But there&rsquo;s still one problem: getting paid.</p>
            <p>
              You shouldn&rsquo;t have to send your files through one platform, request payment
              through another, and manually unlock everything after the client pays.
            </p>
            <p>We put the important parts together.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">How it works</p>
          <h2 className="headline-lg mt-4 max-w-xl">From finished shoot to paid delivery.</h2>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-ink">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`p-6 lg:p-8 ${i > 0 ? 'border-t sm:border-t-0 sm:border-l border-rule' : ''} ${
                  i === 2 ? 'sm:border-t sm:border-l-0 lg:border-t-0 lg:border-l' : ''
                } ${i === 3 ? 'sm:border-t lg:border-t-0' : ''}`}
              >
                <p className="label-caps text-brass">{s.n}</p>
                <h3 className="headline-md mt-4">{s.title}</h3>
                <p className="body-md mt-3 text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>

          <p className="label-caps text-ink-soft mt-8">
            Upload → Share → Get paid → Deliver
          </p>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="label-caps text-ink-soft">The paywall</p>
            <h2 className="headline-lg mt-4">
              Let them see the work. Get paid before they download it.
            </h2>
            <p className="body-lg mt-6 text-ink-soft">
              Give your clients a place to view their photos without immediately handing over the
              final files. When they&rsquo;re ready to download, they pay. Once payment is
              confirmed, the files are unlocked.
            </p>
            <p className="body-lg mt-6">
              No awkward payment reminders. No manual confirmation. No &ldquo;please send the
              balance before I send the pictures.&rdquo;
            </p>
          </div>

          <div className="border border-ink h-fit">
            <div className="band px-5 py-4">
              <p className="label-caps text-ink-soft">Keep client galleries private</p>
            </div>
            <div className="p-5">
              <p className="body-md text-ink-soft">
                Protect your projects with a passcode so only the people you share it with can open
                the gallery. Until they do, every frame stays blurred.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
                {occasions.map((o) => (
                  <li key={o} className="body-md text-ink-soft flex gap-2">
                    <span className="text-green">—</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Pricing</p>
          <h2 className="headline-lg mt-4 max-w-xl">
            Start free. Upgrade when you need more space.
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 border border-ink">
            {Object.values(TIERS).map((t, i) => (
              <div
                key={t.id}
                className={`p-6 lg:p-8 ${i > 0 ? 'border-t md:border-t-0 md:border-l border-rule' : ''}`}
              >
                <h3 className="headline-md">{t.name}</h3>
                <p className="ledger-lg mt-4">
                  {t.priceMonthlyNGN === 0 ? 'Free' : `₦${t.priceMonthlyNGN.toLocaleString()}`}
                </p>
                <p className="label-caps text-ink-soft mt-2">
                  {t.priceMonthlyNGN === 0 ? `${t.storageLabel} included` : `Per month · ${t.storageLabel}`}
                </p>
                <p className="body-md mt-6 text-ink-soft">{t.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link href="/pricing" className="btn btn-outline">
              View pricing
            </Link>
            <p className="body-sm text-ink-soft">
              No unlimited plans. Just straightforward storage limits that grow with your business.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Ready to deliver differently?</p>
          <h2 className="display-hero mt-6 max-w-2xl">
            From your camera to your client&rsquo;s hands.
          </h2>
          <p className="body-lg mt-8 max-w-xl text-ink-soft">
            Create your first gallery and experience a simpler way to get your work delivered and
            paid for.
          </p>
          <Link href="/register" className="btn btn-primary mt-10">
            Create your free account
          </Link>
        </div>
      </section>
    </div>
  );
}
