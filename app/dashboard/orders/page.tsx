'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch((err) => console.error('Failed to load orders:', err))
      .finally(() => setLoading(false));
  }, []);

  const completedOrders = orders.filter((o) => o.status === 'success');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.amount_ngn || 0), 0);
  const avgOrderValue =
    completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

  if (loading) {
    return <p className="label-caps text-ink-soft">Loading</p>;
  }

  return (
    <div>
      <p className="label-caps text-ink-soft">Accounts</p>
      <h1 className="headline-lg mt-2">Ledger</h1>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 border border-ink">
        {[
          { label: 'Collected', value: `₦${totalRevenue.toLocaleString()}` },
          { label: 'Cleared orders', value: completedOrders.length },
          { label: 'Average order', value: `₦${avgOrderValue.toLocaleString()}` },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`p-5 ${i > 0 ? 'border-t sm:border-t-0 sm:border-l border-rule' : ''}`}
          >
            <p className="label-caps text-ink-soft">{stat.label}</p>
            <p className="ledger-lg mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 border border-ink p-10 md:p-16">
          <p className="body-md text-ink-soft max-w-md">
            No entries yet. When a client settles a gallery, the transaction is recorded here with
            its reference and the moment the files were released.
          </p>
        </div>
      ) : (
        <div className="mt-10 border border-ink">
          <div className="band px-5 py-3 hidden md:grid grid-cols-12 gap-4">
            <span className="label-caps text-ink-soft col-span-3">Client</span>
            <span className="label-caps text-ink-soft col-span-3">Gallery</span>
            <span className="label-caps text-ink-soft col-span-3">Reference</span>
            <span className="label-caps text-ink-soft col-span-1">Status</span>
            <span className="label-caps text-ink-soft col-span-2 text-right">Amount</span>
          </div>

          {orders.map((o) => (
            <div
              key={o.id}
              className="px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 md:items-center border-t border-rule"
            >
              <div className="md:col-span-3 min-w-0">
                <p className="body-md truncate">{o.client_name || 'Client'}</p>
                <p className="body-sm text-ink-soft truncate">{o.client_email}</p>
              </div>

              <div className="md:col-span-3 min-w-0">
                <Link
                  href={`/dashboard/projects/${o.project_id}`}
                  className="body-md rule-link truncate inline-block max-w-full"
                >
                  {o.project_title || 'Gallery'}
                </Link>
                <p className="body-sm text-ink-soft">
                  {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>

              <p className="md:col-span-3 body-sm text-ink-soft truncate">{o.paystack_reference}</p>

              <div className="md:col-span-1">
                <span
                  className={`status label-caps ${
                    o.status === 'success' ? 'status-paid' : 'status-processing'
                  }`}
                >
                  {o.status === 'success' ? 'Paid' : 'Processing'}
                </span>
              </div>

              <p className="md:col-span-2 ledger-md md:text-right">
                ₦{o.amount_ngn.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
