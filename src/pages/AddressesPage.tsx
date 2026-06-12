import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Plus, Loader2, CheckCircle,
  AlertTriangle, Home, Briefcase, Trash2, Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

interface Address {
  id: string; label: string; area_name: string;
  specific_address: string; is_default: boolean; zone_id: string | null;
}
interface Zone { id: string; name: string }

type Screen = 'list' | 'checking' | 'outside' | 'add';

const LABEL_ICONS: Record<string, typeof Home> = { Home, Work: Briefcase, Other: MapPin };

/* ── Outside zone — waitlist capture ────────────────────────── */
function OutsideZone({ onBack }: { onBack: () => void }) {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setSaving(true);
    await supabase.from('zone_waitlist').upsert({ email: email.trim() }, { onConflict: 'email' });
    setSaving(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
           style={{ background: 'rgba(34,197,94,0.12)' }}>
        <CheckCircle size={36} style={{ color: '#22c55e' }} />
      </div>
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary,#fff)' }}>You're on the list!</h2>
      <p className="text-sm" style={{ color: 'var(--text-muted,#6b7280)' }}>
        We'll email you the moment we expand to your area.
      </p>
      <button onClick={onBack} className="w-full max-w-xs rounded-xl py-3.5 font-bold text-sm mt-2"
              style={{ background: '#f97316', color: '#fff' }}>
        Back to Profile
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
           style={{ background: 'rgba(249,115,22,0.1)' }}>
        <MapPin size={36} style={{ color: '#f97316' }} />
      </div>
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary,#fff)' }}>
        We don't deliver here yet
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted,#6b7280)' }}>
        Sorry, your location is currently outside our delivery zone. Drop your email below and we'll notify you the moment we expand to your area.
      </p>
      <div className="w-full max-w-xs space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
               placeholder="your@email.com"
               className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-primary,#fff)' }}
               onFocus={e => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
               onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
        <button onClick={handleSubmit} disabled={saving || !email.trim()}
                className="w-full rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: email.trim() ? '#f97316' : 'rgba(255,255,255,0.06)',
                         color: email.trim() ? '#fff' : 'var(--text-muted,#6b7280)' }}>
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Notify Me'}
        </button>
        <button onClick={onBack} className="text-sm w-full py-2" style={{ color: 'var(--text-muted,#6b7280)' }}>
          Go back
        </button>
      </div>
    </div>
  );
}

/* ── Add address form ────────────────────────────────────────── */
function AddForm({ zone, onSaved, onBack }: { zone: Zone; onSaved: () => void; onBack: () => void }) {
  const { user }      = useStore();
  const [areas, setAreas]   = useState<string[]>([]);
  const [area,  setArea]    = useState('');
  const [spec,  setSpec]    = useState('');
  const [label, setLabel]   = useState('Home');
  const [saving,setSaving]  = useState(false);
  const [error, setError]   = useState('');

  /* Load known areas near zone from existing addresses */
  useEffect(() => {
    supabase.from('delivery_addresses').select('area_name')
      .eq('zone_id', zone.id)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map(d => d.area_name))].sort();
        setAreas(unique);
      });
  }, [zone.id]);

  const handleSave = async () => {
    if (!area.trim() || !spec.trim()) { setError('Please fill in all fields'); return; }
    if (!user?.id) return;
    setSaving(true); setError('');

    const { error: dbErr } = await supabase.from('delivery_addresses').insert({
      user_id:          user.id,
      zone_id:          zone.id,
      label,
      area_name:        area.trim(),
      specific_address: spec.trim(),
    });

    setSaving(false);
    if (dbErr) { setError('Could not save address. Please try again.'); return; }
    onSaved();
  };

  return (
    <div className="space-y-5 px-4 pt-4 max-w-lg mx-auto">
      <div className="rounded-xl px-3 py-2.5 flex items-center gap-2"
           style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <CheckCircle size={14} style={{ color: '#22c55e' }} />
        <p className="text-xs font-medium" style={{ color: '#22c55e' }}>
          You're within the {zone.name} delivery zone ✓
        </p>
      </div>

      {/* Label picker */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
               style={{ color: 'var(--text-muted,#6b7280)' }}>Label</label>
        <div className="flex gap-2">
          {['Home', 'Work', 'Other'].map(l => (
            <button key={l} onClick={() => setLabel(l)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: label === l ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                             color: label === l ? '#f97316' : 'var(--text-muted,#6b7280)',
                             border: `1px solid ${label === l ? 'rgba(249,115,22,0.3)' : 'transparent'}` }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Area picker */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
               style={{ color: 'var(--text-muted,#6b7280)' }}>
          Area / Neighbourhood
        </label>
        {areas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {areas.map(a => (
              <button key={a} onClick={() => setArea(a)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: area === a ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)',
                               color: area === a ? '#f97316' : 'var(--text-muted,#6b7280)',
                               border: `1px solid ${area === a ? 'rgba(249,115,22,0.3)' : 'transparent'}` }}>
                {a}
              </button>
            ))}
          </div>
        )}
        <input type="text" value={area} onChange={e => setArea(e.target.value)}
               placeholder="e.g. Amuobia, Awka, Unizik junction…"
               className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-primary,#fff)' }}
               onFocus={e => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
               onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
      </div>

      {/* Specific address */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
               style={{ color: 'var(--text-muted,#6b7280)' }}>Specific Address</label>
        <textarea value={spec} onChange={e => setSpec(e.target.value)} rows={3}
                  placeholder="House number, street name, landmark…"
                  className="w-full rounded-xl px-4 py-3.5 text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                           color: 'var(--text-primary,#fff)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
      </div>

      {error && (
        <p className="text-xs px-4 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 rounded-xl py-3.5 text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted,#6b7280)' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving || !area.trim() || !spec.trim()}
                className="flex-2 rounded-xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 flex-1"
                style={{ background: area.trim() && spec.trim() ? '#f97316' : 'rgba(255,255,255,0.06)',
                         color: area.trim() && spec.trim() ? '#fff' : 'var(--text-muted,#6b7280)' }}>
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Save Address'}
        </button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function AddressesPage() {
  const navigate      = useNavigate();
  const { user }      = useStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [screen,    setScreen]    = useState<Screen>('list');
  const [zone,      setZone]      = useState<Zone | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [checking,  setChecking]  = useState(false);
  const [locError,  setLocError]  = useState('');

  const loadAddresses = () => {
    if (!user?.id) return;
    supabase.from('delivery_addresses')
      .select('id,label,area_name,specific_address,is_default,zone_id')
      .eq('user_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => { setAddresses(data ?? []); setLoading(false); });
  };

  useEffect(() => { loadAddresses(); }, [user?.id]);

  /* Check geofence then show correct screen */
  const handleAddNew = () => {
    setLocError('');
    setChecking(true);
    setScreen('checking');

    if (!navigator.geolocation) {
      setLocError('Geolocation not supported on this device.');
      setScreen('list');
      setChecking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geofence-check`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
              body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
            },
          );
          const json = await res.json();
          setChecking(false);
          if (json.inZone) {
            setZone(json.zone);
            setScreen('add');
          } else {
            setScreen('outside');
          }
        } catch {
          setChecking(false);
          setLocError('Could not check delivery zone. Please try again.');
          setScreen('list');
        }
      },
      (err) => {
        setChecking(false);
        setLocError(
          err.code === 1
            ? 'Location permission denied. Please allow location access in your browser settings.'
            : 'Could not get your location. Please try again.',
        );
        setScreen('list');
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleSetDefault = async (id: string) => {
    if (!user?.id) return;
    await supabase.from('delivery_addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('delivery_addresses').update({ is_default: true }).eq('id', id);
    loadAddresses();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('delivery_addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: 'var(--bg-primary,#0a0a0f)' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4"
           style={{ background: 'var(--bg-primary,#0a0a0f)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => screen !== 'list' ? setScreen('list') : navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary,#fff)' }} />
        </button>
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary,#fff)' }}>
          {screen === 'add' ? 'Add Address' : screen === 'outside' ? 'Delivery Zone' : 'Saved Addresses'}
        </h1>
        {screen === 'list' && (
          <button onClick={handleAddNew}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
            <Plus size={14} /> Add New
          </button>
        )}
      </div>

      {/* Checking location */}
      {screen === 'checking' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 size={36} className="animate-spin" style={{ color: '#f97316' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary,#fff)' }}>Checking your location…</p>
          <p className="text-xs" style={{ color: 'var(--text-muted,#6b7280)' }}>Please allow location access if prompted</p>
        </div>
      )}

      {/* Outside zone */}
      {screen === 'outside' && <OutsideZone onBack={() => setScreen('list')} />}

      {/* Add form */}
      {screen === 'add' && zone && (
        <AddForm zone={zone} onBack={() => setScreen('list')}
                 onSaved={() => { loadAddresses(); setScreen('list'); }} />
      )}

      {/* Address list */}
      {screen === 'list' && (
        <div className="px-4 pt-4 max-w-lg mx-auto w-full space-y-3">

          {/* Location error */}
          {locError && (
            <div className="rounded-xl px-4 py-3 flex gap-2"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              <p className="text-xs" style={{ color: '#ef4444' }}>{locError}</p>
            </div>
          )}

          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
              ))
            : addresses.length === 0
              ? <div className="pt-16 text-center space-y-3">
                  <MapPin size={40} className="mx-auto opacity-20" style={{ color: 'var(--text-muted,#6b7280)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted,#6b7280)' }}>No saved addresses</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted,#6b7280)' }}>Tap "Add New" to save a delivery address</p>
                </div>
              : addresses.map(addr => {
                  const LIcon = LABEL_ICONS[addr.label] ?? MapPin;
                  return (
                    <div key={addr.id} className="rounded-2xl p-4"
                         style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${addr.is_default ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                             style={{ background: addr.is_default ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)' }}>
                          <LIcon size={18} style={{ color: addr.is_default ? '#f97316' : 'var(--text-muted,#6b7280)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary,#fff)' }}>{addr.label}</p>
                            {addr.is_default && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                                    style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>DEFAULT</span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted,#6b7280)' }}>{addr.area_name}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted,#6b7280)' }}>{addr.specific_address}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefault(addr.id)}
                                  className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-opacity hover:opacity-80"
                                  style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                            <Star size={11} /> Set Default
                          </button>
                        )}
                        <button onClick={() => handleDelete(addr.id)}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
          }
        </div>
      )}
    </div>
  );
}
