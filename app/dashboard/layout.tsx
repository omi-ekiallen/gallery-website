'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { formatBytes } from '@/lib/format';
import { TIERS } from '@/lib/types';

const navItems = [
  { name: 'Galleries', href: '/dashboard' },
  { name: 'Orders', href: '/dashboard/orders' },
  { name: 'Plan', href: '/dashboard/billing' },
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
        <p className="label">Loading</p>
      </div>
    );
  }

  const tierConfig = user ? TIERS[user.tier as keyof typeof TIERS] || TIERS.free : TIERS.free;
  const storageUsed = user?.storage_used || 0;
  const storagePercent = Math.min(100, (storageUsed / tierConfig.storageBytes) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between gap-8">
          <Link href="/dashboard" className="font-display text-2xl shrink-0">
            PayGallery
          </Link>

          <nav className="hidden sm:flex items-center gap-10 text-[13px]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? 'link-underline !border-ink' : 'text-muted hover:text-ink transition'}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-8 shrink-0">
            <Link href="/dashboard/billing" className="hidden md:block text-right group">
              <span className="label block">
                {formatBytes(storageUsed)} of {tierConfig.storageLabel}
              </span>
              <span className="block w-32 h-px bg-line mt-2 relative">
                <span
                  className="absolute left-0 top-0 h-px bg-ink"
                  style={{ width: `${Math.max(2, storagePercent)}%` }}
                />
              </span>
            </Link>

            <button onClick={handleLogout} className="text-[13px] text-muted hover:text-ink transition">
              Sign out
            </button>
          </div>
        </div>

        <nav className="sm:hidden flex items-center gap-8 px-6 pb-5 text-[13px]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'link-underline !border-ink' : 'text-muted'}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-16 sm:py-24">{children}</main>
    </div>
  );
}
