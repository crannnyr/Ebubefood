import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';

import ProfileHeader   from '@/components/profile/ProfileHeader';
import StatsBar        from '@/components/profile/StatsBar';
import WalletSection   from '@/components/profile/WalletSection';
import OrdersTracker   from '@/components/profile/OrdersTracker';
import MenuList        from '@/components/profile/MenuList';
import RecentlyViewed  from '@/components/profile/RecentlyViewed';

export default function ProfilePage() {
  const navigate        = useNavigate();
  const { logout, addToast } = useStore();

  const handleLogout = () => {
    logout();
    addToast('success', 'Signed out successfully');
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary, #0a0a0f)' }}
    >
      <main className="flex-1 pb-24 space-y-1">
        <ProfileHeader  />
        <StatsBar       />
        <WalletSection  />
        <OrdersTracker  />
        <MenuList       />
        <RecentlyViewed />

        {/* Sign out */}
        <div className="px-4 pt-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full max-w-[1400px] mx-auto rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
