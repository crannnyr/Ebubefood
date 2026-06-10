import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, FileText, CreditCard, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface WalletData {
  balance: number;
}

const actions = [
  { icon: Plus,       label: 'Add Money',        color: '#f97316', path: '/wallet/fund'     },
  { icon: FileText,   label: 'Transactions',      color: '#60a5fa', path: '/wallet/history'  },
  { icon: CreditCard, label: 'Payment\nMethods',  color: '#22c55e', path: '/wallet/methods'  },
];

export default function WalletSection() {
  const navigate         = useNavigate();
  const { user }         = useStore();
  const [wallet, setWallet] = useState<WalletData | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => { if (data) setWallet(data); });
  }, [user?.id]);

  const balance = wallet?.balance ?? 0;

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
        <button
          onClick={() => navigate('/wallet')}
          className="w-full flex items-center justify-between mb-5 group"
        >
          <div className="flex items-center gap-2">
            <Wallet size={17} style={{ color: 'var(--primary, #f97316)' }} />
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary, #ffffff)' }}
            >
              My Wallet
            </span>
          </div>
          <ChevronRight
            size={17}
            className="transition-transform group-hover:translate-x-0.5"
            style={{ color: 'var(--text-muted, #6b7280)' }}
          />
        </button>

        {/* Balance + actions row */}
        <div className="flex items-center gap-4">

          {/* Balance */}
          <div className="flex-shrink-0">
            <p
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary, #ffffff)' }}
            >
              ₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: 'var(--text-muted, #6b7280)' }}
            >
              Wallet Balance
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-5">
            {actions.map(({ icon: Icon, label, color, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1.5 transition-opacity hover:opacity-75 active:scale-95"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}28`,
                  }}
                >
                  <Icon size={19} style={{ color }} />
                </div>
                <span
                  className="text-[9px] font-medium text-center leading-tight whitespace-pre-line"
                  style={{ color: 'var(--text-muted, #9ca3af)' }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
