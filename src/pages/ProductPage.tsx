import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { deliveryLabel, deliveryColor } from '@/lib/transformers';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const items = useStore(s => s.items);
  const addToCart = useStore(s => s.addToCart);
  const item = items.find(i => i.slug === slug);
  const [qty, setQty] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!item) {
    return (
      <div className="pt-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Product not found</h1>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  const related = items.filter(i => i.categoryId === item.categoryId && i.id !== item.id).slice(0, 4);
  const ownerClass = item.owner === 'ebube' ? 'owner-badge-ebube' : item.owner === 'bundu' ? 'owner-badge-bundu' : 'owner-badge-joint';
  const ownerLabel = item.owner.charAt(0).toUpperCase() + item.owner.slice(1);

  return (
    <div className="pt-16 pb-8">
      {/* Product Hero Image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
        <img src={item.image} alt={item.name} className={`w-full h-full object-cover transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--secondary)] via-transparent to-transparent" />
        <Link to={`/category/${item.categoryId}`}
          className="absolute top-4 left-4 p-2 rounded-full glass hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <span className={`absolute top-4 right-4 ${ownerClass}`}>{ownerLabel}</span>
        <span className={`absolute top-4 left-14 px-2 py-0.5 rounded-full text-xs font-medium ${deliveryColor(item.deliveryTime)}`}>
          {deliveryLabel(item.deliveryTime)}
        </span>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 -mt-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.name}</h1>
            <p className="font-mono text-2xl font-bold mb-4" style={{ color: 'var(--primary)' }}>
              N{item.price.toLocaleString()}
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <Link to={`/category/${item.categoryId}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
                {item.categoryName}
              </Link>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 p-1.5 rounded-xl" style={{ background: 'var(--surface)' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5">
                  <Minus size={16} />
                </button>
                <span className="font-mono text-lg w-8 text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(20, qty + 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={() => { addToCart(item, qty); }}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
                <ShoppingCart size={18} />
                Add to Cart - N{(item.price * qty).toLocaleString()}
              </button>
            </div>
          </div>

          {/* Related Items */}
          {related.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>You might also like</h3>
              <div className="space-y-3">
                {related.map(r => (
                  <Link key={r.id} to={`/product/${r.slug}`} className="card p-3 flex gap-3 group hover:-translate-y-0.5 transition-transform">
                    <img src={r.image} alt={r.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>{r.name}</h4>
                      <p className="font-mono text-sm mt-1" style={{ color: 'var(--primary)' }}>N{r.price.toLocaleString()}</p>
                      <span className={`text-[10px] inline-block mt-1 ${r.owner === 'ebube' ? 'owner-badge-ebube' : r.owner === 'bundu' ? 'owner-badge-bundu' : 'owner-badge-joint'}`}>
                        {r.owner.charAt(0).toUpperCase() + r.owner.slice(1)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
