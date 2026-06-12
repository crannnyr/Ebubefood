import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Building2, HelpCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

type Method = 'paystack' | 'manual' | 'ask_every_time';

const OPTIONS: { id: Method; icon: typeof Zap; label: string; sub: string; color: string }[] = [
  { id: 'paystack',      icon: Zap,         label: 'Paystack',       sub: 'Pay instantly with card, bank transfer or USSD', color: '#22c55e'  },
  { id: 'manual',        icon: Building2,   label: 'Manual Transfer', sub: 'Pay via bank transfer — admin confirms within 24hrs', color: '#60a5fa'  },
  { id: 'ask_every_time',icon: HelpCircle,  label: 'Ask Every Time',  sub: 'Choose your method at checkout each time',        color: '#f97316'  },
];

export default function WalletMethodsPage() {
  const navigate        = useNavigate();
  const { user }        = useStore();
  const [selected, setSelected] = useState<Method>('ask_every_time');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('payment_preferences').select('default_method')
      .eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.default_method) setSelected(data.default_method as Method);
        setLoading(false);
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

    const { error } = await supabase.from('payment_preferences')
      .upsert({ user_id: user.id, default_method: selected, updated_at: new Date().toISOString() },
               { onConflict: 'user_id' });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate(-1); }, 1200);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary,#0a0a0f)' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4"
           style={{ background: 'var(--bg-primary,#0a0a0f)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary,#fff)' }} />
        </button>
        <div>
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary,#fff)' }}>Payment Method</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted,#6b7280)' }}>Default method at checkout</p>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-lg mx-auto space-y-3">

        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))
          : OPTIONS.map(({ id, icon: Icon, label, sub, color }) => {
              const active = selected === id;
              return (
                <button key={id} onClick={() => setSelected(id)}
                        className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all text-left"
                        style={{ background: active ? `${color}10` : 'rgba(255,255,255,0.03)',
                                 border: `1px solid ${active ? `${color}30` : 'rgba(255,255,255,0.06)'}` }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: active ? `${color}20` : 'rgba(255,255,255,0.06)' }}>
                    <Icon size={20} style={{ color: active ? color : 'var(--text-muted,#6b7280)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary,#fff)' }}>{label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted,#6b7280)' }}>{sub}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                       style={{ borderColor: active ? color : 'rgba(255,255,255,0.2)',
                                background:  active ? color : 'transparent' }}>
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })
        }

        {/* Note about POD */}
        <div className="rounded-xl p-3.5 flex gap-3"
             style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <HelpCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted,#6b7280)' }}>
            <span className="font-semibold" style={{ color: '#fbbf24' }}>Pay on Delivery</span> is available for trusted customers only and is enabled by our team. Contact support if you'd like to be considered.
          </p>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving || saved || loading}
                className="w-full rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
                style={{ background: saved ? 'rgba(34,197,94,0.15)' : 'var(--primary,#f97316)',
                         color: saved ? '#22c55e' : '#fff',
                         border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
                         opacity: saving ? 0.7 : 1 }}>
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
           : saved  ? <><CheckCircle size={16} /> Saved!</>
           : 'Save Preference'}
        </button>
      </div>
    </div>
  );
}
