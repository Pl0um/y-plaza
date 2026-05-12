import Hero             from '../components/Hero';
import PropertyCarousel from '../components/PropertyCarousel';
import AboutSection     from '../components/AboutSection';
import AgencyMap        from '../components/AgencyMap';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PropertyCarousel />
      <AboutSection />
      <AgencyMap />
    </>
  );
}
