import { SermonsSection } from "../components/sections/SermonsSection";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

export function SermonsPage() {
  return (
    <div className="min-h-screen pt-20">
      <PageHero
        title="Sermons & Messages"
        subtitle="Listen to powerful messages that transform lives and strengthen faith"
        image="https://images.unsplash.com/photo-1775846986164-8fbee9362ef5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      <SermonsSection />
      <Footer />
    </div>
  );
}
