import { EventsSection } from "../components/sections/EventsSection";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

export function EventsPage() {
  return (
    <div className="min-h-screen pt-20">
      <PageHero
        title="Events & Programs"
        subtitle="Join us for inspiring events, conferences, and fellowship gatherings"
        image="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop"
      />
      <EventsSection />
      <Footer />
    </div>
  );
}
