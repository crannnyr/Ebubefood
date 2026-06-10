import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import * as api from '@/services/api';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_CLASSES: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed', preparing: 'status-preparing',
  ready: 'status-ready', out_for_delivery: 'status-out-for-delivery',
  delivered: 'status-delivered', cancelled: 'status-cancelled',
};

export default function AdminOrders() {
  const { addToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await api.fetchAllOrders();
      setOrders(data);
    } catch {
      addToast('error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      addToast('success', `Order updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch {
      addToast('error', 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase()) ||
      o.userPhone.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search order # or customer..."
            value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="input-field py-2.5 text-sm" style={{ background: 'var(--surface)' }}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
        </select>
        <button onClick={loadOrders} className="btn-secondary p-2.5 rounded-lg">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--surface-elevated)' }}>
                  {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No orders found</td></tr>
                ) : filtered.map(order => (
                  <>
                    <tr key={order.id}
                      className="border-t cursor-pointer hover:bg-white/[0.02] transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                      <td className="p-3 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{order.orderNumber}</td>
                      <td className="p-3">
                        <p style={{ color: 'var(--text-primary)' }}>{order.userName || '—'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.userPhone}</p>
                      </td>
                      <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{order.items.length} items</td>
                      <td className="p-3 font-mono" style={{ color: 'var(--primary)' }}>₦{order.total.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CLASSES[order.status] || ''}`}>
                          {order.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-NG')}
                      </td>
                    </tr>

                    {expandedId === order.id && (
                      <tr key={`${order.id}-expanded`}>
                        <td colSpan={6} className="p-4" style={{ background: 'var(--surface)' }}>
                          <div className="space-y-4">
                            {/* Status updater */}
                            <div>
                              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>UPDATE STATUS</p>
                              <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map(s => (
                                  <button key={s} onClick={() => handleStatusChange(order.id, s)}
                                    disabled={updatingId === order.id}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                                    style={{
                                      background: order.status === s ? 'var(--primary)' : 'var(--surface-elevated)',
                                      color: order.status === s ? '#fff' : 'var(--text-secondary)',
                                      opacity: updatingId === order.id ? 0.6 : 1,
                                    }}>
                                    {s.replace(/_/g, ' ')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Items */}
                            <div>
                              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>ORDER ITEMS</p>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {order.items.map((item, i) => (
                                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
                                    <img src={item.image} alt="" className="w-8 h-8 rounded object-cover"
                                      onError={e => { (e.target as HTMLImageElement).src = '/images/placeholder-food.jpg'; }} />
                                    <span className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>{item.name} ×{item.quantity}</span>
                                    <span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>₦{(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery info */}
                            <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                              <p><span className="font-medium">Address:</span> {order.userAddress}</p>
                              <p><span className="font-medium">Phone:</span> {order.userPhone}</p>
                              {order.deliveryNotes && <p><span className="font-medium">Notes:</span> {order.deliveryNotes}</p>}
                              <p><span className="font-medium">Payment:</span> {order.paymentStatus}</p>
                              <p><span className="font-medium">Total:</span> ₦{order.total.toLocaleString()}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}