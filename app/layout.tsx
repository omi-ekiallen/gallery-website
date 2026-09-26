import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';

const display = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
});

const body = Jost({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PayGallery — Client photo delivery, paid before download',
  description:
    'Deliver client galleries with a private link, a passcode, and a paywall. Clients preview, pay, and download their full-resolution files.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full bg-white text-ink">{children}</body>
    </html>
  );
}
