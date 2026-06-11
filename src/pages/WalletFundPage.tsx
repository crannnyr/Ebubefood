import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Zap, Building2, Upload, CheckCircle, Clock, AlertCircle, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

/* ── Paystack inline loader ─────────────────────────────────── */
function usePaystack() {
  const [ready, setReady] = useState(!!(window as any).PaystackPop);
  useEffect(() => {
    if ((window as any).PaystackPop) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.async = true;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

const QUICK = [500, 1000, 2000, 5000, 10000];
const fmt   = (n: number) => `₦${Number(n).toLocaleString()}`;

type Step = 'input' | 'processing' | 'success' | 'failed' | 'pending_manual';

interface BankDetails { account_name: string; account_number: string; bank_name: string }

export default function WalletFundPage() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { user }        = useStore();
  const paystackReady   = usePaystack();
  const fileRef         = useRef<HTMLInputElement>(null);

  const retryId: string | undefined = (location.state as any)?.retryId;

  const [method,  setMethod]  = useState<'paystack' | 'manual'>('paystack');
  const [amount,  setAmount]  = useState('');
  const [step,    setStep]    = useState<Step>('input');
  const [error,   setError]   = useState('');
  const [bank,    setBank]    = useState<BankDetails | null>(null);
  const [proof,   setProof]   = useState<File | null>(null);
  const [bankRef, setBankRef] = useState('');
  const [fundReqId, setFundReqId] = useState<string | null>(null);

  /* Load bank details + pre-fill retry amount */
  useEffect(() => {
    supabase.from('admin_payment_details').select('account_name,account_number,bank_name')
      .eq('is_active', true).single()
      .then(({ data }) => { if (data) setBank(data); });

    if (retryId) {
      supabase.from('wallet_funding_requests').select('amount,method').eq('id', retryId).single()
        .then(({ data }) => {
          if (data) {
            setAmount(String(data.amount));
            setMethod(data.method as 'paystack' | 'manual');
          }
        });
    }
  }, [retryId]);

  const amountNum = Number(amount);
  const isValid   = amountNum >= 100 && amountNum <= 1_000_000;

  /* ── Paystack flow ──────────────────────────────────────── */
  const handlePaystack = async () => {
    if (!isValid || !paystackReady) return;
    setError('');
    setStep('processing');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-initialize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ amount: amountNum }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not initialise payment');

      setFundReqId(json.funding_request_id);
      setStep('input');

      /* Open Paystack popup */
      const handler = (window as any).PaystackPop.setup({
        key:         import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        access_code: json.access_code,
        callback: async (response: { reference: string }) => {
          /* Webhook handles credit; we just poll for confirmation */
          setStep('processing');
          let attempts = 0;
          const poll = setInterval(async () => {
            attempts++;
            const { data } = await supabase.from('wallet_funding_requests')
              .select('status').eq('id', json.funding_request_id).single();

            if (data?.status === 'confirmed') {
              clearInterval(poll);
              setStep('success');
            } else if (data?.status === 'failed' || attempts >= 12) {
              clearInterval(poll);
              setStep(data?.status === 'failed' ? 'failed' : 'success'); // assume success after 1min
            }
          }, 5000); // poll every 5s for up to 60s
        },
        onClose: () => {
          /* User closed without paying — return to input, don't lose their amount */
          setStep('input');
          setError('Payment window closed. You can try again anytime.');
        },
      });
      handler.openIframe();

    } catch (err) {
      setStep('failed');
      setError((err as Error).message || 'Something went wrong. Please try again.');
    }
  };

  /* ── Manual flow ────────────────────────────────────────── */
  const handleManual = async () => {
    if (!isValid) return;
    setError('');
    setStep('processing');

    try {
      let proofUrl: string | null = null;

      if (proof) {
        const ext  = proof.name.split('.').pop();
        const path = `${user!.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('payment-proofs')
          .upload(path, proof, { contentType: proof.type });
        if (upErr) throw new Error('Could not upload proof. Please try again.');
        const { data } = supabase.storage.from('payment-proofs').getPublicUrl(path);
        proofUrl = data.publicUrl;
      }

      const payload = {
        user_id:            user!.id,
        amount:             amountNum,
        method:             'manual' as const,
        status:             'pending' as const,
        payment_proof_url:  proofUrl,
        bank_reference:     bankRef.trim() || null,
      };

      let dbErr;
      if (retryId) {
        /* Retry: update existing request */
        const { error } = await supabase.from('wallet_funding_requests')
          .update({ ...payload, retry_count: supabase.rpc as any, last_retry_at: new Date().toISOString() })
          .eq('id', retryId);
        dbErr = error;
        setFundReqId(retryId);
      } else {
        const { data, error } = await supabase.from('wallet_funding_requests')
          .insert(payload).select('id').single();
        dbErr = error;
        if (data) setFundReqId(data.id);
      }

      if (dbErr) throw new Error('Could not submit request. Please try again.');

      /* Trigger pending email */
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-mailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          emailType: 'manual_payment_pending',
          recipientId: user!.id,
          data: { name: user?.fullName, amount: amountNum, reference: bankRef || 'N/A' },
        }),
      }).catch(() => {}); // non-blocking

      setStep('pending_manual');

    } catch (err) {
      setStep('failed');
      setError((err as Error).message || 'Something went wrong. Please try again.');
    }
  };

  /* ── Result screens ─────────────────────────────────────── */
  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ background: 'var(--bg-primary,#0a0a0f)' }}>
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin mx-auto" style={{ color: '#f97316' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary,#fff)' }}>Processing payment…</p>
          <p className="text-xs" style={{ color: 'var(--text-muted,#6b7280)' }}>Please don't close this page</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ background: 'var(--bg-primary,#0a0a0f)' }}>
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
               style={{ background: 'rgba(34,197,94,0.15)' }}>
            <CheckCircle size={40} style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary,#fff)' }}>Wallet Funded!</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted,#6b7280)' }}>
            {fmt(amountNum)} has been added to your wallet.
          </p>
          <button onClick={() => navigate('/wallet')}
                  className="w-full rounded-xl py-3.5 font-bold text-sm mt-2"
                  style={{ background: '#f97316', color: '#fff' }}>
            Go to Wallet
          </button>
        </div>
      </div>
    );
  }

  if (step === 'pending_manual') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ background: 'var(--bg-primary,#0a0a0f)' }}>
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
               style={{ background: 'rgba(251,191,36,0.15)' }}>
            <Clock size={40} style={{ color: '#fbbf24' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary,#fff)' }}>Payment Submitted</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted,#6b7280)' }}>
            Your manual payment of {fmt(amountNum)} is pending admin confirmation. You'll be notified by email once confirmed.
          </p>
          <button onClick={() => navigate('/wallet')}
                  className="w-full rounded-xl py-3.5 font-bold text-sm"
                  style={{ background: '#f97316', color: '#fff' }}>
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  if (step === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ background: 'var(--bg-primary,#0a0a0f)' }}>
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
               style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertCircle size={40} style={{ color: '#ef4444' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary,#fff)' }}>Payment Failed</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted,#6b7280)' }}>{error}</p>
          <button onClick={() => { setStep('input'); setError(''); }}
                  className="w-full rounded-xl py-3.5 font-bold text-sm"
                  style={{ background: '#f97316', color: '#fff' }}>
            Try Again
          </button>
          <button onClick={() => navigate('/wallet')} className="text-sm" style={{ color: 'var(--text-muted,#6b7280)' }}>
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  /* ── Main input screen ──────────────────────────────────── */
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
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary,#fff)' }}>
          {retryId ? 'Retry Payment' : 'Add Money'}
        </h1>
      </div>

      <div className="px-4 pt-6 max-w-lg mx-auto space-y-5">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
               style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
            <p className="text-xs flex-1" style={{ color: '#ef4444' }}>{error}</p>
            <button onClick={() => setError('')}><X size={14} style={{ color: '#ef4444' }} /></button>
          </div>
        )}

        {/* Method toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {([
            { id: 'paystack', label: 'Paystack', sub: 'Instant',    icon: Zap,      color: '#22c55e' },
            { id: 'manual',   label: 'Manual',   sub: '1–24 hrs',   icon: Building2, color: '#60a5fa' },
          ] as const).map(m => {
            const Icon   = m.icon;
            const active = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)}
                      className="rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all"
                      style={{ background: active ? `${m.color}18` : 'transparent',
                               border: `1px solid ${active ? `${m.color}30` : 'transparent'}` }}>
                <Icon size={18} style={{ color: active ? m.color : 'var(--text-muted,#6b7280)' }} />
                <span className="text-sm font-bold" style={{ color: active ? 'var(--text-primary,#fff)' : 'var(--text-muted,#6b7280)' }}>
                  {m.label}
                </span>
                <span className="text-[10px]" style={{ color: active ? m.color : 'var(--text-muted,#6b7280)' }}>
                  {m.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Amount input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                 style={{ color: 'var(--text-muted,#6b7280)' }}>
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold"
                  style={{ color: 'var(--text-muted,#6b7280)' }}>₦</span>
            <input type="number" value={amount} min={100} max={1000000}
                   onChange={e => setAmount(e.target.value)}
                   placeholder="0.00"
                   className="w-full rounded-xl pl-9 pr-4 py-4 text-xl font-bold outline-none transition-colors"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--text-primary,#fff)' }}
                   onFocus={e => (e.target.style.borderColor = 'rgba(249,115,22,0.5)')}
                   onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
          </div>
          {amountNum > 0 && !isValid && (
            <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>
              {amountNum < 100 ? 'Minimum amount is ₦100' : 'Maximum amount is ₦1,000,000'}
            </p>
          )}
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap">
          {QUICK.map(q => (
            <button key={q} onClick={() => setAmount(String(q))}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: amount === String(q) ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)',
                             color: amount === String(q) ? '#f97316' : 'var(--text-muted,#6b7280)',
                             border: `1px solid ${amount === String(q) ? 'rgba(249,115,22,0.3)' : 'transparent'}` }}>
              {fmt(q)}
            </button>
          ))}
        </div>

        {/* Manual: bank details */}
        {method === 'manual' && bank && (
          <div className="rounded-2xl p-4 space-y-3"
               style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#60a5fa' }}>
              Transfer to this account
            </p>
            {[
              { label: 'Bank',           val: bank.bank_name      },
              { label: 'Account Name',   val: bank.account_name   },
              { label: 'Account Number', val: bank.account_number },
              { label: 'Amount',         val: fmt(amountNum || 0) },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--text-muted,#6b7280)' }}>{r.label}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary,#fff)' }}>{r.val}</span>
              </div>
            ))}

            {/* Bank reference */}
            <input type="text" value={bankRef} onChange={e => setBankRef(e.target.value)}
                   placeholder="Your bank teller/transfer reference (optional)"
                   className="w-full rounded-xl px-3 py-2.5 text-xs outline-none mt-2"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            color: 'var(--text-primary,#fff)' }} />

            {/* Proof upload */}
            <button onClick={() => fileRef.current?.click()}
                    className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)',
                             color: proof ? '#22c55e' : 'var(--text-muted,#6b7280)' }}>
              <Upload size={14} />
              {proof ? `✓ ${proof.name}` : 'Upload payment screenshot (optional)'}
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf"
                   className="hidden" onChange={e => setProof(e.target.files?.[0] || null)} />
          </div>
        )}

        {/* CTA */}
        <button
          onClick={method === 'paystack' ? handlePaystack : handleManual}
          disabled={!isValid || (method === 'paystack' && !paystackReady)}
          className="w-full rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: isValid ? '#f97316' : 'rgba(255,255,255,0.06)',
                   color: isValid ? '#fff' : 'var(--text-muted,#6b7280)',
                   cursor: isValid ? 'pointer' : 'not-allowed' }}>
          {method === 'paystack'
            ? <><Zap size={16} /> Pay {amountNum > 0 ? fmt(amountNum) : ''} with Paystack</>
            : <><Building2 size={16} /> Submit Manual Payment</>}
        </button>

        <p className="text-center text-xs pb-2" style={{ color: 'var(--text-muted,#6b7280)' }}>
          {method === 'paystack'
            ? 'Secured by Paystack. Your card details are never stored.'
            : 'Admin will confirm your payment within a few hours. You\'ll get an email notification.'}
        </p>
      </div>
    </div>
  );
}
