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
    '2 Corinthians 5:20 - We are therefore Christ’s ambassadors, as though God were making his appeal through us. We implore you on Christ’s behalf: Be reconciled to God.',
    'Ambassadors in Unity and Love.',
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
        titleHighlight="STUDENT'S UNION (GHAMSU)"
        subtitle={subtitles[currentSubtitleIndex]}
        backgroundImage="https://images.unsplash.com/photo-1778082388125-c2a1c6a835ba?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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