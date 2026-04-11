import { GallerySection } from "../components/sections/GallerySection";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

export function GalleryPage() {
  return (
    <div className="min-h-screen pt-20">
      <PageHero
        title="Photo Gallery"
        subtitle="Explore moments from our events, worship services, and fellowship activities"
        image="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1920&h=1080&fit=crop"
      />
      <GallerySection />
      <Footer />
    </div>
  );
}
