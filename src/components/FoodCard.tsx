import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { FoodItem } from '@/types';
import { useStore } from '@/store/useStore';
import { deliveryLabel, deliveryColor } from '@/lib/transformers';

interface Props {
  item: FoodItem;
}

export default function FoodCard({ item }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const addToCart = useStore(s => s.addToCart);

  const ownerClass = item.owner === 'ebube' ? 'owner-badge-ebube' : item.owner === 'bundu' ? 'owner-badge-bundu' : 'owner-badge-joint';
  const ownerLabel = item.owner.charAt(0).toUpperCase() + item.owner.slice(1);

  return (
    <div className="card group overflow-hidden">
      {/* Image */}
      <Link to={`/product/${item.slug}`} className="block relative aspect-[4/3] overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        {/* Delivery badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${deliveryColor(item.deliveryTime)}`}>
          {deliveryLabel(item.deliveryTime)}
        </span>
        {/* Owner badge */}
        <span className={`absolute top-2 right-2 ${ownerClass}`}>
          {ownerLabel}
        </span>
      </Link>

      {/* Content */}
      <div className="p-3">
        <Link to={`/product/${item.slug}`}>
          <h3 className="font-semibold text-sm truncate group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>
            {item.name}
          </h3>
        </Link>
        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono font-bold text-sm" style={{ color: 'var(--primary)' }}>
            N{item.price.toLocaleString()}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(item); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: 'var(--primary)' }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
