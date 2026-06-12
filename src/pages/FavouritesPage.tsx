import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

interface FavItem {
  item_name: string;
  total_ordered: number;
  item_id: string | null;
  image_url: string | null;
  price: number | null;
  slug: string | null;
  average_rating: number | null;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop';

export default function FavouritesPage() {
  const navigate     = useNavigate();
  const { user }     = useStore();
  const [items, setItems]   = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    /* Pull from the user_favourite_meal view + join items for image/price */
    supabase
      .from('user_favourite_meal')
      .select(`
        item_name,
        total_ordered,
        items!inner (
          id, image_url, price, slug, average_rating
        )
      `)
      .eq('user_id', user.id)
      .order('total_ordered', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        const mapped: FavItem[] = (data ?? []).map((row: any) => ({
          item_name:      row.item_name,
          total_ordered:  row.total_ordered,
          item_id:        row.items?.id ?? null,
          image_url:      row.items?.image_url ?? null,
          price:          row.items?.price ?? null,
          slug:           row.items?.slug ?? null,
          average_rating: row.items?.average_rating ?? null,
        }));
        setItems(mapped);
        setLoading(false);
      });
  }, [user?.id]);

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
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary,#fff)' }}>Favourite Meals</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted,#6b7280)' }}>Based on your order history</p>
        </div>
      </div>

      <div className="px-4 pt-4 max-w-lg mx-auto space-y-3">

        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))
          : items.length === 0
            ? <div className="pt-20 text-center space-y-3">
                <Heart size={44} className="mx-auto opacity-20" style={{ color: '#ef4444' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted,#6b7280)' }}>
                  No favourites yet
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted,#6b7280)' }}>
                  Your most ordered meals will appear here
                </p>
                <button onClick={() => navigate('/')}
                        className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                  Browse Menu
                </button>
              </div>
            : items.map((item, i) => (
                <div key={item.item_name}
                     className="rounded-2xl p-4 flex items-center gap-4 transition-all hover:opacity-95"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>

                  {/* Rank */}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                       style={{ background: i < 3 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)',
                                color:      i < 3 ? '#f97316'                : 'var(--text-muted,#6b7280)' }}>
                    {i + 1}
                  </div>

                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                       style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <img src={item.image_url ?? PLACEHOLDER} alt={item.item_name}
                         className="w-full h-full object-cover"
                         onError={e => { e.currentTarget.src = PLACEHOLDER; }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary,#fff)' }}>
                      {item.item_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {item.average_rating && (
                        <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#fbbf24' }}>
                          <Star size={9} fill="#fbbf24" /> {item.average_rating.toFixed(1)}
                        </span>
                      )}
                      <span className="text-[10px]" style={{ color: 'var(--text-muted,#6b7280)' }}>
                        Ordered {item.total_ordered}×
                      </span>
                      {item.price && (
                        <span className="text-[10px] font-bold" style={{ color: '#f97316' }}>
                          ₦{item.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order again */}
                  {item.slug && (
                    <button onClick={() => navigate(`/item/${item.slug}`)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
                            style={{ background: 'rgba(249,115,22,0.15)' }}
                            aria-label="Order again">
                      <ShoppingCart size={16} style={{ color: '#f97316' }} />
                    </button>
                  )}
                </div>
              ))
        }
      </div>
    </div>
  );
}
