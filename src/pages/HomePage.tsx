import HeroSlider from '@/components/home/HeroSlider';
import StatsBar from '@/components/home/StatsBar';
import CategoryScroll from '@/components/home/CategoryScroll';
import FeaturedSection from '@/components/home/FeaturedSection';
import AdBannerStrip from '@/components/home/AdBannerStrip';
import PopularItems from '@/components/home/PopularItems';
import TrustSection from '@/components/home/TrustSection';

export default function HomePage() {
  return (
    <div className="pb-6">
      <HeroSlider />
      <StatsBar />
      <CategoryScroll />
      <FeaturedSection />
      <AdBannerStrip />
      <PopularItems />
      <TrustSection />
    </div>
  );
}