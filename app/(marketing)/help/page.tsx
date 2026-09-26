import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Help & contact — PayGallery',
  description:
    'Setting up your first gallery, payment trouble, or access problems — how to get help and what to check first.',
};

const troubleshooting = [
  {
    title: "I'm having trouble uploading files",
    points: [
      'Your files are a supported type.',
      'You have enough storage available.',
      'Your internet connection is stable.',
      'Your files do not exceed the applicable upload limits.',
    ],
    after: 'Still stuck? Contact support and include the project name and a description of the problem.',
  },
  {
    title: "My client's payment was successful but their download is still locked",
    points: [
      'Do not ask the client to pay again.',
      'Check the transaction status in your ledger first.',
      'If the payment succeeded but nothing unlocked, contact support with the transaction reference.',
    ],
  },
  {
    title: "My client says they can't access the gallery",
    points: [
      'They have the correct gallery link, including your studio address.',
      'They have the correct passcode.',
      'The project is still active.',
      'The gallery has not been deleted.',
    ],
    after: 'If everything looks correct, contact us.',
  },
  {
    title: 'I need more storage',
    points: ['Upgrade your account to a plan with a larger storage allowance.'],
  },
  {
    title: 'I want to delete my account',
    points: [
      'Request account deletion through your account settings or by contacting support.',
      'Download any files you want to keep before deleting your account.',
    ],
  },
];

export default function HelpPage() {
  return (
    <div>
      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Help &amp; contact</p>
          <h1 className="display-hero mt-6 max-w-3xl">Need a hand?</h1>
          <p className="body-lg mt-8 max-w-xl text-ink-soft">
            Whether you are setting up your first gallery, having trouble with a payment, or just
            aren&rsquo;t sure how something works, we are here to help.
          </p>
        </div>
      </section>

      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="label-caps text-ink-soft">Email support</p>
            <h2 className="headline-lg mt-4">Tell us what&rsquo;s happening.</h2>
            <p className="body-md mt-6 text-ink-soft">
              We aim to respond within {SITE.supportHours}.
            </p>
            <a href={`mailto:${SITE.supportEmail}`} className="btn btn-primary mt-8">
              Email {SITE.supportEmail}
            </a>
          </div>

          <div className="border border-ink h-fit">
            <div className="band px-5 py-4">
              <p className="label-caps text-ink-soft">Before contacting us</p>
            </div>
            <div className="p-5">
              <p className="body-md text-ink-soft">
                You may find your answer faster in the FAQ, which covers galleries, payments,
                storage, files and account questions.
              </p>
              <Link href="/faq" className="btn btn-outline mt-6 w-full">
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Common issues</p>

          <div className="mt-10 border border-ink">
            {troubleshooting.map((item, i) => (
              <div key={item.title} className={`p-6 lg:p-8 ${i > 0 ? 'border-t border-rule' : ''}`}>
                <h2 className="headline-md">{item.title}</h2>
                <ul className="mt-4 space-y-2">
                  {item.points.map((p) => (
                    <li key={p} className="body-md text-ink-soft flex gap-3">
                      <span className="text-green">—</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                {item.after && <p className="body-md mt-4 text-ink-soft">{item.after}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
