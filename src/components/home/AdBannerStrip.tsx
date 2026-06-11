import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';

export default function AdBannerStrip() {
  const ads = useStore(s => s.ads);
  const [current, setCurrent] = useState(0);
  const activeAds = ads.filter(a => a.status === 'active' && a.mediaUrl);

  useEffect(() => {
    if (activeAds.length <= 1) return;
    const interval = setInterval(() => setCurrent(p => (p + 1) % activeAds.length), 6000);
    return () => clearInterval(interval);
  }, [activeAds.length]);

  return (
    <section className="py-4 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/1', minHeight: 110 }}>
          {activeAds.length > 0 ? (
            <>
              <img
                src={activeAds[current]?.mediaUrl}
                alt="Advertisement"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </>
          ) : (
            <>
              <img src="/images/ad-placeholder.jpg" alt="Advertise" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 gap-2">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Advertise Your Business Here</p>
                <Link to="/ads" className="btn-primary text-xs py-2 px-4">Advertise With Us</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}