import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { fetchOrderAnalytics } from '@/services/api';

const presets = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];

function getDateRange(preset: string): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  switch (preset) {
    case 'Today':
      return { start: `${today}T00:00:00`, end: `${today}T23:59:59` };
    case 'Yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yd = y.toISOString().slice(0, 10);
      return { start: `${yd}T00:00:00`, end: `${yd}T23:59:59` };
    }
    case 'Last 7 Days': {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { start: `${d.toISOString().slice(0, 10)}T00:00:00`, end: `${today}T23:59:59` };
    }
    case 'Last 30 Days': {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { start: `${d.toISOString().slice(0, 10)}T00:00:00`, end: `${today}T23:59:59` };
    }
    default:
      return { start: `${today}T00:00:00`, end: `${today}T23:59:59` };
  }
}

const OWNER_COLORS: Record<string, string> = {
  ebube: '#FF6B35',
  bundu: '#8B5CF6',
  joint: '#FFD700',
};

export default function AdminAnalytics() {
  const [preset, setPreset] = useState('Last 7 Days');
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<{ date: string; revenue: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; orders: number }[]>([]);
  const [ownerData, setOwnerData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; orders: number }[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; orders: number }[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, orders: 0 });

  useEffect(() => {
    loadData();
  }, [preset]);

  async function loadData() {
    setLoading(true);
    try {
      const { start, end } = getDateRange(preset);
      const raw = await fetchOrderAnalytics(start, end);

      // Revenue over time
      const revenueMap: Record<string, number> = {};
      const categoryMap: Record<string, number> = {};
      const ownerMap: Record<string, number> = { ebube: 0, bundu: 0, joint: 0 };
      const itemMap: Record<string, number> = {};
      const hourMap: Record<number, number> = {};
      let totalRevenue = 0;

      for (const order of raw) {
        const date = order.created_at.slice(0, 10);
        revenueMap[date] = (revenueMap[date] || 0) + Number(order.total_amount);
        totalRevenue += Number(order.total_amount);

        const hour = new Date(order.created_at).getHours();
        hourMap[hour] = (hourMap[hour] || 0) + 1;

        for (const oi of order.order_items || []) {
          // Owner
          ownerMap[oi.owner] = (ownerMap[oi.owner] || 0) + oi.quantity;

          // Items
          itemMap[oi.item_name] = (itemMap[oi.item_name] || 0) + oi.quantity;

          // Category
          const catName = (oi.items as any)?.categories?.name || 'Other';
          categoryMap[catName] = (categoryMap[catName] || 0) + oi.quantity;
        }
      }

      // Build sales chart — fill missing dates
      const { start: startStr } = getDateRange(preset);
      const startDate = new Date(startStr);
      const endDate = new Date();
      const sales: { date: string; revenue: number }[] = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        sales.push({ date: key.slice(5), revenue: revenueMap[key] || 0 });
      }

      setSalesData(sales);
      setCategoryData(Object.entries(categoryMap).map(([name, orders]) => ({ name, orders })).sort((a, b) => b.orders - a.orders));
      setOwnerData(Object.entries(ownerMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: OWNER_COLORS[name] })));
      setTopItems(Object.entries(itemMap).map(([name, orders]) => ({ name, orders })).sort((a, b) => b.orders - a.orders).slice(0, 6));
      setHourlyData(Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, orders: hourMap[i] || 0 })));
      setTotals({ revenue: totalRevenue, orders: raw.length });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const rows = [['Date', 'Revenue'], ...salesData.map(d => [d.date, d.revenue.toString()])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbk-analytics-${preset.replace(/ /g, '-')}.csv`;
    a.click();
  }

  return (
    <AdminLayout title="Analytics">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {presets.map(p => (
          <button key={p} onClick={() => setPreset(p)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: preset === p ? 'var(--primary)' : 'var(--surface)', color: preset === p ? '#fff' : 'var(--text-secondary)' }}>
            {p}
          </button>
        ))}
        <button onClick={exportCSV} className="ml-auto btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Revenue</p>
          <p className="font-mono text-xl font-bold" style={{ color: 'var(--primary)' }}>₦{totals.revenue.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Orders</p>
          <p className="font-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{totals.orders}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue */}
          <div className="card p-4">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Category */}
          <div className="card p-4">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Orders by Category</h3>
            {categoryData.length === 0 ? (
              <p className="text-sm text-center py-16" style={{ color: 'var(--text-muted)' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="orders" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Owner Split */}
          <div className="card p-4">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Sales by Owner</h3>
            {ownerData.every(o => o.value === 0) ? (
              <p className="text-sm text-center py-16" style={{ color: 'var(--text-muted)' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={ownerData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {ownerData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Items */}
          <div className="card p-4">
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top Selling Items</h3>
            {topItems.length === 0 ? (
              <p className="text-sm text-center py-16" style={{ color: 'var(--text-muted)' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="orders" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Hourly Heatmap */}
      {!loading && (
        <div className="card p-4 mt-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Hourly Orders</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
            {hourlyData.map(h => {
              const max = Math.max(...hourlyData.map(x => x.orders), 1);
              const intensity = h.orders / max;
              return (
                <div key={h.hour} className="text-center p-2 rounded-lg"
                  style={{ background: `rgba(255,107,53,${Math.max(0.08, intensity)})` }}>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{h.hour}</p>
                  <p className="text-xs font-bold" style={{ color: intensity > 0.5 ? '#fff' : 'var(--text-secondary)' }}>{h.orders}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}