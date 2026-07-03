import { ContactExecutivesSection } from "../components/sections/ContactExecutivesSection";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

export function ContactPage() {
  return (
    <div className="min-h-screen pt-20">
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with our team or reach out to our executive council"
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=1080&fit=crop"
      />
      <ContactExecutivesSection />
      <Footer />
    </div>
  );
}
