import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Frequently asked questions — PayGallery',
  description:
    'Galleries, payments, storage, files, accounts and security — the common questions about delivering client work through PayGallery.',
};

const sections = [
  {
    title: 'General',
    items: [
      {
        q: `What is ${SITE.productName}?`,
        a: `${SITE.productName} is a client gallery and paid digital-delivery platform for photographers and creative professionals. You upload your work, create a gallery, share it with your client, and require payment before downloads are unlocked.`,
      },
      {
        q: 'Is this like Pixieset?',
        a: 'The idea is similar in that you create client galleries and share them with clients. This product is intentionally focused on a smaller set of features, with paid downloads and payment-gated delivery at the centre.',
      },
      {
        q: 'Who is it for?',
        a: 'Wedding, event, portrait and brand photographers, videographers, and other creative professionals delivering digital files to clients.',
      },
    ],
  },
  {
    title: 'Galleries',
    items: [
      {
        q: 'What is a project?',
        a: 'A project is a workspace for a particular client or shoot — for example "Ada & Mike — Wedding". You upload the relevant files and the project becomes the client gallery.',
      },
      {
        q: 'Can I create multiple projects?',
        a: "Yes, subject to your account's storage and plan limits.",
      },
      {
        q: 'Can I share my gallery with a client?',
        a: 'Yes. Each project has a shareable link in the form your-site.com/your-studio/gallery/the-shoot that you can send directly to your client.',
      },
      {
        q: 'Can I protect my gallery with a passcode?',
        a: 'Yes. Visitors need the correct passcode before the gallery opens, and every frame stays blurred until it is entered.',
      },
    ],
  },
  {
    title: 'Payments',
    items: [
      {
        q: 'Can I charge my clients through the platform?',
        a: 'Yes. Set a price for downloads and the client must complete payment before downloading.',
      },
      {
        q: 'How does the paywall work?',
        a: 'Client opens the gallery → views the blurred frames → pays → the download unlocks. Once payment is confirmed, the full-resolution files become available.',
      },
      {
        q: 'What payment methods can my clients use?',
        a: 'Available payment methods depend on the payment provider and the configuration supported by the platform.',
      },
      {
        q: 'What happens if a payment fails?',
        a: 'The download stays locked until a successful payment is confirmed. The client can try again.',
      },
      {
        q: 'What happens if a client pays but cannot download?',
        a: `Contact support with the transaction reference at ${SITE.supportEmail} and we can investigate the payment and delivery status.`,
      },
    ],
  },
  {
    title: 'Storage & plans',
    items: [
      {
        q: 'Is there a free plan?',
        a: 'Yes. Start on the Free plan and upgrade when you need additional storage.',
      },
      {
        q: 'Do you offer unlimited storage?',
        a: 'No. There are three plans, each with a defined storage allowance. This keeps pricing straightforward and predictable.',
      },
      {
        q: 'What happens when I run out of storage?',
        a: 'Delete files you no longer need, or upgrade to a plan with more storage.',
      },
    ],
  },
  {
    title: 'Files',
    items: [
      {
        q: 'Can I upload photos?',
        a: 'Yes. Photos are the primary file type supported by the platform.',
      },
      {
        q: 'Can I upload videos?',
        a: "Video uploads are supported where enabled by your plan and the platform's current upload limits.",
      },
      {
        q: 'Does the platform edit my photos?',
        a: 'No. The focus is uploading, galleries, sharing, payment and downloads.',
      },
      {
        q: 'Does the platform watermark my photos?',
        a: 'Locked galleries are watermarked automatically: until the passcode is entered and the payment clears, clients only ever receive a blurred, watermarked rendering. Delivered files are never watermarked.',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Choose Get started and complete the registration form.',
      },
      {
        q: 'Can I upgrade my plan later?',
        a: 'Yes, whenever you need more storage.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, according to the cancellation process provided in your account. Access to paid features is handled under the applicable subscription terms.',
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        q: 'Are my files secure?',
        a: 'We use reasonable security measures to protect your account and uploaded files. No online storage service can guarantee absolute security, so keep backups of important files.',
      },
      {
        q: 'Can anyone access my gallery?',
        a: 'Only people with the gallery link and, where enabled, the correct passcode. Treat gallery links and passcodes as private information.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div>
      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">Support</p>
          <h1 className="display-hero mt-6 max-w-3xl">Frequently asked questions</h1>
        </div>
      </section>

      <section>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          {sections.map((section) => (
            <div key={section.title} className="mb-16 last:mb-0">
              <p className="label-caps text-ink-soft">{section.title}</p>

              <div className="mt-6 border border-ink">
                {section.items.map((item, i) => (
                  <div
                    key={item.q}
                    className={`p-6 lg:p-8 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-3 md:gap-10 ${
                      i > 0 ? 'border-t border-rule' : ''
                    }`}
                  >
                    <h2 className="headline-sm">{item.q}</h2>
                    <p className="body-md text-ink-soft">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-rule pt-10">
            <h2 className="headline-md">Still need help?</h2>
            <p className="body-md mt-3 text-ink-soft">
              Email {SITE.supportEmail} and we will help you get back to delivering your work.
            </p>
            <Link href="/help" className="btn btn-outline mt-8">
              Help &amp; contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
