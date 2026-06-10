import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, ShoppingBag, CheckCircle, XCircle,
  ChevronRight, LayoutDashboard,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

/* Delivery scooter SVG — matches the image exactly */
function ScooterIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 17.5V6.5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v11" />
      <path d="M9 17.5H3v-3a2 2 0 0 1 2-2h2" />
      <path d="M21 17.5v-3a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}

/* Cloche/preparing icon */
function ClocheIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17h20" />
      <path d="M12 3C7.6 3 4 6.6 4 11v1h16v-1c0-4.4-3.6-8-8-8Z" />
      <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
    </svg>
  );
}

type OrderStatus = 'upcoming' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';

interface StatusCount {
  upcoming: number;
  preparing: number;
  on_the_way: number;
  completed: number;
  cancelled: number;
}

const STATUS_MAP: Record<OrderStatus, { dbStatus: string[]; label: string; color: string }> = {
  upcoming:    { dbStatus: ['pending', 'confirmed'],        label: 'Upcoming',   color: '#f97316' },
  preparing:   { dbStatus: ['preparing'],                   label: 'Preparing',  color: '#a855f7' },
  on_the_way:  { dbStatus: ['ready', 'out_for_delivery'],   label: 'On the way', color: '#60a5fa' },
  completed:   { dbStatus: ['delivered'],                   label: 'Completed',  color: '#22c55e' },
  cancelled:   { dbStatus: ['cancelled'],                   label: 'Cancelled',  color: '#ef4444' },
};

export default function OrdersTracker() {
  const { user }  = useStore();
  const isAdmin   = user?.role?.startsWith('admin') ?? false;
  const [counts, setCounts] = useState<StatusCount>({
    upcoming: 0, preparing: 0, on_the_way: 0, completed: 0, cancelled: 0,
  });

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('orders')
      .select('status')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data) return;
        const next: StatusCount = { upcoming: 0, preparing: 0, on_the_way: 0, completed: 0, cancelled: 0 };
        data.forEach(({ status }) => {
          (Object.keys(STATUS_MAP) as OrderStatus[]).forEach((key) => {
            if (STATUS_MAP[key].dbStatus.includes(status)) next[key]++;
          });
        });
        setCounts(next);
      });
  }, [user?.id]);

  const tabs: Array<{
    key: OrderStatus;
    icon: React.ReactNode;
  }> = [
    { key: 'upcoming',   icon: <Calendar size={20} /> },
    { key: 'preparing',  icon: <ClocheIcon size={20} /> },
    { key: 'on_the_way', icon: <ScooterIcon size={20} /> },
    { key: 'completed',  icon: <CheckCircle size={20} /> },
    { key: 'cancelled',  icon: <XCircle size={20} /> },
  ];

  return (
    <div className="px-4 py-2">
      <div
        className="max-w-[1400px] mx-auto rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary, #ffffff)' }}
          >
            My Orders
          </span>
          <Link
            to="/orders"
            className="flex items-center gap-0.5 text-xs font-medium transition-opacity hover:opacity-75"
            style={{ color: 'var(--primary, #f97316)' }}
          >
            View all orders
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex items-start justify-between">
          {tabs.map(({ key, icon }) => {
            const { label, color } = STATUS_MAP[key];
            const count = counts[key];
            const hasCount = count > 0;

            return (
              <Link
                key={key}
                to={`/orders?status=${key}`}
                className="flex flex-col items-center gap-2 group"
              >
                {/* Icon bubble */}
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:opacity-90"
                    style={{
                      background: hasCount ? `${color}18` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${hasCount ? `${color}28` : 'transparent'}`,
                      color: hasCount ? color : 'var(--text-muted, #6b7280)',
                    }}
                  >
                    {icon}
                  </div>
                  {/* Badge */}
                  {hasCount && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1"
                      style={{ background: '#ef4444' }}
                    >
                      {count}
                    </span>
                  )}
                </div>

                <span
                  className="text-[10px] font-medium text-center leading-tight"
                  style={{
                    color: hasCount
                      ? 'var(--text-primary, #ffffff)'
                      : 'var(--text-muted, #6b7280)',
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Admin shortcut */}
        {isAdmin && (
          <Link
            to="/admin"
            className="mt-4 pt-3 flex items-center gap-2 text-xs font-medium border-t transition-opacity hover:opacity-75"
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              color: 'var(--primary, #f97316)',
            }}
          >
            <LayoutDashboard size={13} />
            Admin Dashboard
            <ChevronRight size={13} className="ml-auto" />
          </Link>
        )}
      </div>
    </div>
  );
}
