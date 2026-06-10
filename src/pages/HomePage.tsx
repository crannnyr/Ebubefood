import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Leaf, Clock, Tag, Heart, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import FoodCard from '@/components/FoodCard';
import SkeletonCard from '@/components/SkeletonCard';

/* ============ Hero Slider ============ */
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const banners = useStore(s => s.banners);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setCurrent(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-banner.jpg" alt="CBK Foods" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,15,26,0.95) 0%, rgba(15,15,26,0.4) 50%, rgba(15,15,26,0.2) 100%)' }} />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-extrabold leading-tight mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-primary)' }}>
            Craving Something Delicious?
          </h1>
          <p className="text-base md:text-lg mb-6 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Order now and get it delivered fast
          </p>
          <Link to="/" className="btn-primary flex items-center gap-2">
            Order Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    );
  }

  const banner = banners[current];

  return (
    <section className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        <img src={banner.mediaUrl} alt={banner.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,15,26,0.95) 0%, rgba(15,15,26,0.4) 50%, rgba(15,15,26,0.2) 100%)' }} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-extrabold leading-tight mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-primary)' }}>
          {banner.title}
        </h1>
        <p className="text-base md:text-lg mb-6 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
          {banner.subtitle}
        </p>
        <Link to={`/category/${banner.targetValue}`} className="btn-primary flex items-center gap-2">
          Order Now
          <ArrowRight size={18} />
        </Link>
      </div>
      {banners.length > 1 && (
        <>
          <button onClick={() => setCurrent(p => (p - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrent(p => (p + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-white/10 transition-colors">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === current ? 'var(--primary)' : 'rgba(255,255,255,0.3)', width: i === current ? 24 : 8 }} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ============ Categories ============ */
function CategoryGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const categories = useStore(s => s.categories);
  const isDataLoading = useStore(s => s.isDataLoading);

  return (
    <section className="py-10 px-4">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>What are you craving?</h2>
        <div ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {isDataLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full skeleton-shimmer" />
                <div className="w-12 h-3 rounded skeleton-shimmer" />
              </div>
            ))
          ) : categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 snap-start group"
            >
              <div className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-105"
                style={{ borderColor: 'var(--border)' }}>
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <span className="text-xs font-medium text-center whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Featured Items ============ */
function FeaturedSection() {
  const isDataLoading = useStore(s => s.isDataLoading);
  const featuredItems = useStore(s => s.featuredItems);
  const categories = useStore(s => s.categories);

  return (
    <section className="py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Today's Specials</h2>
          {categories.length > 0 && (
            <Link to={`/category/${categories[0].slug}`} className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--primary)' }}>
              View All
            </Link>
          )}
        </div>
        {isDataLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredItems.map(item => <FoodCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No featured items available right now.</p>
        )}
      </div>
    </section>
  );
}

/* ============ Ad Banner ============ */
function AdBannerSection() {
  return (
    <section className="py-6 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative rounded-xl overflow-hidden aspect-[3/1] min-h-[120px]">
          <img src="/images/ad-placeholder.jpg" alt="Advertise" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Link to="/ads" className="btn-primary text-sm">
              Advertise With Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ Popular Items ============ */
function PopularItems() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const items = useStore(s => s.items);
  const isDataLoading = useStore(s => s.isDataLoading);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="menu" className="py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Popular Items</h2>
        {isDataLoading || !visible ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.slice(0, 8).map(item => <FoodCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No items available right now.</p>
        )}
      </div>
    </section>
  );
}

/* ============ Trust Section ============ */
function TrustSection() {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  const features = [
    { icon: Leaf, title: 'Fresh Ingredients', desc: 'We source only the freshest local ingredients for every dish.', target: 100 },
    { icon: Clock, title: 'Fast Delivery', desc: 'Hot food at your doorstep in 30 minutes or less.', target: 30 },
    { icon: Tag, title: 'Affordable Prices', desc: 'Premium quality food that won\'t break the bank.', target: 500 },
    { icon: Heart, title: 'Made with Love', desc: 'Every dish is prepared with care and passion.', target: 1000 },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 2000;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCounts(features.map(f => Math.round(f.target * eased)));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [features]);

  return (
    <section ref={sectionRef} className="py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>Why Choose CBK Foods?</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card p-6 text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--primary-light)' }}>
                <f.icon size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              <span className="font-mono text-lg font-bold" style={{ color: 'var(--primary)' }}>
                {counts[i]}+
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Home Page ============ */
export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <CategoryGrid />
      <FeaturedSection />
      <AdBannerSection />
      <PopularItems />
      <TrustSection />
    </div>
  );
}
