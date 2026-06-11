import { useEffect, useState } from 'react';
import { Flame, Zap, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function StatsBar() {
  const siteSettings = useStore(s => s.siteSettings);
  const orders = useStore(s => s.orders);

  const mode = siteSettings.stats_mode || 'fake';
  const fakeMin = parseInt(siteSettings.stats_fake_min || '13');
  const fakeMax = parseInt(siteSettings.stats_fake_max || '57');
  const avgDelivery = siteSettings.stats_avg_delivery_mins || '28';
  const rating = siteSettings.stats_rating || '4.9';
  const happyCustomers = siteSettings.stats_happy_customers || '2400';

  const [orderCount, setOrderCount] = useState(fakeMin);

  useEffect(() => {
    if (mode === 'real') {
      const today = new Date().toISOString().slice(0, 10);
      const todayCount = orders.filter(o => o.createdAt.startsWith(today)).length;
      setOrderCount(todayCount);
      return;
    }

    // Fake mode — start at random point in range, increment every 2 hours
    const getCount = () => {
      const hour = new Date().getHours();
      const seed = Math.floor(hour / 2);
      const range = fakeMax - fakeMin;
      return fakeMin + (seed * 7 % range);
    };

    setOrderCount(getCount());
    const interval = setInterval(() => setOrderCount(getCount()), 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [mode, fakeMin, fakeMax, orders]);

  return (
    <div className="mx-4 -mt-6 relative z-10 rounded-2xl p-4 grid grid-cols-3 gap-2"
      style={{ background: 'rgba(22,33,62,0.95)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
          style={{ background: 'var(--primary-light)' }}>
          <Flame size={16} style={{ color: 'var(--primary)' }} />
        </div>
        <span className="font-mono font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {orderCount}
        </span>
        <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
          ordered in the last hour
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 text-center border-x" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
          style={{ background: 'var(--primary-light)' }}>
          <Zap size={16} style={{ color: 'var(--primary)' }} />
        </div>
        <span className="font-mono font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {avgDelivery} mins
        </span>
        <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
          average delivery time
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
          style={{ background: 'var(--accent-light)' }}>
          <Star size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <span className="font-mono font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {rating} / 5
        </span>
        <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
          by {parseInt(happyCustomers).toLocaleString()}+ happy customers
        </span>
      </div>
    </div>
  );
}