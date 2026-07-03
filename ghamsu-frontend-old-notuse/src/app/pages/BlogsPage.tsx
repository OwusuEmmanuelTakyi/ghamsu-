import { BlogsSection } from "../components/sections/BlogsSection";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

export function BlogsPage() {
  return (
    <div className="min-h-screen pt-20">
      <PageHero
        title="Articles & Insights"
        subtitle="Read inspiring articles, devotionals, and testimonies from our community"
        image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop"
      />
      <BlogsSection />
      <Footer />
    </div>
  );
}
