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
    return <p className="label">Loading</p>;
  }

  return (
    <div>
      <p className="label">Studio</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-6">Orders</h1>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-y-12 gap-x-8 border-t border-line pt-12">
        {[
          { label: 'Collected', value: `₦${totalRevenue.toLocaleString()}` },
          { label: 'Paid orders', value: completedOrders.length },
          { label: 'Average order', value: `₦${avgOrderValue.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="label">{stat.label}</p>
            <p className="font-display text-4xl mt-4">{stat.value}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-24 border-t border-line pt-24 text-[15px] text-muted max-w-md leading-relaxed">
          No payments yet. When a client pays on one of your gallery links, the order shows up here
          with its transaction reference.
        </p>
      ) : (
        <div className="mt-24 border-t border-line">
          {orders.map((o) => (
            <div
              key={o.id}
              className="border-b border-line py-8 flex flex-col sm:flex-row sm:items-center gap-6"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[15px]">{o.client_name || 'Client'}</p>
                <p className="text-[13px] text-muted mt-1 truncate">{o.client_email}</p>
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/dashboard/projects/${o.project_id}`}
                  className="text-[15px] link-underline"
                >
                  {o.project_title || 'Gallery'}
                </Link>
                <p className="text-[13px] text-muted mt-1 truncate">{o.paystack_reference}</p>
              </div>

              <div className="sm:text-right shrink-0">
                <p className="font-display text-2xl">₦{o.amount_ngn.toLocaleString()}</p>
                <p className="label mt-1">
                  {o.status === 'success' ? 'Unlocked' : o.status} ·{' '}
                  {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
