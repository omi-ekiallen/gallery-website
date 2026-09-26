import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import LegalDocument, { LegalSection } from '../legal-document';

export const metadata: Metadata = {
  title: 'Terms & conditions — PayGallery',
  description:
    'The terms governing your access to and use of the PayGallery website, application, storage, galleries and payment features.',
};

const sections: LegalSection[] = [
  {
    heading: 'About the service',
    blocks: [
      `${SITE.productName} provides tools that allow users, particularly photographers and creative professionals, to:`,
      {
        list: [
          'Upload and store digital files.',
          'Organise files into projects or galleries.',
          'Create private, shareable gallery links.',
          'Protect galleries with passcodes.',
          'Set prices for downloadable files.',
          'Receive payments from clients.',
          'Provide clients with access to downloads after successful payment.',
        ],
      },
      `${SITE.productName} is a technology platform. We do not own, create, inspect, or take responsibility for the content uploaded by users unless required to do so by law or these Terms.`,
    ],
  },
  {
    heading: 'Your account',
    blocks: [
      'You must provide accurate information when creating an account.',
      {
        subheading: 'You are responsible for',
        list: [
          'Keeping your login credentials secure.',
          'Maintaining the accuracy of your account information.',
          'All activity carried out through your account.',
          'Immediately notifying us if you believe your account has been compromised.',
        ],
      },
      'You must not share your account credentials with another person or allow another person to use your account in a way that violates these Terms.',
    ],
  },
  {
    heading: 'Eligibility',
    blocks: [
      'You must be legally capable of entering into a binding agreement to use the Service.',
      `If you are using ${SITE.productName} on behalf of a business or organisation, you confirm that you have authority to bind that organisation to these Terms.`,
    ],
  },
  {
    heading: 'Your content',
    blocks: [
      `You retain ownership of the photos, videos, files, text and other content you upload to ${SITE.productName} ("Your Content").`,
      `You grant ${SITE.companyName} a limited, non-exclusive licence to host, store, process, transmit and display Your Content only as reasonably necessary to provide and operate the Service.`,
      'We do not acquire ownership of Your Content simply because you upload it to the platform.',
      'You are responsible for ensuring that you have the necessary rights, permissions, licences and consents to upload and distribute Your Content.',
    ],
  },
  {
    heading: 'Prohibited content and activities',
    blocks: [
      'You may not use the Service to upload, store, distribute or facilitate content or activity that:',
      {
        list: [
          'Violates applicable law.',
          "Infringes another person's intellectual property rights.",
          "Violates another person's privacy or publicity rights.",
          'Contains malware, malicious code or harmful software.',
          'Facilitates fraud, scams or other unlawful activity.',
          'Exploits or endangers children.',
          'Contains unlawful sexually explicit material.',
          "Attempts to gain unauthorised access to the Service or another user's account.",
          'Interferes with the operation or security of the platform.',
        ],
      },
      'We reserve the right to remove content or restrict accounts where reasonably necessary to enforce these Terms, protect users, comply with the law, or protect the security of the Service.',
    ],
  },
  {
    heading: 'Storage and account limits',
    blocks: [
      'Each plan includes a defined storage allowance, and your available storage depends on the plan associated with your account. You may not exceed your storage allowance.',
      'If you reach your storage limit, you may need to delete existing files or upgrade your plan before uploading additional content.',
      'Storage limits, plan features and pricing may change from time to time. Where changes materially affect an existing paid subscription, we will provide reasonable notice where required.',
    ],
  },
  {
    heading: 'Paid plans',
    blocks: [
      'Some features require a paid subscription. Paid plans are billed according to the pricing and billing period displayed when you subscribe.',
      {
        subheading: 'Unless otherwise stated',
        list: [
          'Subscription fees are charged in advance.',
          'Your subscription renews according to the selected billing period.',
          'You are responsible for maintaining valid payment information.',
          'Failure to complete payment may result in downgrade, suspension or restriction of paid features.',
        ],
      },
      'Prices may change in the future. We will provide reasonable notice of material changes to recurring subscription prices.',
    ],
  },
  {
    heading: 'Client payments',
    blocks: [
      `${SITE.productName} may allow you to set a price that your client must pay before accessing certain downloads.`,
      {
        subheading: 'You are responsible for',
        list: [
          'Setting the correct price.',
          'Providing accurate descriptions of what the client is purchasing.',
          'Having the legal right to sell or distribute the files.',
          'Resolving disputes regarding the underlying goods or services you provided to the client.',
        ],
      },
      `${SITE.productName} provides the payment and delivery technology but is not the seller of your photography, creative services or digital files.`,
    ],
  },
  {
    heading: 'Payment processing',
    blocks: [
      'Payments may be processed through third-party payment providers such as Paystack, Flutterwave, or other providers supported by the Service.',
      "Your use of payment services may also be subject to the payment provider's own terms and policies.",
      'We do not store complete payment-card information unless expressly stated otherwise.',
      'Payment confirmations may be used to automatically unlock downloads where the payment provider confirms a successful transaction.',
    ],
  },
  {
    heading: 'Refunds',
    blocks: [
      'Refunds for client purchases are generally the responsibility of the seller who created the gallery.',
      'If a client believes they were incorrectly charged, received an incorrect product, or experienced a problem with a purchase, they should first contact the photographer who created the gallery.',
      `Where a payment was not processed correctly by the platform, contact ${SITE.supportEmail} with the transaction reference and we will investigate.`,
    ],
  },
  {
    heading: 'Service availability',
    blocks: [
      'We aim to keep the Service available and working, but we do not guarantee uninterrupted or error-free operation.',
      'The Service may be unavailable during maintenance, updates, or circumstances outside our reasonable control.',
      'You are responsible for keeping your own backups of any files you upload.',
    ],
  },
  {
    heading: 'Disclaimers',
    blocks: [
      'The Service is provided on an "as is" and "as available" basis to the fullest extent permitted by applicable law.',
      'We do not warrant that the Service will meet your requirements, or that any defect will be corrected.',
      'Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law.',
    ],
  },
  {
    heading: 'Limitation of liability',
    blocks: [
      'To the fullest extent permitted by applicable law, we are not liable for indirect, incidental, special, consequential or punitive damages, or for loss of profits, revenue, data or goodwill.',
      'Where liability cannot lawfully be excluded, our total liability arising out of or relating to the Service is limited to the amount you paid us for the Service in the twelve months before the event giving rise to the claim.',
    ],
  },
  {
    heading: 'Suspension and termination',
    blocks: [
      'You may stop using the Service and close your account at any time.',
      'We may suspend or terminate access where reasonably necessary to enforce these Terms, protect users or the platform, or comply with the law.',
      'Download any files you wish to keep before closing your account, as content may be deleted after termination.',
    ],
  },
  {
    heading: 'Changes to these terms',
    blocks: [
      'We may update these Terms as the Service develops or as legal requirements change.',
      'When material changes are made, we will take reasonable steps to notify users, and the updated version will be published on this page with a new "Last updated" date.',
      'Continuing to use the Service after changes take effect means you accept the updated Terms.',
    ],
  },
  {
    heading: 'Governing law and contact',
    blocks: [
      'These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law principles.',
      `Questions about these Terms: ${SITE.supportEmail} — ${SITE.companyName}, ${SITE.websiteUrl}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms & conditions"
      intro={[
        `Welcome to ${SITE.productName}.`,
        `These Terms & Conditions ("Terms") govern your access to and use of the ${SITE.productName} website, application, services, storage, galleries, payment features and related services (collectively, the "Service").`,
        'By creating an account or using the Service, you agree to these Terms. If you do not agree with these Terms, please do not use the Service.',
      ]}
      sections={sections}
    />
  );
}
