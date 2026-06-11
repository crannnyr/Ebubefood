import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const banners = useStore(s => s.banners);
  const siteSettings = useStore(s => s.siteSettings);

  const badge = siteSettings.hero_badge || 'HOT. FRESH. DELIVERED FAST.';
  const line1 = siteSettings.hero_title_line1 || 'Cravings';
  const line2 = siteSettings.hero_title_line2 || 'Delivered in';
  const highlight = siteSettings.hero_title_highlight || 'Minutes';
  const subtitle = siteSettings.hero_subtitle || 'Authentic Nigerian flavours. Freshly prepared. Delivered fast.';
  const ctaPrimary = siteSettings.hero_cta_primary || 'Order Now';
  const ctaSecondary = siteSettings.hero_cta_secondary || 'Explore Menu';

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setCurrent(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const bgImage = banners[current]?.mediaUrl || '/images/hero-banner.jpg';
  const targetValue = banners[current]?.targetValue || '';

  return (
    <section className="relative w-full overflow-hidden" style={{ height: 'clamp(480px, 70vh, 680px)' }}>
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="CBK Foods"
          className="w-full h-full object-cover transition-opacity duration-500"
          key={bgImage}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(15,15,26,0.92) 0%, rgba(15,15,26,0.5) 60%, rgba(15,15,26,0.2) 100%)'
        }} />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 max-w-[1400px] mx-auto">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {badge}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-extrabold leading-none mb-2" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
          <span style={{ color: 'var(--text-primary)' }}>{line1}</span>
          <br />
          <span style={{ color: 'var(--text-primary)' }}>{line2} </span>
          <span style={{
            color: 'var(--primary)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--primary)',
            textUnderlineOffset: '4px',
          }}>{highlight}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to={targetValue ? `/category/${targetValue}` : '/menu'}
            className="btn-primary flex items-center gap-2 py-3 px-6"
          >
            {ctaPrimary}
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/menu"
            className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <UtensilsCrossed size={16} />
            {ctaSecondary}
          </Link>
        </div>
      </div>

      {/* Slider controls */}
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
          <div className="absolute bottom-6 left-6 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i === current ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                  width: i === current ? 24 : 8,
                }} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}