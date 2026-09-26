import type { Metadata } from 'next';
import { Newsreader, Manrope } from 'next/font/google';
import './globals.css';
import MediaGuard from './media-guard';

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PayGallery — Client photo delivery, paid before download',
  description:
    'Deliver client galleries with a private link, a passcode, and a paywall. Clients preview, pay, and download their full-resolution files.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full bg-paper text-ink">
        <MediaGuard />
        {children}
      </body>
    </html>
  );
}
