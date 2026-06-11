import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import FoodCard from '@/components/FoodCard';
import SkeletonCard from '@/components/SkeletonCard';

export default function PopularItems() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const items = useStore(s => s.items);
  const isDataLoading = useStore(s => s.isDataLoading);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="menu" className="py-6 px-4">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>🔥 Popular Items</h2>
        {isDataLoading || !visible ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.slice(0, 8).map(item => <FoodCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No items available right now.</p>
        )}
      </div>
    </section>
  );
}