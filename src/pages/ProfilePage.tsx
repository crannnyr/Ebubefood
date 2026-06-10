import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Lock, LogOut, ClipboardList, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, addToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    addToast('success', 'Profile updated successfully');
  };

  const handleLogout = () => {
    logout();
    addToast('success', 'Signed out successfully');
    navigate('/');
  };

  if (!user) return null;

  const isAdmin = user.role?.startsWith('admin');

  return (
    <div className="pt-20 pb-8 px-4">
      <div className="max-w-[600px] mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {user.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.fullName}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: isAdmin ? 'var(--info-light)' : 'var(--primary-light)', color: isAdmin ? 'var(--info)' : 'var(--primary)' }}>
            {isAdmin ? 'Administrator' : 'Customer'}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 mb-6">
          <Link to="/orders" className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
              <ClipboardList size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>My Orders</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>View order history</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </Link>
          {isAdmin && (
            <Link to="/admin" className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--info-light)' }}>
                <User size={18} style={{ color: 'var(--info)' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Manage store</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          )}
        </div>

        {/* Profile Form */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-field pl-10" placeholder="08012345678" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3" size={16} style={{ color: 'var(--text-muted)' }} />
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  className="input-field pl-10 min-h-[80px] resize-none" placeholder="Delivery address" />
              </div>
            </div>
            <button onClick={handleSave} disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Security</h3>
          <button onClick={() => addToast('info', 'Password change coming soon')}
            className="w-full card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform mb-3" style={{ background: 'var(--surface)' }}>
            <Lock size={18} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Change Password</span>
          </button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors hover:opacity-80"
          style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
