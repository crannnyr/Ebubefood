import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { FoodItem } from '@/types';
import FoodCard from '@/components/FoodCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const categories = useStore(s => s.categories);
  const storeItems = useStore(s => s.items);
  const category = categories.find(c => c.slug === slug);
  const items = category ? storeItems.filter(i => i.categoryId === category.id) : [];
  const [filter, setFilter] = useState<'all' | 'instant' | '2_hours' | '6_hours' | '24_hours' | '3_days' | '1_week'>('all');
  const [sort, setSort] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');

  const filtered: FoodItem[] = items
    .filter(i => filter === 'all' || i.deliveryTime === filter)
    .sort((a, b) => {
      switch (sort) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'newest': return (b.createdAt || '').localeCompare(a.createdAt || '');
        default: return 0;
      }
    });

  if (!category) {
    return (
      <div className="pt-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Category not found</h1>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{category.name}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{filtered.length} items</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: 'all' as const, label: 'All' },
              { key: 'instant' as const, label: 'Instant' },
              { key: '2_hours' as const, label: '2 Hours' },
              { key: '6_hours' as const, label: '6 Hours' },
              { key: '24_hours' as const, label: '24 Hours' },
              { key: '3_days' as const, label: '3 Days' },
              { key: '1_week' as const, label: '1 Week' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  background: filter === f.key ? 'var(--primary)' : 'var(--surface)',
                  color: filter === f.key ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${filter === f.key ? 'var(--primary)' : 'var(--border)'}`,
                }}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              className="input-field py-2 text-sm pr-8" style={{ background: 'var(--surface)' }}>
              <option value="popular">Popular</option>
              <option value="price-low">Price: Low - High</option>
              <option value="price-high">Price: High - Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => <FoodCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>No items found</p>
            <button onClick={() => setFilter('all')} className="btn-primary">View All Items</button>
          </div>
        )}
      </div>
    </div>
  );
}
