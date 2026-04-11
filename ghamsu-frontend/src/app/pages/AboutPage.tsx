import { AboutSection } from "../components/sections/AboutSection";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

export function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      <PageHero
        title="About GHAMSU"
        subtitle="Ambassadors in unity and love"
        image="https://images.unsplash.com/photo-1775847086199-4a541ae87e46?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8Mnx8fGVufDB8fHx8fA%3D%3D"
      />
      <AboutSection />
      <Footer />
    </div>
  );
}
