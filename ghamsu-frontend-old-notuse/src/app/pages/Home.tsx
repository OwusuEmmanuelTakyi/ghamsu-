import { HeroSection } from "../components/sections/HeroSection";
import { GhamsuToday } from "../components/sections/GhamsuToday";
import { AboutPreview } from "../components/sections/previews/AboutPreview";
import { BlogsPreview } from "../components/sections/previews/BlogsPreview";
import { EventsPreview } from "../components/sections/previews/EventsPreview";
import { SermonsPreview } from "../components/sections/previews/SermonsPreview";
import { GalleryPreview } from "../components/sections/previews/GalleryPreview";
import { TestimonialsPreview } from "../components/sections/previews/TestimonialsPreview";
import { JoinSection } from "../components/sections/JoinSection";
import { Footer } from "../components/Footer";

export function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <GhamsuToday />
      <AboutPreview />
      <EventsPreview />
      <BlogsPreview />
      <SermonsPreview />
      <GalleryPreview />
      <TestimonialsPreview />
      <JoinSection />
      <Footer />
    </div>
  );
}