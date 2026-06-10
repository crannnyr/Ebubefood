import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import AdminLayout from './AdminLayout';
import { useStore } from '@/store/useStore';

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
const statusClasses: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed', preparing: 'status-preparing',
  ready: 'status-ready', 'out_for_delivery': 'status-out-for-delivery',
  delivered: 'status-delivered', cancelled: 'status-cancelled',
};

export default function AdminOrders() {
  const { addToast, orders } = useStore();
  const [ordersList, setOrdersList] = useState<Order[]>(orders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ordersList.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.userName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrdersList(os => os.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    addToast('success', `Order status updated to ${newStatus}`);
  };

  return (
    <AdminLayout title="Orders">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by order # or customer..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input-field py-2.5 text-sm" style={{ background: 'var(--surface)' }}>
          <option value="all">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ').toUpperCase()}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr style={{ background: 'var(--surface-elevated)' }}>
              <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Order #</th>
              <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Customer</th>
              <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Items</th>
              <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Total</th>
              <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Date</th>
            </tr></thead>
            <tbody>
              {filtered.map(order => (
                <>
                  <tr key={order.id} className="border-t cursor-pointer hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--border)' }}
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                    <td className="p-3 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{order.orderNumber}</td>
                    <td className="p-3">
                      <p style={{ color: 'var(--text-primary)' }}>{order.userName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.userPhone}</p>
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{order.items.length} items</td>
                    <td className="p-3 font-mono" style={{ color: 'var(--primary)' }}>N{order.total.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusClasses[order.status]}`}>
                        {order.status.replace(/-/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-NG')}</td>
                  </tr>
                  {expandedId === order.id && (
                    <tr><td colSpan={6} className="p-4" style={{ background: 'var(--surface)' }}>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map(s => (
                            <button key={s} onClick={() => handleStatusChange(order.id, s)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                              style={{ background: order.status === s ? 'var(--primary)' : 'var(--surface-elevated)', color: order.status === s ? '#fff' : 'var(--text-secondary)' }}>
                              {s.replace(/-/g, ' ')}
                            </button>
                          ))}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
                              <img src={item.image} alt="" className="w-8 h-8 rounded object-cover" />
                              <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{item.name} x{item.quantity}</span>
                              <span className="text-xs font-mono ml-auto" style={{ color: 'var(--primary)' }}>N{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          <p>Address: {order.userAddress}</p>
                          {order.deliveryNotes && <p>Notes: {order.deliveryNotes}</p>}
                        </div>
                      </div>
                    </td></tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No orders found</p>}
      </div>
    </AdminLayout>
  );
}
