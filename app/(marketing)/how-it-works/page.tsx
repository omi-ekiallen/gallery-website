import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How it works — PayGallery',
  description:
    'From uploading your work to getting paid and delivering the final files: one simple workflow for client delivery.',
};

const steps = [
  {
    n: '01',
    title: 'Create your project',
    body: 'Give every client or shoot its own project — "Tolu & Kemi — Wedding 2026" — and keep everything for that client in one place.',
  },
  {
    n: '02',
    title: 'Upload your work',
    body: 'Upload the photos or videos from the project. Your available storage depends on your account plan.',
  },
  {
    n: '03',
    title: 'Create your private gallery',
    body: 'Your project becomes a shareable client gallery. Protect it with a passcode and share the link directly with your client.',
  },
  {
    n: '04',
    title: 'Set your download price',
    body: 'Choose how much your client needs to pay before downloading the final files. You decide the price.',
  },
  {
    n: '05',
    title: 'Send the link',
    body: 'Send the gallery link and passcode to your client. They can open the gallery and view their work — every frame blurred until the gate clears.',
  },
  {
    n: '06',
    title: 'Client pays',
    body: 'When they are ready to download, they complete the payment. It is processed securely through the supported payment gateway.',
  },
  {
    n: '07',
    title: 'Download unlocked',
    body: 'Once payment is successfully confirmed, the client’s download access is unlocked. That’s it.',
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">How it works</p>
          <h1 className="display-hero mt-6 max-w-3xl">
            One simple workflow for client delivery.
          </h1>
          <p className="body-lg mt-8 max-w-xl text-ink-soft">
            From uploading your work to getting paid and delivering the final files.
          </p>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <div className="border border-ink">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`p-6 lg:p-8 grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4 md:gap-10 ${
                  i > 0 ? 'border-t border-rule' : ''
                }`}
              >
                <p className="label-caps text-brass">{s.n}</p>
                <div>
                  <h2 className="headline-md">{s.title}</h2>
                  <p className="body-md mt-3 text-ink-soft max-w-2xl">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <h2 className="headline-lg max-w-xl">Your entire delivery workflow in one place.</h2>
          <p className="label-caps text-ink-soft mt-6">
            Upload → Gallery → Payment → Download
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/register" className="btn btn-primary">
              Create your free account
            </Link>
            <Link href="/pricing" className="btn btn-outline">
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
