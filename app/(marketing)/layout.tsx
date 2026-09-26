import Link from 'next/link';
import { SITE, MARKETING_NAV, FOOTER_LEGAL } from '@/lib/site';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="headline-sm shrink-0">
            {SITE.productName}
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {MARKETING_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="label-ui text-ink-soft hover:text-ink">
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5 shrink-0">
            <Link href="/login" className="label-ui rule-link">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get started
            </Link>
          </div>
        </div>

        <nav className="lg:hidden flex items-center gap-5 overflow-x-auto px-4 pb-4">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label-ui text-ink-soft whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="band border-t border-ink border-b-0">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <p className="headline-sm">{SITE.productName}</p>
              <p className="body-sm text-ink-soft mt-3 max-w-xs">
                Upload. Share. Get paid. Deliver.
              </p>
            </div>

            <div>
              <p className="label-caps text-ink-soft">Product</p>
              <ul className="mt-4 space-y-2">
                {MARKETING_NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="body-md text-ink-soft hover:text-ink">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label-caps text-ink-soft">Legal</p>
              <ul className="mt-4 space-y-2">
                {FOOTER_LEGAL.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="body-md text-ink-soft hover:text-ink">
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${SITE.supportEmail}`}
                    className="body-md text-ink-soft hover:text-ink"
                  >
                    {SITE.supportEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <p className="body-sm text-ink-soft mt-12 pt-6 border-t border-rule">
            © {new Date().getFullYear()} {SITE.companyName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
