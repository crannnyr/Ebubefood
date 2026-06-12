import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare, CheckCircle, Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

interface Review {
  id: string;
  item_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
  image_url: string | null;
}

interface PendingOrder {
  order_id: string;
  order_number: string;
  item_names: string;
  placed_at: string;
}

function StarRow({ value, onChange, readonly = false }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => !readonly && onChange?.(s)}
                disabled={readonly} className="transition-transform hover:scale-110">
          <Star size={readonly ? 14 : 22}
                fill={s <= value ? '#fbbf24' : 'none'}
                style={{ color: s <= value ? '#fbbf24' : 'rgba(255,255,255,0.2)' }} />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const PLACEHOLDER = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=100&h=100&fit=crop';
  return (
    <div className="rounded-2xl p-4"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 mb-3">
        <img src={review.image_url ?? PLACEHOLDER} alt={review.item_name}
             className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
             onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary,#F5F5F5)' }}>
            {review.item_name}
          </p>
          <StarRow value={review.rating} readonly />
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted,#6B6B8A)' }}>
            {new Date(review.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
      {review.comment && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary,#A0A0B8)' }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

function WriteReview({ order, onDone }: { order: PendingOrder; onDone: () => void }) {
  const { user } = useStore();
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating'); return; }
    if (!user?.id) return;
    setSaving(true); setError('');

    const { error: err } = await supabase.from('order_reviews').insert({
      user_id:    user.id,
      order_id:   order.order_id,
      rating,
      comment:    comment.trim() || null,
    });

    setSaving(false);
    if (err) { setError('Could not submit review. Please try again.'); return; }
    onDone();
  };

  return (
    <div className="rounded-2xl p-4 space-y-4"
         style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary,#F5F5F5)' }}>
          Order #{order.order_number}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted,#6B6B8A)' }}>
          {order.item_names}
        </p>
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted,#6B6B8A)' }}>Your rating</p>
        <StarRow value={rating} onChange={setRating} />
      </div>

      <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                placeholder="Tell us about your experience (optional)…"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                         color: 'var(--text-primary,#F5F5F5)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,107,53,0.5)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />

      {error && <p className="text-xs" style={{ color: 'var(--danger,#FF4757)' }}>{error}</p>}

      <div className="flex gap-3">
        <button onClick={onDone} className="flex-1 rounded-xl py-3 text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted,#6B6B8A)' }}>
          Skip
        </button>
        <button onClick={handleSubmit} disabled={saving || rating === 0}
                className="flex-1 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: rating > 0 ? 'var(--primary,#FF6B35)' : 'rgba(255,255,255,0.06)',
                         color: rating > 0 ? '#fff' : 'var(--text-muted,#6B6B8A)' }}>
          {saving ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const navigate           = useNavigate();
  const { user }           = useStore();
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [pending,  setPending]  = useState<PendingOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [activeWrite, setActiveWrite] = useState<string | null>(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);

    const [revRes, pendRes] = await Promise.all([
      // Reviews already submitted
      supabase.from('order_reviews')
        .select('id, rating, comment, created_at, items(name, image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Delivered orders not yet reviewed
      supabase.from('orders')
        .select('id, order_number, placed_at, order_items(item_name)')
        .eq('user_id', user.id)
        .eq('status', 'delivered')
        .not('id', 'in',
          `(SELECT order_id FROM order_reviews WHERE user_id = '${user.id}')`)
        .order('placed_at', { ascending: false })
        .limit(10),
    ]);

    setReviews((revRes.data ?? []).map((r: any) => ({
      id:         r.id,
      item_name:  r.items?.name ?? 'Item',
      rating:     r.rating,
      comment:    r.comment,
      created_at: r.created_at,
      image_url:  r.items?.image_url ?? null,
    })));

    setPending((pendRes.data ?? []).map((o: any) => ({
      order_id:    o.id,
      order_number: o.order_number ?? o.id.slice(0, 8).toUpperCase(),
      item_names:  (o.order_items ?? []).map((i: any) => i.item_name).join(', '),
      placed_at:   o.placed_at,
    })));

    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleReviewDone = (orderId: string) => {
    setPending(prev => prev.filter(p => p.order_id !== orderId));
    setActiveWrite(null);
    load(); // refresh reviews list
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary,var(--secondary,#1A1A2E))' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4"
           style={{ background: 'var(--bg-primary,var(--secondary,#1A1A2E))',
                    borderBottom: '1px solid var(--border,rgba(255,255,255,0.08))' }}>
        <button onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary,#F5F5F5)' }} />
        </button>
        <div>
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary,#F5F5F5)' }}>Reviews & Ratings</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted,#6B6B8A)' }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 max-w-lg mx-auto space-y-4">

        {/* Pending reviews */}
        {!loading && pending.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} style={{ color: 'var(--primary,#FF6B35)' }} />
              <p className="text-xs font-semibold uppercase tracking-wide"
                 style={{ color: 'var(--text-muted,#6B6B8A)' }}>
                Awaiting your review ({pending.length})
              </p>
            </div>
            {pending.map(order => (
              activeWrite === order.order_id
                ? <WriteReview key={order.order_id} order={order}
                               onDone={() => handleReviewDone(order.order_id)} />
                : <button key={order.order_id} onClick={() => setActiveWrite(order.order_id)}
                          className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all hover:opacity-90"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: 'rgba(255,107,53,0.12)' }}>
                      <Star size={16} style={{ color: 'var(--primary,#FF6B35)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary,#F5F5F5)' }}>
                        Order #{order.order_number}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted,#6B6B8A)' }}>
                        {order.item_names}
                      </p>
                    </div>
                    <span className="text-xs font-bold flex-shrink-0"
                          style={{ color: 'var(--primary,#FF6B35)' }}>Rate →</span>
                  </button>
            ))}
          </div>
        )}

        {/* Submitted reviews */}
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse"
                   style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))
          : reviews.length === 0 && pending.length === 0
            ? <div className="pt-20 text-center space-y-3">
                <Inbox size={44} className="mx-auto opacity-20" style={{ color: 'var(--text-muted,#6B6B8A)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted,#6B6B8A)' }}>
                  No reviews yet
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted,#6B6B8A)' }}>
                  Reviews appear here after your orders are delivered
                </p>
              </div>
            : reviews.length > 0 && (
                <div className="space-y-3">
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} style={{ color: '#22c55e' }} />
                      <p className="text-xs font-semibold uppercase tracking-wide"
                         style={{ color: 'var(--text-muted,#6B6B8A)' }}>
                        Your reviews
                      </p>
                    </div>
                  )}
                  {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                </div>
              )
        }
      </div>
    </div>
  );
}
