import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import FoodCard from '@/components/FoodCard';
import SkeletonCard from '@/components/SkeletonCard';

export default function FeaturedSection() {
  const isDataLoading = useStore(s => s.isDataLoading);
  const featuredItems = useStore(s => s.featuredItems);
  const categories = useStore(s => s.categories);

  if (!isDataLoading && featuredItems.length === 0) return null;

  return (
    <section className="py-6 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>✨ Recommended For You</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Based on what's trending tonight</p>
          </div>
          {categories.length > 0 && (
            <Link to="/menu" className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--primary)' }}>
              See all →
            </Link>
          )}
        </div>
        {isDataLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {featuredItems.map(item => <FoodCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </section>
  );
}