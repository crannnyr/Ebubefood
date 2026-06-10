import { useState } from 'react';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Calendar } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useStore } from '@/store/useStore';

export default function AdminEOD() {
  const { addToast, orders, dayClosings } = useStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [closed, setClosed] = useState(false);
  const todayOrders = orders.filter(o => o.createdAt.startsWith(new Date().toISOString().slice(0, 10)));
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);

  const ebubeOrders = todayOrders.filter(o => o.items.some(i => i.owner === 'ebube'));
  const bunduOrders = todayOrders.filter(o => o.items.some(i => i.owner === 'bundu'));
  const jointOrders = todayOrders.filter(o => o.items.some(i => i.owner === 'joint'));

  const handleClose = () => {
    setShowConfirm(false);
    setClosed(true);
    addToast('success', 'Day closed successfully!');
  };

  if (closed) {
    return (
      <AdminLayout title="End of Day">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--success-light)' }}>
            <CheckCircle size={32} style={{ color: 'var(--success)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Day Closed!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Today's sales have been recorded successfully.</p>
        </div>

        {/* Past Closings */}
        <div className="mt-8">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Past Closings</h3>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr style={{ background: 'var(--surface-elevated)' }}>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Date</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Orders</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Revenue</th>
                <th className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Profit</th>
              </tr></thead>
              <tbody>
                {dayClosings.map(dc => (
                  <tr key={dc.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-3">{dc.date}</td>
                    <td className="p-3">{dc.totalOrders}</td>
                    <td className="p-3 font-mono" style={{ color: 'var(--primary)' }}>N{dc.totalRevenue.toLocaleString()}</td>
                    <td className="p-3 font-mono" style={{ color: 'var(--success)' }}>N{(dc.ebubeProfit + dc.bunduProfit + dc.jointProfit).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="End of Day">
      {/* Warning */}
      <div className="card p-4 mb-6 flex items-center gap-3" style={{ background: 'var(--warning-light)', borderColor: 'var(--warning)' }}>
        <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>Close today's sales? This action cannot be undone.</p>
      </div>

      {/* Preview */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Calendar size={18} style={{ color: 'var(--primary)' }} /> Today's Summary
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ background: 'var(--surface-elevated)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Orders</p>
            <p className="font-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{todayOrders.length}</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--surface-elevated)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Revenue</p>
            <p className="font-mono text-xl font-bold" style={{ color: 'var(--primary)' }}>N{todayRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Owner Split */}
        <h4 className="font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Owner Breakdown</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Ebube', orders: ebubeOrders.length, revenue: ebubeOrders.reduce((s, o) => s + o.total, 0), color: 'var(--primary)' },
            { label: 'Bundu', orders: bunduOrders.length, revenue: bunduOrders.reduce((s, o) => s + o.total, 0), color: 'var(--owner-bundu)' },
            { label: 'Joint', orders: jointOrders.length, revenue: jointOrders.reduce((s, o) => s + o.total, 0), color: 'var(--accent)' },
          ].map(o => (
            <div key={o.label} className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: o.color }}>{o.label}</p>
              <p className="font-mono text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{o.orders} orders</p>
              <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>N{o.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setShowConfirm(true)} className="btn-primary w-full md:w-auto py-4 px-8">
        Close Day
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-md w-full p-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--warning-light)' }}>
              <AlertTriangle size={28} style={{ color: 'var(--warning)' }} />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Are you sure?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>This will close today's sales and create a permanent record. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 py-3">Cancel</button>
              <button onClick={handleClose} className="btn-primary flex-1 py-3">Confirm Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
