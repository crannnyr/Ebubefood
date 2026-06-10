import { useState } from 'react';
import { Download } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const presets = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom'];

const salesData = [
  { date: 'Jun 1', revenue: 45000 }, { date: 'Jun 2', revenue: 52000 },
  { date: 'Jun 3', revenue: 38000 }, { date: 'Jun 4', revenue: 61000 },
  { date: 'Jun 5', revenue: 75000 }, { date: 'Jun 6', revenue: 82000 },
  { date: 'Jun 7', revenue: 58000 }, { date: 'Jun 8', revenue: 67000 },
];

const categoryData = [
  { name: 'Rice', orders: 85 }, { name: 'Soups', orders: 62 },
  { name: 'Grilled', orders: 48 }, { name: 'Swallows', orders: 35 },
  { name: 'Snacks', orders: 72 }, { name: 'Drinks', orders: 40 },
];

const ownerData = [
  { name: 'Ebube', value: 35, color: '#FF6B35' },
  { name: 'Bundu', value: 30, color: '#8B5CF6' },
  { name: 'Joint', value: 35, color: '#FFD700' },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  orders: [5, 3, 2, 1, 1, 3, 8, 12, 10, 8, 15, 22, 28, 20, 15, 12, 10, 18, 25, 20, 15, 10, 8, 6][i] || 0,
}));

const topItems = [
  { name: 'Jollof Rice', orders: 45 }, { name: 'Egusi Soup', orders: 38 },
  { name: 'Suya Platter', orders: 32 }, { name: 'Fried Rice', orders: 28 },
  { name: 'Pepper Soup', orders: 22 }, { name: 'Ofada Rice', orders: 20 },
];

export default function AdminAnalytics() {
  const [preset, setPreset] = useState('Last 7 Days');

  return (
    <AdminLayout title="Analytics">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {presets.map(p => (
          <button key={p} onClick={() => setPreset(p)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: preset === p ? 'var(--primary)' : 'var(--surface)', color: preset === p ? '#fff' : 'var(--text-secondary)' }}>
            {p}
          </button>
        ))}
        <button className="ml-auto btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="card p-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `N${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Category */}
        <div className="card p-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Orders by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Owner Split */}
        <div className="card p-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Sales by Owner</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ownerData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {ownerData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Items */}
        <div className="card p-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top Selling Items</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} width={80} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Heatmap */}
      <div className="card p-4 mt-6">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Hourly Sales Heatmap</h3>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
          {hourlyData.map(h => {
            const intensity = h.orders / 30;
            return (
              <div key={h.hour} className="text-center p-2 rounded-lg" style={{ background: `rgba(255,107,53,${Math.max(0.1, intensity)})` }}>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{h.hour}</p>
                <p className="text-xs font-bold" style={{ color: intensity > 0.5 ? '#fff' : 'var(--text-secondary)' }}>{h.orders}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
