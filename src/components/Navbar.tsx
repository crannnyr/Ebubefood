import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, cartCount, toggleCart, logout } = useStore();
  const location = useLocation();
  const count = cartCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isAdmin = user?.role?.startsWith('admin') ?? false;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-lg' : 'bg-transparent'
        }`}
        style={{ height: scrolled ? 56 : 64 }}
      >
        <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="CBK" className="w-9 h-9" />
              <span className="font-bold text-lg hidden sm:block" style={{ color: 'var(--primary)' }}>
                CBK Foods
              </span>
            </Link>
          </div>

          {/* Center - Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home', path: '/' },
              { label: 'Menu', path: '/#menu' },
              { label: 'Orders', path: '/orders' },
              { label: 'Profile', path: '/profile' },
              ...(isAdmin ? [{ label: 'Admin', path: '/admin' }] : []),
            ].map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }`}
                style={{ color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Search size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>
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
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {user.fullName?.[0] || 'U'}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.fullName?.split(' ')[0]}</span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: 'var(--primary)' }}>
                <User size={16} />
                Sign In
              </Link>
            )}
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
                placeholder="Search for food, categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-12 pr-4 py-4 text-lg"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 glass md:hidden animate-fade-in" onClick={() => setIsOpen(false)}>
          <div className="pt-20 px-6 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
            {[
              { label: 'Home', path: '/' },
              { label: 'Menu', path: '/#menu' },
              { label: 'My Orders', path: '/orders' },
              { label: 'Profile', path: '/profile' },
              { label: 'Advertise', path: '/ads' },
              ...(isAdmin ? [{ label: 'Admin Dashboard', path: '/admin' }] : []),
            ].map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-3 rounded-lg text-base font-medium hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="px-4 py-3 rounded-lg text-base font-medium text-left hover:bg-white/5 transition-colors"
                style={{ color: 'var(--danger)' }}
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="btn-primary text-center mt-4" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
