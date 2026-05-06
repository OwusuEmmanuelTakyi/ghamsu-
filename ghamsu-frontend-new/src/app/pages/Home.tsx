import { HeroSection } from '../components/HeroSection'
import { FloatingServiceCards } from '../components/FloatingServiceCards'
import { WhyChooseUs } from '../components/WhyChooseUs'
import { HistorySection } from '../components/HistorySection'
import { AboutSection } from '../components/AboutSection'
import { BoardsHomeSection } from '../components/BoardsHomeSection'
import { BlogPreviewSection } from '../components/BlogPreviewSection'
import { UpcomingEvents } from '../components/UpcomingEvents'
import { DarkSection } from '../components/DarkSection'
import { StatsSection } from '../components/StatsSection'
import { useEffect, useState } from 'react'

export default function Home() {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0)

  const subtitles = [
    'Experience authentic worship, meaningful connections, and transformative spiritual growth in a welcoming community.',
    'Serving students, building faith, and creating lasting impact across Africa and beyond.',
    'Join us for fellowship, worship, and a journey of faith that transforms lives.',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length)
    }, 10000) // Change every 10 seconds

    return () => clearInterval(interval)
  }, [subtitles.length])

  return (
    <>
      <HeroSection
        title="GHANA METHODIST"
        titleHighlight="STUDENT'S UNION"
        subtitle={subtitles[currentSubtitleIndex]}
        backgroundImage="https://images.unsplash.com/photo-1762707222259-8f3afdcf9359?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjaHVyY2glMjBjb21tdW5pdHklMjBwZW9wbGV8ZW58MXx8fHwxNzc3ODU1NzcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
        tagline="Welcome Home"
        primaryButtonText="Give Today"
        primaryButtonLink="/partner"
        secondaryButtonText="Learn More"
        secondaryButtonLink="/about"
      />
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
  )
}