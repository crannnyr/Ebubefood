import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, FileText, CreditCard,
  ArrowDownLeft, ArrowUpRight, RotateCcw,
  Clock, CheckCircle, XCircle, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

interface Wallet   { balance: number; total_funded: number; total_spent: number }
interface Tx       { id: string; type: string; status: string; amount: number; description: string; created_at: string }
interface Funding  { id: string; amount: number; method: string; status: string; created_at: string; retry_count: number }

const fmt = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

function TxRow({ tx }: { tx: Tx }) {
  const isCredit = ['funding', 'refund', 'reversal'].includes(tx.type);
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: isCredit ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
        {isCredit
          ? <ArrowDownLeft size={16} style={{ color: '#22c55e' }} />
          : <ArrowUpRight  size={16} style={{ color: '#ef4444' }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary,#fff)' }}>
          {tx.description || tx.type}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted,#6b7280)' }}>
          {new Date(tx.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: isCredit ? '#22c55e' : '#ef4444' }}>
          {isCredit ? '+' : '-'}{fmt(tx.amount)}
        </p>
        <p className="text-[10px] capitalize" style={{ color: tx.status === 'completed' ? '#22c55e' : 'var(--text-muted,#6b7280)' }}>
          {tx.status}
        </p>
      </div>
    </div>
  );
}

function PendingBadge({ req, onRetry }: { req: Funding; onRetry: (id: string) => void }) {
  const isManual   = req.method === 'manual';
  const isFailed   = req.status === 'failed' || req.status === 'cancelled';
  const isPending  = req.status === 'pending';

  return (
    <div className="rounded-xl p-4 flex items-center gap-3"
         style={{ background: isPending ? 'rgba(251,191,36,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${isPending ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: isPending ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)' }}>
        {isPending ? <Clock size={16} style={{ color: '#fbbf24' }} /> : <XCircle size={16} style={{ color: '#ef4444' }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary,#fff)' }}>
          {fmt(req.amount)} — {isManual ? 'Manual' : 'Paystack'}
        </p>
        <p className="text-[11px]" style={{ color: 'var(--text-muted,#6b7280)' }}>
          {isPending ? (isManual ? 'Awaiting admin confirmation' : 'Payment pending') : 'Payment failed or cancelled'}
        </p>
      </div>
      {isFailed && (
        <button onClick={() => onRetry(req.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
          <RotateCcw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

export default function WalletPage() {
  const navigate          = useNavigate();
  const { user }          = useStore();
  const [wallet,  setWallet]   = useState<Wallet | null>(null);
  const [txs,     setTxs]      = useState<Tx[]>([]);
  const [pending, setPending]  = useState<Funding[]>([]);
  const [loading, setLoading]  = useState(true);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [wRes, txRes, pendRes] = await Promise.all([
      supabase.from('wallets').select('balance,total_funded,total_spent').eq('user_id', user.id).single(),
      supabase.from('wallet_transactions').select('id,type,status,amount,description,created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('wallet_funding_requests').select('id,amount,method,status,created_at,retry_count')
        .eq('user_id', user.id).in('status', ['pending', 'failed', 'cancelled'])
        .order('created_at', { ascending: false }).limit(3),
    ]);
    if (wRes.data)    setWallet(wRes.data);
    if (txRes.data)   setTxs(txRes.data);
    if (pendRes.data) setPending(pendRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleRetry = (fundingId: string) => {
    navigate('/wallet/fund', { state: { retryId: fundingId } });
  };

  const actions = [
    { icon: Plus,       label: 'Add Money',   color: '#f97316', path: '/wallet/fund'    },
    { icon: FileText,   label: 'History',     color: '#60a5fa', path: '/wallet/history' },
    { icon: CreditCard, label: 'Methods',     color: '#22c55e', path: '/wallet/methods' },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary,#0a0a0f)' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4"
           style={{ background: 'var(--bg-primary,#0a0a0f)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary,#fff)' }} />
        </button>
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary,#fff)' }}>My Wallet</h1>
        <button onClick={load} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
          <RotateCcw size={15} style={{ color: 'var(--text-muted,#6b7280)' }} />
        </button>
      </div>

      <div className="px-4 space-y-4 pt-4 max-w-lg mx-auto">

        {/* Balance card */}
        <div className="rounded-2xl p-6 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.25) 0%,rgba(251,191,36,0.1) 100%)',
                      border: '1px solid rgba(249,115,22,0.25)' }}>
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
               style={{ background: '#f97316', filter: 'blur(24px)' }} />
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Wallet Balance
          </p>
          {loading
            ? <div className="h-10 w-40 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
            : <p className="text-4xl font-extrabold tracking-tight" style={{ color: '#fff' }}>
                {fmt(wallet?.balance ?? 0)}
              </p>
          }
          <div className="flex gap-6 mt-4">
            {[{ label: 'Total Funded', val: wallet?.total_funded ?? 0, color: '#22c55e' },
              { label: 'Total Spent',  val: wallet?.total_spent  ?? 0, color: '#ef4444' }]
              .map(s => (
                <div key={s.label}>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: s.color }}>
                    {loading ? '—' : fmt(s.val)}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {actions.map(({ icon: Icon, label, color, path }) => (
            <button key={label} onClick={() => navigate(path)}
                    className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:opacity-90 active:scale-95"
                    style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                   style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary,#fff)' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted,#6b7280)' }}>
              Pending Payments
            </p>
            {pending.map(req => <PendingBadge key={req.id} req={req} onRetry={handleRetry} />)}
          </div>
        )}

        {/* Recent transactions */}
        <div className="rounded-2xl px-4 py-2"
             style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary,#fff)' }}>Recent Activity</p>
            <button onClick={() => navigate('/wallet/history')}
                    className="flex items-center gap-0.5 text-xs font-medium hover:opacity-75"
                    style={{ color: 'var(--primary,#f97316)' }}>
              See all <ChevronRight size={13} />
            </button>
          </div>

          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <div className="w-9 h-9 rounded-xl animate-pulse flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded animate-pulse w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-2.5 rounded animate-pulse w-1/2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                </div>
              ))
            : txs.length > 0
              ? txs.map((tx, i) => (
                  <div key={tx.id}>
                    <TxRow tx={tx} />
                    {i < txs.length - 1 && <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                  </div>
                ))
              : <div className="py-10 text-center">
                  <CheckCircle size={32} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted,#6b7280)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted,#6b7280)' }}>No transactions yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted,#6b7280)' }}>Fund your wallet to get started</p>
                </div>
          }
        </div>
      </div>
    </div>
  );
}
