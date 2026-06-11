import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Plus } from 'lucide-react';
import type { FoodItem } from '@/types';
import { Link } from 'react-router-dom';

export default function MenuPage() {
  const { categories, items, featuredItems, isDataLoading, addToCart } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredFading, setFeaturedFading] = useState(false);

  const tabs = [{ id: 'all', name: 'All' }, ...categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))];

  const filteredItems: FoodItem[] = activeTab === 'all'
    ? items
    : items.filter(i => i.categoryId === activeTab);

  const tabFeatured: FoodItem[] = activeTab === 'all'
    ? featuredItems
    : items.filter(i => i.categoryId === activeTab && i.isFeatured);

  const featured = tabFeatured[featuredIndex] ?? tabFeatured[0] ?? filteredItems[0];

  // Auto-rotate featured
  useEffect(() => {
    if (tabFeatured.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedFading(true);
      setTimeout(() => {
        setFeaturedIndex(p => (p + 1) % tabFeatured.length);
        setFeaturedFading(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [tabFeatured.length, activeTab]);

  // Reset featured index when tab changes
  function switchTab(tabId: string) {
    setFeaturedFading(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setFeaturedIndex(0);
      setFeaturedFading(false);
    }, 200);
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--secondary)' }}>
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2 max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Our Menu</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {filteredItems.length} items available
        </p>
      </div>

      {/* Sticky Category Tabs */}
      <div className="sticky top-[56px] z-30 px-4 py-3"
        style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-[1400px] mx-auto"
          style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.id ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 max-w-[1400px] mx-auto">

        {/* Featured Card */}
        {!isDataLoading && featured && (
          <div className="mt-4 mb-6">
            <div
              className="relative rounded-2xl overflow-hidden transition-opacity duration-300"
              style={{ opacity: featuredFading ? 0 : 1, aspectRatio: '16/7' }}
            >
              <img
                src={featured.image}
                alt={featured.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, rgba(15,15,26,0.95) 40%, rgba(15,15,26,0.2) 100%)' }} />
              <div className="absolute inset-0 flex flex-col justify-center px-5">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full w-fit"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  ✦ FEATURED
                </span>
                <h2 className="font-extrabold text-lg md:text-2xl leading-tight mb-1"
                  style={{ color: 'var(--text-primary)' }}>
                  {featured.name}
                </h2>
                <p className="text-xs mb-3 max-w-[200px] line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}>
                  {featured.description}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-base" style={{ color: 'var(--primary)' }}>
                    ₦{featured.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addToCart(featured)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white"
                    style={{ background: 'var(--primary)' }}
                  >
                    <Plus size={14} /> Order Now
                  </button>
                </div>
              </div>

              {/* Featured dots if multiple */}
              {tabFeatured.length > 1 && (
                <div className="absolute bottom-3 right-4 flex gap-1.5">
                  {tabFeatured.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setFeaturedFading(true); setTimeout(() => { setFeaturedIndex(i); setFeaturedFading(false); }, 200); }}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === featuredIndex ? 16 : 6,
                        height: 6,
                        background: i === featuredIndex ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* List */}
        {isDataLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
                <div className="w-16 h-16 rounded-xl skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded skeleton-shimmer" />
                  <div className="h-3 w-48 rounded skeleton-shimmer" />
                  <div className="h-4 w-16 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
            No items in this category yet.
          </p>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => (
              <div key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                
                {/* Image */}
                <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = '/images/placeholder-food.jpg'; }}
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                    {item.description}
                  </p>
                  <span className="font-mono font-bold text-sm mt-1 block" style={{ color: 'var(--primary)' }}>
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>

                {/* Add button */}
                <button
                  onClick={() => addToCart(item)}
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                  style={{ background: 'var(--primary)' }}
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}