import { HeroSection } from '../components/HeroSection';
import { FloatingServiceCards } from '../components/FloatingServiceCards';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { HistorySection } from '../components/HistorySection';
import { AboutSection } from '../components/AboutSection';
import { BoardsHomeSection } from '../components/BoardsHomeSection';
import { BlogPreviewSection } from '../components/BlogPreviewSection';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { DarkSection } from '../components/DarkSection';
import { StatsSection } from '../components/StatsSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FloatingServiceCards />
      <WhyChooseUs />
      <HistorySection />
      <AboutSection />
      <BoardsHomeSection />
      <BlogPreviewSection />
      <UpcomingEvents />
      <DarkSection />
      <StatsSection />
    </>
  );
}
