import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

export function TestimonialsPage() {
  return (
    <div className="min-h-screen pt-20">
      <PageHero
        title="Testimonials"
        subtitle="Hear from students whose lives have been transformed through GHAMSU"
        image="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1920&h=1080&fit=crop"
      />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
