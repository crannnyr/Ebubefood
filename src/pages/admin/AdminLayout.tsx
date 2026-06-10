import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, Grid3X3, Image, Megaphone,
  ClipboardList, CalendarCheck, BarChart3, Settings, Menu, X, Bell
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: UtensilsCrossed, label: 'Items', path: '/admin/items' },
  { icon: Grid3X3, label: 'Categories', path: '/admin/categories' },
  { icon: Image, label: 'Banners', path: '/admin/banners' },
  { icon: Megaphone, label: 'Ad Review', path: '/admin/ads' },
  { icon: CalendarCheck, label: 'End of Day', path: '/admin/eod' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: ClipboardList, label: 'Orders', path: '/admin/orders' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useStore();

  return (
    <div className="flex min-h-[100dvh] pt-0">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-[260px] fixed left-0 top-0 bottom-0 z-30"
        style={{ background: 'var(--surface-elevated)' }}>
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <img src="/images/logo.png" alt="CBK" className="w-9 h-9" />
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>CBK Admin</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{user?.fullName || 'Admin'}</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                }}>
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          CBK Foods Admin v1.0
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-[260px]" style={{ background: 'var(--surface-elevated)' }}
            onClick={e => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <img src="/images/logo.png" alt="CBK" className="w-9 h-9" />
                <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>CBK Admin</p>
              </div>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
                    style={{ background: isActive ? 'var(--primary-light)' : 'transparent', color: isActive ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    <item.icon size={18} />{item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-20 glass border-b px-4 py-3 flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/5">
              <Menu size={20} />
            </button>
            <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {user?.fullName?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
