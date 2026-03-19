import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { CategoriasSection } from '@/components/landing/CategoriasSection';
import { MentoresSection } from '@/components/landing/MentoresSection';
import { EventosSection } from '@/components/landing/EventosSection';
import { PorQueSection } from '@/components/landing/PorQueSection';
import { TestimoniosSection } from '@/components/landing/TestimoniosSection';
import { MembresiaSection } from '@/components/landing/MembresiaSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoriasSection />
      <MentoresSection />
      <EventosSection />
      <PorQueSection />
      <TestimoniosSection />
      <MembresiaSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
