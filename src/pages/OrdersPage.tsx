import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

type Tab = 'active' | 'completed' | 'cancelled';

const statusIcons: Record<string, any> = {
  pending: Clock, confirmed: Clock, preparing: Package, ready: Package,
  'out_for_delivery': Package, delivered: CheckCircle, cancelled: XCircle,
};

const statusClasses: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed', preparing: 'status-preparing',
  ready: 'status-ready', 'out_for_delivery': 'status-out-for-delivery',
  delivered: 'status-delivered', cancelled: 'status-cancelled',
};

export default function OrdersPage() {
  const { orders } = useStore();
  const [tab, setTab] = useState<Tab>('active');

  const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];
  const filtered = orders.filter(o => {
    if (tab === 'active') return activeStatuses.includes(o.status);
    if (tab === 'completed') return o.status === 'delivered';
    return o.status === 'cancelled';
  });

  return (
    <div className="pt-20 pb-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>My Orders</h1>

        <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          {(['active', 'completed', 'cancelled'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-3 text-sm font-medium capitalize transition-colors relative"
              style={{ color: tab === t ? 'var(--primary)' : 'var(--text-secondary)' }}>
              {t}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--primary)' }} />}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <img src="/images/empty-orders.jpg" alt="No orders" className="w-32 h-32 rounded-full mx-auto mb-6 opacity-60 object-cover" />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No {tab} orders</h2>
            <Link to="/" className="btn-primary mt-4 inline-block">Start Ordering</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const StatusIcon = statusIcons[order.status] || Package;
              return (
                <Link key={order.id} to={`/order/${order.id}`}
                  className="card p-4 flex gap-4 hover:-translate-y-0.5 transition-transform">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary-light)' }}>
                    <StatusIcon size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusClasses[order.status]}`}>
                        {order.status.replace(/-/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} &middot; {new Date(order.createdAt).toLocaleDateString('en-NG')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {order.items.slice(0, 2).map((item, i) => (
                        <img key={i} src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{order.items.length - 2} more</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold" style={{ color: 'var(--primary)' }}>N{order.total.toLocaleString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
