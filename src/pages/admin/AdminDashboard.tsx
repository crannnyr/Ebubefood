import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Clock, Megaphone } from 'lucide-react';
import { useStore } from '@/store/useStore';
import AdminLayout from './AdminLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const { orders, ads } = useStore();
  const todayOrders = orders.filter(o => o.createdAt.startsWith(new Date().toISOString().slice(0, 10)));
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;

  const stats = [
    { label: "Today's Orders", value: todayOrders.length.toString(), change: '+12%', up: true, icon: ShoppingBag, color: '#FF6B35' },
    { label: "Revenue", value: `N${todayRevenue.toLocaleString()}`, change: '+8%', up: true, icon: DollarSign, color: '#00D26A' },
    { label: "Pending Orders", value: pendingCount.toString(), change: '-3', up: false, icon: Clock, color: '#FFA502' },
    { label: "Active Ads", value: ads.filter(a => a.status === 'active').length.toString(), change: '0', up: true, icon: Megaphone, color: '#3B82F6' },
  ];

  const salesData = [
    { day: 'Mon', sales: 45000 }, { day: 'Tue', sales: 52000 }, { day: 'Wed', sales: 38000 },
    { day: 'Thu', sales: 61000 }, { day: 'Fri', sales: 75000 }, { day: 'Sat', sales: 82000 }, { day: 'Sun', sales: 58000 },
  ];

  const ownerData = [
    { name: 'Ebube', value: 35, color: '#FF6B35' },
    { name: 'Bundu', value: 30, color: '#8B5CF6' },
    { name: 'Joint', value: 35, color: '#FFD700' },
  ];

  const topItems = [
    { name: 'Jollof Rice', orders: 45 }, { name: 'Egusi Soup', orders: 38 },
    { name: 'Suya Platter', orders: 32 }, { name: 'Fried Rice', orders: 28 },
    { name: 'Pepper Soup', orders: 22 },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{s.change}
              </span>
            </div>
            <p className="font-mono text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="card p-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Sales (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `N${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="sales" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Owner Split */}
        <div className="card p-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Sales by Owner</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ownerData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {ownerData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Orders</h3>
          <div className="space-y-2">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{o.orderNumber}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.userName} &middot; {o.items.length} items</p>
                </div>
                <span className="font-mono text-sm" style={{ color: 'var(--primary)' }}>N{o.total.toLocaleString()}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${o.status === 'delivered' ? 'status-delivered' : 'status-preparing'}`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div className="card p-4">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top Selling Items</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={80} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#FF6B35" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
