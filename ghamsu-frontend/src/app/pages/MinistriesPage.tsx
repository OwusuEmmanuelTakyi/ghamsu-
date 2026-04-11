import { MinistriesSection } from "../components/sections/MinistriesSection";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

export function MinistriesPage() {
  return (
    <div className="min-h-screen pt-20">
      <PageHero
        title="Our Ministries"
        subtitle="Discover your calling and serve with your unique gifts and talents"
        image="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=1080&fit=crop"
      />
      <MinistriesSection />
      <Footer />
    </div>
  );
}
