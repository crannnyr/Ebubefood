import { Calendar, ShoppingBag, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';

export default function StatsBar() {
  const { user } = useStore();

  const memberSince = (user as any)?.createdAt
    ? format(new Date((user as any).createdAt), 'MMM yyyy')
    : 'Jan 2024';

  const totalOrders    = (user as any)?.totalOrders   ?? 0;
  const favouriteMeal  = (user as any)?.favouriteMeal ?? 'Jollof Rice';

  const stats = [
    { icon: Calendar, label: 'Member since', value: memberSince,   color: '#f97316' },
    { icon: ShoppingBag, label: 'Total Orders', value: String(totalOrders), color: '#a855f7' },
    { icon: Heart,     label: 'Favourite Meal', value: favouriteMeal, color: '#22c55e' },
  ];

  return (
    <div className="px-4 py-2">
      <div
        className="max-w-[1400px] mx-auto rounded-2xl p-4 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <div key={label} className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18` }}
            >
              <Icon size={17} style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] mb-0.5 truncate" style={{ color: 'var(--text-muted, #6b7280)' }}>
                {label}
              </p>
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary, #ffffff)' }}>
                {value}
              </p>
            </div>

            {/* Divider between items */}
            {i < stats.length - 1 && (
              <div
                className="w-px h-8 ml-auto mr-2 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
