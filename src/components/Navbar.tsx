import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, X, Menu, User, LayoutDashboard } from 'lucide-react';
import { useStore } from '@/store/useStore';

const LOGO = 'https://dpioixansygkjdbphfdj.supabase.co/storage/v1/object/public/product-images/0.6690683366920113.webp';

// Pages that should NOT show the navbar
const NO_NAVBAR_PATHS = [
  '/profile', '/profile/edit',
  '/wallet', '/wallet/fund', '/wallet/history', '/wallet/methods',
  '/addresses', '/favourites', '/reviews', '/referral',
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, cartCount, toggleCart, logout } = useStore();
  const location = useLocation();
  const count = cartCount();
  const isAdmin = user?.role?.startsWith('admin') ?? false;
  const isAdminPage = location.pathname.startsWith('/admin');

  // Hide navbar on certain pages
  const hideNavbar = NO_NAVBAR_PATHS.some(p =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  );
  if (hideNavbar) return null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Desktop menu links
  const desktopLinks = isAdminPage && isAdmin ? [
    { label: 'Dashboard',  path: '/admin' },
    { label: 'Items',      path: '/admin/items' },
    { label: 'Categories', path: '/admin/categories' },
    { label: 'Orders',     path: '/admin/orders' },
    { label: 'EOD',        path: '/admin/eod' },
    { label: 'Analytics',  path: '/admin/analytics' },
    { label: 'Settings',   path: '/admin/settings' },
  ] : [
    { label: 'Home',   path: '/' },
    { label: 'Menu',   path: '/menu' },
    { label: 'Orders', path: '/orders' },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  // Desktop hamburger / slide menu links (more complete)
  const menuLinks = isAdminPage && isAdmin ? [
    { label: 'Dashboard',  path: '/admin' },
    { label: 'Items',      path: '/admin/items' },
    { label: 'Categories', path: '/admin/categories' },
    { label: 'Banners',    path: '/admin/banners' },
    { label: 'Orders',     path: '/admin/orders' },
    { label: 'Ads Review', path: '/admin/ads' },
    { label: 'EOD',        path: '/admin/eod' },
    { label: 'Analytics',  path: '/admin/analytics' },
    { label: 'Settings',   path: '/admin/settings' },
    { label: '← Back to Site', path: '/' },
  ] : [
    { label: 'Home',       path: '/' },
    { label: 'Menu',       path: '/menu' },
    { label: 'Orders',     path: '/orders' },
    { label: 'Advertise',  path: '/ads' },
    ...(isAdmin ? [{ label: 'Admin Dashboard', path: '/admin' }] : []),
    { label: 'Profile',    path: '/profile' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}
        style={{ height: scrolled ? 56 : 64 }}
      >
        <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={LOGO} alt="CBK" className="w-9 h-9 rounded-full object-cover" />
            <span className="font-bold text-base hidden sm:block" style={{ color: 'var(--primary)' }}>
              CBK Foods
            </span>
          </Link>

          {/* Desktop center nav links */}
          <div className="hidden md:flex items-center gap-1">
            {desktopLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-secondary)',
                  background: location.pathname === link.path ? 'var(--primary-light)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Search — hide on admin */}
            {!isAdminPage && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Search size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
            )}

            {/* Cart — hide on admin */}
            {!isAdminPage && (
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ShoppingCart size={18} style={{ color: 'var(--text-secondary)' }} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: 'var(--primary)' }}>
                    {count}
                  </span>
                )}
              </button>
            )}

            {/* Profile link — desktop only, not on admin */}
            {!isAdminPage && user && (
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {user.fullName?.[0] || 'U'}
                </div>
              </Link>
            )}

            {/* Sign in — desktop only */}
            {!user && !isAdminPage && (
              <Link to="/login"
                className="hidden md:flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                style={{ color: 'var(--primary)' }}>
                <User size={16} /> Sign In
              </Link>
            )}

            {/* Hamburger — DESKTOP ONLY */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hidden md:flex p-2 rounded-lg hover:bg-white/5 transition-colors ml-1"
            >
              {menuOpen ? <X size={20} style={{ color: 'var(--text-secondary)' }} /> : <Menu size={20} style={{ color: 'var(--text-secondary)' }} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] glass flex items-start justify-center pt-24 animate-fade-in"
          onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search for food..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-12 pr-4 py-4 text-lg"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop slide menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 hidden md:block animate-fade-in" onClick={() => setMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Panel from right */}
          <div
            className="absolute top-0 right-0 h-full w-72 animate-slide-right flex flex-col"
            style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <img src={LOGO} alt="CBK" className="w-8 h-8 rounded-full" />
                <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>CBK Foods</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {isAdminPage && (
              <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}>Admin Menu</p>
            )}

            <div className="flex-1 overflow-y-auto py-2">
              {menuLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
                  style={{
                    color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-primary)',
                    background: location.pathname === link.path ? 'var(--primary-light)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {user && (
              <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}