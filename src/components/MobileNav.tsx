import { Link, useLocation } from 'react-router-dom';
import { Hop as Home, Grid3x2 as Grid3X3, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function MobileNav() {
  const location = useLocation();
  const cartCount = useStore(s => s.cartCount);
  const categories = useStore(s => s.categories);
  const count = cartCount();
  const categoryPath = categories.length > 0 ? `/category/${categories[0].slug}` : '/';

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid3X3, label: 'Categories', path: categoryPath },
    { icon: ShoppingCart, label: 'Cart', path: '/cart' },
    { icon: ClipboardList, label: 'Orders', path: '/orders' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t"
      style={{ borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-1 py-2 px-3 relative"
            >
              <div className="relative">
                <tab.icon
                  size={20}
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                />
                {tab.label === 'Cart' && count > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white px-1"
                    style={{ background: 'var(--primary)' }}>
                    {count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium" style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
