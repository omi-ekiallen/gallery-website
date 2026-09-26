import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import LegalDocument, { LegalSection } from '../legal-document';

export const metadata: Metadata = {
  title: 'Privacy policy — PayGallery',
  description:
    'How we collect, use, store, disclose and protect personal information when you use PayGallery.',
};

const sections: LegalSection[] = [
  {
    heading: 'Who we are',
    blocks: [
      `Data controller: ${SITE.companyName}.`,
      `Website: ${SITE.websiteUrl}. Privacy contact: ${SITE.privacyEmail}.`,
      `For the purposes of applicable data protection laws, including the Nigeria Data Protection Act 2023 ("NDPA"), ${SITE.companyName} is responsible for determining how and why personal data is processed through the Service.`,
    ],
  },
  {
    heading: 'Information we collect',
    blocks: [
      'Depending on how you use the Service, we may collect:',
      {
        subheading: 'Account information',
        list: [
          'Name',
          'Email address',
          'Password or authentication information',
          'Business name and studio address',
          'Account and subscription information',
        ],
      },
      {
        subheading: 'Gallery information',
        list: [
          'Project and gallery titles',
          'Photos, videos and other files you upload',
          'Gallery descriptions',
          'Passcodes',
          'Download settings',
          'Client information you choose to provide',
        ],
      },
      {
        subheading: 'Payment information',
        list: [
          'Transaction reference',
          'Amount paid and currency',
          'Payment status and date',
          'Limited payment-related information',
        ],
      },
      'We do not need to store your complete card details to provide the Service.',
      {
        subheading: 'Technical information',
        list: [
          'IP address',
          'Browser and device type',
          'Operating system',
          'Approximate location derived from technical information',
          'Pages visited and login activity',
          'Error and diagnostic information',
        ],
      },
    ],
  },
  {
    heading: 'How we use your information',
    blocks: [
      {
        list: [
          'Create and manage your account.',
          'Provide the Service and store and display your uploaded content.',
          'Create and operate galleries.',
          'Process subscriptions and facilitate client payments.',
          'Confirm successful transactions and unlock downloads.',
          'Provide customer support.',
          'Maintain platform security and prevent fraud and abuse.',
          'Improve the Service and communicate important service information.',
          'Comply with applicable legal obligations.',
        ],
      },
      'We will not use your uploaded photographs for advertising, AI training, or unrelated purposes unless we clearly tell you and have an appropriate legal basis to do so.',
    ],
  },
  {
    heading: 'Lawful bases for processing',
    blocks: [
      'Depending on the circumstances, we may process personal data based on performance of a contract, your consent, compliance with legal obligations, legitimate interests where permitted by applicable law, and protection of rights, safety and security.',
      "We aim to collect only information that is reasonably necessary for the purposes for which it is processed. The NDPC's published guidance emphasises lawful and transparent processing, purpose limitation, data minimisation, storage limitation, accuracy and security.",
    ],
  },
  {
    heading: 'Your uploaded content',
    blocks: [
      'You retain ownership of content you upload. We process your content so that we can provide the Service.',
      'For example, if you upload wedding photographs and create a gallery, we need to store and transmit those photographs so that you and authorised gallery visitors can access them.',
      'You are responsible for ensuring that you have the necessary permission to upload and share personal information and photographs of other people.',
    ],
  },
  {
    heading: 'Information about your clients',
    blocks: [
      `If you use ${SITE.productName} to create galleries for clients, you may upload or otherwise process personal information belonging to those clients.`,
      'You are responsible for ensuring that your use of their information complies with applicable privacy and data-protection laws.',
      `Depending on how the Service is used, you may act as the party determining the purpose of processing client information, while ${SITE.companyName} processes that information to provide the technical service.`,
    ],
  },
  {
    heading: 'Payment providers',
    blocks: [
      'We may use third-party payment providers such as Paystack, Flutterwave, or other supported providers. When you or a client makes a payment, the provider may independently process personal and financial information according to its own privacy policy.',
      {
        subheading: 'We may receive transaction information to',
        list: [
          'Confirm payment.',
          'Record transactions.',
          'Provide receipts or confirmations.',
          'Unlock downloads.',
          'Prevent fraud.',
          'Resolve payment disputes.',
        ],
      },
    ],
  },
  {
    heading: 'Service providers',
    blocks: [
      {
        subheading: 'We may use trusted providers for',
        list: [
          'Cloud hosting and storage.',
          'Payment processing.',
          'Authentication.',
          'Email delivery.',
          'Analytics.',
          'Security monitoring.',
          'Customer support.',
        ],
      },
      'These providers may process information on our behalf and are expected to handle information in accordance with applicable contractual and legal requirements.',
    ],
  },
  {
    heading: 'International transfers',
    blocks: [
      'Some service providers may process or store information outside Nigeria. Where personal data is transferred across borders, we will take appropriate steps required by applicable data-protection law.',
    ],
  },
  {
    heading: 'Data security',
    blocks: [
      'We use reasonable technical and organisational safeguards designed to protect personal information against unauthorised access, alteration, disclosure, loss or destruction.',
      {
        subheading: 'Measures may include',
        list: [
          'Encryption in transit.',
          'Access controls and authentication protections.',
          'Gated galleries that only ever serve blurred, watermarked renderings until access is granted.',
          'Secure infrastructure, monitoring and logging.',
          'Backup and recovery measures.',
        ],
      },
      'However, no internet service can guarantee absolute security.',
    ],
  },
  {
    heading: 'How long we keep information',
    blocks: [
      {
        subheading: 'We retain personal information as long as reasonably necessary to',
        list: [
          'Provide the Service and maintain your account.',
          'Complete transactions.',
          'Meet legal obligations.',
          'Resolve disputes and prevent fraud.',
          'Enforce agreements.',
        ],
      },
      'When information is no longer reasonably required, we may delete, anonymise or securely dispose of it.',
    ],
  },
  {
    heading: 'Cookies',
    blocks: [
      {
        subheading: 'We may use cookies and similar technologies to',
        list: [
          'Keep you logged in.',
          'Remember preferences.',
          'Understand how the website is used.',
          'Improve performance and maintain security.',
        ],
      },
      'Where required, we will provide appropriate cookie choices and notices.',
    ],
  },
  {
    heading: 'Your privacy rights',
    blocks: [
      {
        subheading: 'Subject to applicable law, you may have the right to',
        list: [
          'Be informed about processing.',
          'Access your personal data.',
          'Correct inaccurate information.',
          'Object to certain processing.',
          'Restrict processing in applicable circumstances.',
          'Request deletion.',
          'Data portability.',
          'Withdraw consent where processing relies on consent.',
          'Lodge a complaint with the relevant supervisory authority.',
        ],
      },
      'The NDPC identifies these types of data-subject rights under the NDPA framework.',
    ],
  },
  {
    heading: 'How to exercise your rights',
    blocks: [
      `To make a privacy request, contact ${SITE.privacyEmail}.`,
      'Please provide enough information for us to understand and respond to your request. We may need to verify your identity before processing certain requests.',
    ],
  },
  {
    heading: "Children's privacy",
    blocks: [
      'The Service is not intended for children below the applicable legal age for independent consent to data processing.',
      'We do not knowingly collect personal information from children for purposes unrelated to providing a service requested by an appropriate parent, guardian or authorised person.',
    ],
  },
  {
    heading: 'Third-party links',
    blocks: [
      'The Service may contain links to third-party websites. We are not responsible for the privacy practices of those websites, and we recommend reviewing their privacy policies before providing personal information.',
    ],
  },
  {
    heading: 'Changes to this privacy policy',
    blocks: [
      'We may update this Privacy Policy as the Service develops or as legal requirements change. When material changes are made, we will take reasonable steps to notify users, and the updated version will be published on this page with a new "Last updated" date.',
    ],
  },
  {
    heading: 'Contact us',
    blocks: [
      `${SITE.companyName} — privacy: ${SITE.privacyEmail}, support: ${SITE.supportEmail}, website: ${SITE.websiteUrl}.`,
      'You may also have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) where applicable.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy policy"
      intro={[
        `At ${SITE.companyName}, we take your privacy seriously.`,
        `This Privacy Policy explains how we collect, use, store, disclose and protect personal information when you use ${SITE.productName}.`,
        'It applies to our website, application, galleries, account services, payment-related features, and other services that link to this Privacy Policy.',
      ]}
      sections={sections}
    />
  );
}
