import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';

export default function CategoryScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categories = useStore(s => s.categories);
  const isDataLoading = useStore(s => s.isDataLoading);

  return (
    <section className="py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
          What are you craving?
        </h2>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isDataLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="w-[72px] h-[72px] rounded-full skeleton-shimmer" />
                  <div className="w-14 h-3 rounded skeleton-shimmer" />
                </div>
              ))
            : categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-2 flex-shrink-0 snap-start group"
                >
                  <div
                    className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-110 group-hover:border-orange-500"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <span className="text-xs font-medium text-center whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {cat.name}
                  </span>
                  {cat.itemCount !== undefined && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {cat.itemCount} dishes
                    </span>
                  )}
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}