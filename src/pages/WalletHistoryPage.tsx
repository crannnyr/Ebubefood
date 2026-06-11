import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, RotateCcw, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

interface Tx {
  id: string; type: string; status: string;
  amount: number; description: string; created_at: string;
  balance_after: number;
}

type Filter = 'all' | 'credit' | 'debit';

const PAGE     = 15;
const CREDIT   = ['funding', 'refund', 'reversal'];
const fmt      = (n: number) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
const fmtDate  = (d: string) =>
  new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const TYPE_LABEL: Record<string, string> = {
  funding:   'Wallet Top-up',
  payment:   'Order Payment',
  refund:    'Refund',
  reversal:  'Reversal',
};

function TxItem({ tx }: { tx: Tx }) {
  const isCredit = CREDIT.includes(tx.type);
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: isCredit ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)' }}>
        {isCredit
          ? <ArrowDownLeft size={18} style={{ color: '#22c55e' }} />
          : <ArrowUpRight  size={18} style={{ color: '#ef4444' }} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary,#fff)' }}>
          {tx.description || TYPE_LABEL[tx.type] || tx.type}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted,#6b7280)' }}>
          {fmtDate(tx.created_at)}
        </p>
      </div>

      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-sm font-bold" style={{ color: isCredit ? '#22c55e' : '#ef4444' }}>
          {isCredit ? '+' : '-'}{fmt(tx.amount)}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted,#6b7280)' }}>
          Bal: {fmt(tx.balance_after)}
        </p>
        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md capitalize"
              style={{ background: tx.status === 'completed' ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
                       color:      tx.status === 'completed' ? '#22c55e'              : '#fbbf24' }}>
          {tx.status}
        </span>
      </div>
    </div>
  );
}

export default function WalletHistoryPage() {
  const navigate         = useNavigate();
  const { user }         = useStore();
  const [txs,    setTxs]    = useState<Tx[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [page,   setPage]   = useState(0);
  const [hasMore,setHasMore]= useState(true);
  const [loading,setLoading]= useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTxs = useCallback(async (pg: number, fil: Filter, reset = false) => {
    if (!user?.id) return;
    pg === 0 ? setLoading(true) : setLoadingMore(true);

    let query = supabase.from('wallet_transactions')
      .select('id,type,status,amount,description,created_at,balance_after')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(pg * PAGE, pg * PAGE + PAGE - 1);

    if (fil === 'credit') query = query.in('type', CREDIT);
    if (fil === 'debit')  query = query.not('type', 'in', `(${CREDIT.join(',')})`);

    const { data } = await query;
    const rows = data ?? [];

    setTxs(prev => reset ? rows : [...prev, ...rows]);
    setHasMore(rows.length === PAGE);
    pg === 0 ? setLoading(false) : setLoadingMore(false);
  }, [user?.id]);

  useEffect(() => {
    setPage(0);
    fetchTxs(0, filter, true);
  }, [filter, fetchTxs]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchTxs(next, filter);
  };

  const filters: { id: Filter; label: string }[] = [
    { id: 'all',    label: 'All'      },
    { id: 'credit', label: 'Credits'  },
    { id: 'debit',  label: 'Debits'   },
  ];

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
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary,#fff)' }}>Transaction History</h1>
        <button onClick={() => fetchTxs(0, filter, true)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">
          <RotateCcw size={15} style={{ color: 'var(--text-muted,#6b7280)' }} />
        </button>
      </div>

      <div className="px-4 pt-4 max-w-lg mx-auto space-y-4">

        {/* Filter tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: filter === f.id ? 'rgba(249,115,22,0.2)' : 'transparent',
                             color: filter === f.id ? '#f97316' : 'var(--text-muted,#6b7280)',
                             border: filter === f.id ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="rounded-2xl overflow-hidden px-4"
             style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3.5">
                  <div className="w-10 h-10 rounded-xl animate-pulse flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 rounded animate-pulse w-2/3" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-2.5 rounded animate-pulse w-1/3" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                </div>
              ))
            : txs.length === 0
              ? <div className="py-16 text-center">
                  <Inbox size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted,#6b7280)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted,#6b7280)' }}>No transactions yet</p>
                  <button onClick={() => navigate('/wallet/fund')}
                          className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold"
                          style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                    Fund Wallet
                  </button>
                </div>
              : txs.map((tx, i) => (
                  <div key={tx.id}>
                    <TxItem tx={tx} />
                    {i < txs.length - 1 && <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                  </div>
                ))
          }

          {/* Load more */}
          {!loading && hasMore && txs.length > 0 && (
            <div className="py-4 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <button onClick={loadMore} disabled={loadingMore}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-80 flex items-center gap-2 mx-auto"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary,#fff)' }}>
                {loadingMore ? <><RotateCcw size={13} className="animate-spin" /> Loading…</> : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
