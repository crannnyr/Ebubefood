import { Settings, Bell, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

/* Derive initials from full name e.g. "Amara Obi" → "AO" */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/* Deterministic bg colour from name so it's always the same per user */
const AVATAR_COLORS = ['#f97316','#a855f7','#22c55e','#60a5fa','#ec4899','#fbbf24'];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ProfileHeader() {
  const { user }   = useStore();
  const navigate   = useNavigate();
  const name       = user?.fullName ?? 'Guest';
  const avatarUrl  = (user as any)?.avatar_url ?? (user as any)?.avatar ?? '';
  const memberTier = (user as any)?.memberTier ?? 'Gold Member';
  const initials   = getInitials(name);
  const bgColor    = avatarColor(name);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
  })();

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="max-w-[1400px] mx-auto flex items-start justify-between">

        {/* ── Avatar + name ── */}
        <div className="flex items-center gap-4">
          <div className="relative">

            {/* Glow ring */}
            <div
              className="w-16 h-16 rounded-full p-0.5 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                /* Initials fallback */
                <div
                  className="w-full h-full rounded-full flex items-center justify-center font-bold text-lg text-white"
                  style={{ background: bgColor }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Edit pencil */}
            <button
              onClick={() => navigate('/profile/edit')}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--primary, #f97316)',
                border: '2px solid var(--bg-primary, #0a0a0f)',
              }}
              aria-label="Edit profile"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
          </div>

          {/* Greeting + tier badge */}
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted, #6b7280)' }}>
              {greeting}
            </p>
            <h1
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: 'var(--text-primary, #ffffff)' }}
            >
              {name.split(' ')[0]} <span className="text-xl">👋</span>
            </h1>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2"
              style={{
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.2)',
              }}
            >
              <Crown size={12} style={{ color: '#fbbf24' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#fbbf24' }}>
                {memberTier}
              </span>
            </div>
          </div>
        </div>

        {/* ── Settings + notifications ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            aria-label="Settings"
          >
            <Settings size={20} style={{ color: 'var(--text-primary, #ffffff)' }} />
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors relative"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            aria-label="Notifications"
          >
            <Bell size={20} style={{ color: 'var(--text-primary, #ffffff)' }} />
            <span
              className="absolute top-2 right-2.5 w-2 h-2 rounded-full"
              style={{ background: '#ef4444' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
