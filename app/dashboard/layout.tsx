'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { formatBytes } from '@/lib/format';
import { TIERS } from '@/lib/types';

const navItems = [
  { name: 'Galleries', href: '/dashboard' },
  { name: 'Ledger', href: '/dashboard/orders' },
  { name: 'Capacity', href: '/dashboard/billing' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (active) setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="label-caps text-ink-soft">Loading</p>
      </div>
    );
  }

  const tierConfig = user ? TIERS[user.tier as keyof typeof TIERS] || TIERS.free : TIERS.free;
  const storageUsed = user?.storage_used || 0;
  const storagePercent = Math.min(100, (storageUsed / tierConfig.storageBytes) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-6">
          <Link href="/dashboard" className="headline-sm shrink-0">
            PayGallery
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`label-ui ${
                  pathname === item.href ? 'rule-link !border-ink' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6 shrink-0">
            <span className="hidden md:block label-ui text-ink-soft truncate max-w-[180px]">
              {user?.business_name || user?.name}
            </span>
            <button onClick={handleLogout} className="label-ui text-ink-soft hover:text-ink">
              Sign out
            </button>
          </div>
        </div>

        <nav className="sm:hidden flex items-center gap-6 px-4 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`label-ui ${
                pathname === item.href ? 'rule-link !border-ink' : 'text-ink-soft'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </header>

      {/* Statement band: capacity ledger, always in view */}
      <div className="band">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-7 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="label-caps text-ink-soft">Archival capacity</p>
            <p className="ledger-lg mt-2">
              {formatBytes(storageUsed)}
              <span className="body-lg text-ink-soft"> of {tierConfig.storageLabel}</span>
            </p>
          </div>

          <div className="w-full sm:w-72">
            <div className="meter">
              <span style={{ width: `${Math.max(1, storagePercent)}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="label-ui text-ink-soft">{tierConfig.name}</span>
              <Link href="/dashboard/billing" className="label-ui rule-link">
                Adjust plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-12">
        {children}
      </main>
    </div>
  );
}
