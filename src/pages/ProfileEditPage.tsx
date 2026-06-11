import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('') || '?';
}

const AVATAR_COLORS = ['#f97316','#a855f7','#22c55e','#60a5fa','#ec4899','#fbbf24'];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ProfileEditPage() {
  const navigate        = useNavigate();
  const { user, setUser } = useStore();
  const fileRef         = useRef<HTMLInputElement>(null);

  const [fullName,   setFullName]   = useState(user?.fullName ?? '');
  const [phone,      setPhone]      = useState((user as any)?.phone ?? '');
  const [avatarUrl,  setAvatarUrl]  = useState((user as any)?.avatar_url ?? '');
  const [uploading,  setUploading]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  /* ── Avatar upload ─────────────────────────────────────── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const MAX_MB = 2;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB}MB`);
      return;
    }

    setUploading(true);
    setError('');

    const ext  = file.name.split('.').pop();
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) {
      setError('Upload failed. Please try again.');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`; // cache bust
    setAvatarUrl(url);
    setUploading(false);
  };

  /* ── Save profile ──────────────────────────────────────── */
  const handleSave = async () => {
    if (!user?.id) return;
    if (!fullName.trim()) { setError('Name cannot be empty'); return; }

    setSaving(true);
    setError('');

    const { error: saveErr } = await supabase
      .from('profiles')
      .update({
        full_name:  fullName.trim(),
        phone:      phone.trim(),
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id);

    if (saveErr) {
      setError('Failed to save. Please try again.');
      setSaving(false);
      return;
    }

    /* Update local store */
    setUser({ ...user, fullName: fullName.trim(), phone: phone.trim(), avatar_url: avatarUrl } as any);

    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/profile'); }, 1200);
  };

  const initials = getInitials(fullName || 'Guest');
  const bgColor  = avatarColor(fullName || 'Guest');

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary, #0a0a0f)' }}>

      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4"
        style={{
          background: 'var(--bg-primary, #0a0a0f)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-primary, #fff)' }} />
        </button>
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary, #fff)' }}>
          Edit Profile
        </h1>
      </div>

      <div className="px-4 pt-8 max-w-lg mx-auto space-y-6">

        {/* ── Avatar picker ── */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {/* Glow ring */}
            <div
              className="w-24 h-24 rounded-full p-0.5"
              style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)' }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full rounded-full object-cover"
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: bgColor }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Camera overlay */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity"
              style={{ background: 'rgba(0,0,0,0.45)' }}
              aria-label="Change photo"
            >
              {uploading
                ? <Loader2 size={22} className="animate-spin" style={{ color: '#fff' }} />
                : <Camera size={22} style={{ color: '#fff' }} />
              }
            </button>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted, #6b7280)' }}>
            Tap to change photo · Max 2MB
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* ── Form fields ── */}
        <div className="space-y-4">

          {/* Full name */}
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: 'var(--text-muted, #6b7280)' }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary, #fff)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
              onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: 'var(--text-muted, #6b7280)' }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary, #fff)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
              onBlur={(e)  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          {/* Email — read only */}
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: 'var(--text-muted, #6b7280)' }}
            >
              Email <span className="normal-case font-normal">(cannot be changed)</span>
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full rounded-xl px-4 py-3.5 text-sm cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'var(--text-muted, #6b7280)',
              }}
            />
          </div>
        </div>

        {/* ── Error message ── */}
        {error && (
          <p
            className="text-sm text-center px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444',
            }}
          >
            {error}
          </p>
        )}

        {/* ── Save button ── */}
        <button
          onClick={handleSave}
          disabled={saving || uploading || saved}
          className="w-full rounded-xl py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-[0.98]"
          style={{
            background: saved
              ? 'rgba(34,197,94,0.15)'
              : 'var(--primary, #f97316)',
            color: saved ? '#22c55e' : '#fff',
            opacity: (saving || uploading) ? 0.7 : 1,
            border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
          }}
        >
          {saving
            ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
            : saved
            ? <><Check size={16} /> Saved!</>
            : 'Save Changes'
          }
        </button>
      </div>
    </div>
  );
}