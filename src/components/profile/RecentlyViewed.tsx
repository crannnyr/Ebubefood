import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

interface RecentItem {
  id: string;
  name: string;
  price: number;
  average_rating: number | null;
  image_url: string | null;
  slug: string;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop';

export default function RecentlyViewed() {
  const { user }    = useStore();
  const [items, setItems]       = useState<RecentItem[]>([]);
  const [liked, setLiked]       = useState<Set<string>>(new Set());
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    /* Pull last 10 distinct items from orders → order_items for this user */
    supabase
      .from('order_items')
      .select(`
        item_id,
        items (
          id, name, price, average_rating, image_url, slug
        )
      `)
      .eq('orders.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }

        /* Deduplicate by item id, keep first 8 */
        const seen  = new Set<string>();
        const deduped: RecentItem[] = [];
        for (const row of data) {
          const item = (row as any).items as RecentItem | null;
          if (item && !seen.has(item.id)) {
            seen.add(item.id);
            deduped.push(item);
            if (deduped.length === 8) break;
          }
        }
        setItems(deduped);
        setLoading(false);
      });
  }, [user?.id]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="max-w-[1400px] mx-auto">

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-base font-bold"
            style={{ color: 'var(--text-primary, #ffffff)' }}
          >
            Recently Viewed
          </h2>
          <Link
            to="/recently-viewed"
            className="flex items-center gap-0.5 text-xs font-medium transition-opacity hover:opacity-75"
            style={{ color: 'var(--primary, #f97316)' }}
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? /* Skeleton cards */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[140px] snap-start">
                  <div
                    className="rounded-2xl aspect-square mb-2 animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                  <div className="h-3 rounded mb-1.5 animate-pulse w-3/4"
                       style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-3 rounded animate-pulse w-1/2"
                       style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
              ))
            : items.map((item) => (
                <Link
                  key={item.id}
                  to={`/item/${item.slug}`}
                  className="flex-shrink-0 w-[140px] snap-start group"
                >
                  {/* Image */}
                  <div
                    className="relative rounded-2xl overflow-hidden mb-2"
                    style={{
                      aspectRatio: '1 / 1',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <img
                      src={item.image_url ?? PLACEHOLDER}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                    />

                    {/* Heart */}
                    <button
                      onClick={(e) => toggleLike(item.id, e)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
                      aria-label="Toggle favourite"
                    >
                      <Heart
                        size={13}
                        fill={liked.has(item.id) ? '#ef4444' : 'none'}
                        style={{ color: liked.has(item.id) ? '#ef4444' : '#ffffff' }}
                      />
                    </button>

                    {/* Rating pill */}
                    {item.average_rating != null && (
                      <div
                        className="absolute bottom-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                      >
                        <Star size={9} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                        <span className="text-[9px] font-bold" style={{ color: '#fbbf24' }}>
                          {item.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3
                    className="text-xs font-semibold mb-0.5 truncate"
                    style={{ color: 'var(--text-primary, #ffffff)' }}
                  >
                    {item.name}
                  </h3>

                  {/* Price */}
                  <p
                    className="text-xs font-bold"
                    style={{ color: 'var(--primary, #f97316)' }}
                  >
                    ₦{item.price.toLocaleString()}
                  </p>
                </Link>
              ))
          }
        </div>
      </div>
    </section>
  );
}
