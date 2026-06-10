import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Settings,
  Bell,
  Crown,
  Star,
  Calendar,
  ShoppingBag,
  Heart,
  Wallet,
  Plus,
  FileText,
  CreditCard,
  Gift,
  MapPin,
  Headphones,
  ChevronRight,
  Home,
  LayoutGrid,
  ShoppingCart,
  ClipboardList,
  User,
  LogOut
} from 'lucide-react';
import { useStore } from '@/store/useStore';

/* ============ Bottom Navigation ============ */
function BottomNav() {
  const [activeTab, setActiveTab] = useState('profile');
  const cartCount = 3;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky bottom-0 z-50 px-2 py-2 pb-safe"
         style={{ background: 'var(--bg-primary, #0a0a0f)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-[1400px] mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative"
              style={{ color: isActive ? 'var(--primary, #f97316)' : 'var(--text-muted, #6b7280)' }}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                        style={{ background: 'var(--primary, #f97316)', color: '#fff' }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium" style={{ color: isActive ? 'var(--primary, #f97316)' : 'inherit' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ============ Profile Header ============ */
function ProfileHeader() {
  const { user } = useStore();
  const name = user?.fullName || 'Amara';
  const avatarUrl = (user as any)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face';

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="max-w-[1400px] mx-auto flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-0.5" 
                 style={{ background: 'linear-gradient(135deg, var(--primary, #f97316) 0%, #fbbf24 100%)' }}>
              <img 
                src={avatarUrl} 
                alt={name} 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => { 
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face'; 
                }}
              />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--primary, #f97316)', border: '2px solid var(--bg-primary, #0a0a0f)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              </svg>
            </button>
          </div>

          <div>
            <p className="text-sm mb-0.5" style={{ color: 'var(--text-muted, #6b7280)' }}>Good evening,</p>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary, #ffffff)' }}>
              {name} <span className="text-xl">👋</span>
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2"
                 style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <Crown size={12} style={{ color: '#fbbf24' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#fbbf24' }}>Gold Member</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Settings size={20} style={{ color: 'var(--text-primary, #ffffff)' }} />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5 relative"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Bell size={20} style={{ color: 'var(--text-primary, #ffffff)' }} />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4 flex items-center justify-between"
           style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(251,191,36,0.15)' }}>
            <Star size={20} fill="#fbbf24" style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary, #ffffff)' }}>1,240 pts</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted, #6b7280)' }}>View rewards</p>
          </div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--text-muted, #6b7280)' }} />
      </div>
    </div>
  );
}

/* ============ Stats Bar ============ */
function StatsBar() {
  const stats = [
    { icon: Calendar, label: 'Member since', value: 'Jan 2024', color: '#f97316' },
    { icon: ShoppingBag, label: 'Total Orders', value: '32', color: '#a855f7' },
    { icon: Heart, label: 'Favorite Cuisine', value: 'Nigerian', color: '#22c55e' },
  ];

  return (
    <div className="px-4 py-3">
      <div className="max-w-[1400px] mx-auto rounded-2xl p-4 flex items-center justify-between"
           style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 flex-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: `${stat.color}15` }}>
                <Icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted, #6b7280)' }}>{stat.label}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary, #ffffff)' }}>{stat.value}</p>
              </div>
              {i < stats.length - 1 && (
                <div className="w-px h-8 ml-auto mr-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Wallet Section ============ */
function WalletSection() {
  const actions = [
    { icon: Plus, label: 'Add Money', color: '#f97316' },
    { icon: FileText, label: 'Transactions', color: '#60a5fa' },
    { icon: CreditCard, label: 'Payment\nMethods', color: '#22c55e' },
    { icon: Gift, label: 'Gift Cards', color: '#ec4899' },
  ];

  return (
    <div className="px-4 py-2">
      <div className="max-w-[1400px] mx-auto rounded-2xl p-5"
           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} style={{ color: 'var(--primary, #f97316)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #ffffff)' }}>My Wallet</span>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted, #6b7280)' }} />
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary, #ffffff)' }}>₦12,450.00</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted, #6b7280)' }}>Wallet Balance</p>
          </div>

          <div className="flex-1 flex items-center justify-end gap-4">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button key={i} className="flex flex-col items-center gap-1.5 transition-colors hover:opacity-80">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                       style={{ background: `${action.color}15`, border: `1px solid ${action.color}20` }}>
                    <Icon size={20} style={{ color: action.color }} />
                  </div>
                  <span className="text-[9px] font-medium text-center leading-tight whitespace-pre-line" 
                        style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Orders Tracker ============ */
function OrdersTracker() {
  const { user } = useStore();
  const isAdmin = user?.role?.startsWith('admin');

  const statuses: Array<{
    icon: React.ComponentType<any>;
    label: string;
    count: number;
    color: string;
    active: boolean;
  }> = [
    { icon: Calendar, label: 'Upcoming', count: 1, color: '#f97316', active: true },
    { icon: ShoppingBag, label: 'Preparing', count: 0, color: '#9ca3af', active: false },
    { icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
        <path d="M15 17.5V6.5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v11"/>
        <path d="M9 17.5H3v-3a2 2 0 0 1 2-2h2"/><path d="M21 17.5v-3a2 2 0 0 0-2-2h-2"/>
      </svg>
    ), label: 'On the way', count: 0, color: '#9ca3af', active: false },
    { icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ), label: 'Completed', count: 0, color: '#22c55e', active: false },
    { icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
      </svg>
    ), label: 'Cancelled', count: 0, color: '#ef4444', active: false },
  ];

  return (
    <div className="px-4 py-2">
      <div className="max-w-[1400px] mx-auto rounded-2xl p-5"
           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #ffffff)' }}>My Orders</span>
          <Link to="/orders" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: 'var(--primary, #f97316)' }}>
            View all orders
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex items-center justify-between">
          {statuses.map((status, i) => {
            const Icon = status.icon;
            return (
              <button key={i} className="flex flex-col items-center gap-2 relative">
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${status.active ? '' : 'opacity-60'}`}
                       style={{ background: status.active ? `${status.color}15` : 'rgba(255,255,255,0.04)' }}>
                    <div style={{ color: status.active ? status.color : 'var(--text-muted, #6b7280)' }}>
                      <Icon size={20} />
                    </div>
                  </div>
                  {status.count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                          style={{ background: '#ef4444', color: '#fff' }}>
                      {status.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium" style={{ color: status.active ? 'var(--text-primary, #ffffff)' : 'var(--text-muted, #6b7280)' }}>
                  {status.label}
                </span>
              </button>
            );
          })}
        </div>

        {isAdmin && (
          <Link to="/admin" 
                className="mt-4 pt-3 flex items-center gap-2 text-xs font-medium border-t transition-colors hover:opacity-80"
                style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--primary, #f97316)' }}>
            <User size={14} />
            Admin Dashboard
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ============ Menu List Item ============ */
interface MenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  _iconColor?: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  to?: string;
  onClick?: () => void;
}

function MenuListItem({ icon, iconBg, title, subtitle, badge, badgeColor, to, onClick }: MenuItemProps) {
  const content = (
    <div className="flex items-center gap-3 py-3.5 group cursor-pointer">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary, #ffffff)' }}>{title}</h4>
          {badge && (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold"
                  style={{ background: badgeColor || 'rgba(249,115,22,0.15)', color: badgeColor ? '#fff' : 'var(--primary, #f97316)' }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted, #6b7280)' }}>{subtitle}</p>
      </div>
      <ChevronRight size={16} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5" 
                    style={{ color: 'var(--text-muted, #6b7280)' }} />
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }
  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}

/* ============ Menu List ============ */
function MenuList() {
  const { addToast } = useStore();

  const menuItems: MenuItemProps[] = [
    {
      icon: <MapPin size={18} style={{ color: '#f97316' }} />,
      iconBg: 'rgba(249,115,22,0.1)',
      title: 'Saved Addresses',
      subtitle: 'Manage your delivery addresses',
      to: '/addresses',
    },
    {
      icon: <Heart size={18} style={{ color: '#ef4444' }} />,
      iconBg: 'rgba(239,68,68,0.1)',
      title: 'Favourite Meals',
      subtitle: 'Your saved meals and restaurants',
      to: '/favorites',
    },
    {
      icon: <Star size={18} style={{ color: '#fbbf24' }} />,
      iconBg: 'rgba(251,191,36,0.1)',
      title: 'Reviews & Ratings',
      subtitle: 'See your reviews and ratings',
      to: '/reviews',
    },
    {
      icon: <Gift size={18} style={{ color: '#ec4899' }} />,
      iconBg: 'rgba(236,72,153,0.1)',
      title: 'Refer & Earn',
      subtitle: 'Invite friends and earn rewards',
      badge: 'Earn ₦2,000',
      badgeColor: 'rgba(236,72,153,0.2)',
      onClick: () => addToast('info', 'Referral program coming soon'),
    },
    {
      icon: <Headphones size={18} style={{ color: '#60a5fa' }} />,
      iconBg: 'rgba(96,165,250,0.1)',
      title: 'Help & Support',
      subtitle: 'FAQs, contact support and more',
      to: '/support',
    },
  ];

  return (
    <div className="px-4 py-2">
      <div className="max-w-[1400px] mx-auto rounded-2xl px-4"
           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        {menuItems.map((item, i) => (
          <div key={i}>
            <MenuListItem {...item} />
            {i < menuItems.length - 1 && (
              <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ Recently Viewed ============ */
function RecentlyViewed() {
  const items = [
    { id: '1', name: 'Jollof Rice Special', price: 5500, rating: 4.9, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop' },
    { id: '2', name: 'Oha Soup', price: 4800, rating: 4.7, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=300&fit=crop' },
    { id: '3', name: 'Grilled Chicken', price: 3800, rating: 4.8, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&h=300&fit=crop' },
    { id: '4', name: 'Pounded Yam & Egusi', price: 4500, rating: 4.9, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=300&fit=crop' },
  ];

  return (
    <section className="px-4 py-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary, #ffffff)' }}>Recently Viewed</h2>
          <Link to="/recently-viewed" className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: 'var(--primary, #f97316)' }}>
            See all
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {items.map((item) => (
            <Link 
              key={item.id}
              to={`/item/${item.id}`}
              className="flex-shrink-0 w-[140px] snap-start group"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-square mb-2"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder-food.jpg'; }}
                />
                <button className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
                  <Heart size={12} style={{ color: 'var(--text-primary, #ffffff)' }} />
                </button>
                <div className="absolute bottom-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
                     style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                  <Star size={10} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                  <span className="text-[9px] font-bold" style={{ color: '#fbbf24' }}>{item.rating}</span>
                </div>
              </div>
              <h3 className="text-xs font-semibold mb-0.5 truncate" style={{ color: 'var(--text-primary, #ffffff)' }}>{item.name}</h3>
              <p className="text-xs font-bold" style={{ color: 'var(--primary, #f97316)' }}>₦{item.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Profile Page ============ */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout, addToast } = useStore();

  const handleLogout = () => {
    logout();
    addToast('success', 'Signed out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary, #0a0a0f)' }}>
      <main className="flex-1 pb-4 space-y-2">
        <ProfileHeader />
        <StatsBar />
        <WalletSection />
        <OrdersTracker />
        <MenuList />
        <RecentlyViewed />

        <div className="px-4 py-2">
          <button 
            onClick={handleLogout}
            className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
