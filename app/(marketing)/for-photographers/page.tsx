import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For photographers — PayGallery',
  description:
    'Your job is to create the work, not chase the payment. Give your client a proper gallery and a clear path to download their final files.',
};

const workflow = [
  { title: 'Create a project.', body: 'One client. One project. One place for their files.' },
  { title: 'Upload your work.', body: 'Get your finished photos or videos into the gallery.' },
  { title: 'Share the gallery.', body: 'Send your client a private link.' },
  { title: 'Get paid.', body: 'Set the download price and let your client complete payment.' },
  { title: 'Deliver.', body: 'Payment confirmed. Downloads unlocked.' },
];

const shoots = [
  'Wedding photos',
  'Birthday shoots',
  'Portrait sessions',
  'Corporate events',
  'Graduation photos',
  'Brand photography',
  'Event coverage',
];

export default function ForPhotographersPage() {
  return (
    <div>
      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">For photographers</p>
          <h1 className="display-hero mt-6 max-w-3xl">
            Your job is to create the work. Not chase the payment.
          </h1>
          <div className="body-lg mt-8 max-w-xl text-ink-soft space-y-4">
            <p>
              You planned the shoot. You showed up. You captured the moments. You edited the photos.
              Now it&rsquo;s time to deliver.
            </p>
            <p>
              Instead of sending a folder and hoping the payment comes through, give your client a
              proper gallery and a clear path to download their final files.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Built around your workflow</p>

          <div className="mt-10 border border-ink">
            {workflow.map((w, i) => (
              <div
                key={w.title}
                className={`p-6 lg:p-8 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3 md:gap-10 ${
                  i > 0 ? 'border-t border-rule' : ''
                }`}
              >
                <h2 className="headline-md">{w.title}</h2>
                <p className="body-md text-ink-soft">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="label-caps text-ink-soft">Perfect for client-based photography</p>
            <h2 className="headline-lg mt-4">Whatever you are delivering, the flow is the same.</h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 h-fit">
            {shoots.map((s) => (
              <li key={s} className="body-lg text-ink-soft flex gap-3">
                <span className="text-green">—</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Less chasing. More creating.</p>
          <h2 className="headline-lg mt-4 max-w-2xl">
            You shouldn&rsquo;t have to manually track who paid and who downloaded.
          </h2>
          <div className="body-lg mt-8 max-w-xl text-ink-soft space-y-2">
            <p>&ldquo;Has the client paid?&rdquo;</p>
            <p>&ldquo;Did they download the files?&rdquo;</p>
            <p>&ldquo;Should I send the folder now?&rdquo;</p>
          </div>
          <p className="body-lg mt-8">
            Create great work. Share it. Get paid. Deliver it.
          </p>
          <Link href="/register" className="btn btn-primary mt-10">
            Start free
          </Link>
        </div>
      </section>
    </div>
  );
}
