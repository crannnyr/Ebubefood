import { useState, useEffect } from 'react';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Calendar } from 'lucide-react';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useStore } from '@/store/useStore';
import * as api from '@/services/api';
import type { DayClosing } from '@/types';

export default function AdminEOD() {
  const { addToast, user } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [dayClosings, setDayClosings] = useState<DayClosing[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [todayClosed, setTodayClosed] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [allOrders, closings] = await Promise.all([
        api.fetchAllOrders(),
        api.fetchDayClosings(),
      ]);
      setOrders(allOrders);
      setDayClosings(closings);
      setTodayClosed(closings.some(c => c.date === today));
    } catch {
      addToast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const todayOrders = orders.filter(o =>
    o.createdAt.startsWith(today) &&
    ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].includes(o.status)
  );
  const todayRevenue = todayOrders.reduce((s: number, o: any) => s + o.total, 0);

  const ebubeRevenue = todayOrders.reduce((s: number, o: any) =>
    s + o.items.filter((i: any) => i.owner === 'ebube').reduce((ss: number, i: any) => ss + i.price * i.quantity, 0), 0);
  const bunduRevenue = todayOrders.reduce((s: number, o: any) =>
    s + o.items.filter((i: any) => i.owner === 'bundu').reduce((ss: number, i: any) => ss + i.price * i.quantity, 0), 0);
  const jointRevenue = todayOrders.reduce((s: number, o: any) =>
    s + o.items.filter((i: any) => i.owner === 'joint').reduce((ss: number, i: any) => ss + i.price * i.quantity, 0), 0);

  const ebubeOrders = todayOrders.filter((o: any) => o.items.some((i: any) => i.owner === 'ebube')).length;
  const bunduOrders = todayOrders.filter((o: any) => o.items.some((i: any) => i.owner === 'bundu')).length;
  const jointOrders = todayOrders.filter((o: any) => o.items.some((i: any) => i.owner === 'joint')).length;

  async function handleClose() {
    setShowConfirm(false);
    setClosing(true);
    try {
      await api.closeDay(today, user!.userId);
      await loadData();
      addToast('success', 'Day closed successfully!');
    } catch {
      addToast('error', 'Failed to close day');
    } finally {
      setClosing(false);
    }
  }

  if (loading) {
    return <AdminLayout title="End of Day"><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></AdminLayout>;
  }

  return (
    <AdminLayout title="End of Day">
      {todayClosed ? (
        <div className="text-center py-12 mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--success-light)' }}>
            <CheckCircle size={32} style={{ color: 'var(--success)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Today Already Closed</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Today's sales have been recorded.</p>
        </div>
      ) : (
        <>
          <div className="card p-4 mb-6 flex items-center gap-3 border"
            style={{ background: 'var(--warning-light)', borderColor: 'var(--warning)' }}>
            <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
              Close today's sales? This action cannot be undone.
            </p>
          </div>

          <div className="card p-6 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} /> Today's Summary — {today}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl" style={{ background: 'var(--surface-elevated)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Orders</p>
                <p className="font-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{todayOrders.length}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--surface-elevated)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Revenue</p>
                <p className="font-mono text-xl font-bold" style={{ color: 'var(--primary)' }}>₦{todayRevenue.toLocaleString()}</p>
              </div>
            </div>

            <h4 className="font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Owner Breakdown</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Ebube', orders: ebubeOrders, revenue: ebubeRevenue, color: 'var(--primary)' },
                { label: 'Bundu', orders: bunduOrders, revenue: bunduRevenue, color: '#8B5CF6' },
                { label: 'Joint', orders: jointOrders, revenue: jointRevenue, color: 'var(--accent)' },
              ].map(o => (
                <div key={o.label} className="p-4 rounded-xl border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: o.color }}>{o.label}</p>
                  <p className="font-mono text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{o.orders} orders</p>
                  <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>₦{o.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setShowConfirm(true)} disabled={closing}
            className="btn-primary w-full md:w-auto py-4 px-8 flex items-center justify-center gap-2">
            {closing ? <><LoadingSpinner size="sm" /> Closing...</> : 'Close Day'}
          </button>
        </>
      )}

      {/* Past Closings */}
      {dayClosings.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Past Closings</h3>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--surface-elevated)' }}>
                    {['Date', 'Orders', 'Revenue', 'Ebube', 'Bundu', 'Joint'].map(h => (
                      <th key={h} className="text-left p-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayClosings.map(dc => (
                    <tr key={dc.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3" style={{ color: 'var(--text-primary)' }}>{dc.date}</td>
                      <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{dc.totalOrders}</td>
                      <td className="p-3 font-mono" style={{ color: 'var(--primary)' }}>₦{dc.totalRevenue.toLocaleString()}</td>
                      <td className="p-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>₦{dc.ebubeRevenue.toLocaleString()}</td>
                      <td className="p-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>₦{dc.bunduRevenue.toLocaleString()}</td>
                      <td className="p-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>₦{dc.jointRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-md w-full p-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--warning-light)' }}>
              <AlertTriangle size={28} style={{ color: 'var(--warning)' }} />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Are you sure?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              This will close today's sales and create a permanent record. Cannot be undone.
            </p>
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