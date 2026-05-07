import { BookOpen, FileText, Calendar, Lightbulb } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { useNews, useArticles, useEvents } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'

export function FloatingServiceCards() {
  const [scriptureOfDay, setScriptureOfDay] = useState<{ text: string; reference: string } | null>(null)
  const [scriptureLoading, setScriptureLoading] = useState(true)
  const [articleOfDay, setArticleOfDay] = useState<any>(null)

  const { data: news } = useNews()
  const { data: articles } = useArticles()
  const { data: events } = useEvents()

  // ── Scripture of the Day (OurManna API) ───────────────────────────────────
  useEffect(() => {
    const fetchScriptureOfDay = async () => {
      try {
        const response = await fetch(
          'https://beta.ourmanna.com/api/v1/get?format=json&order=daily'
        )

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()

        // OurManna API structure: { verse: { details: { text, reference } } }
        const details = data?.verse?.details
        if (details?.text && details?.reference) {
          setScriptureOfDay({
            text: details.text.trim(),
            reference: details.reference,
          })
        } else {
          throw new Error('Unexpected API response structure')
        }
      } catch (error) {
        console.error('[FloatingServiceCards] Error fetching scripture:', error)
        // Fallback scripture
        setScriptureOfDay({
          text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
          reference: 'John 3:16',
        })
      } finally {
        setScriptureLoading(false)
      }
    }

    fetchScriptureOfDay()
  }, [])

  // ── Article of the Day (deterministic by date) ────────────────────────────
  useEffect(() => {
    if (!articles || articles.length === 0) return

    const today = new Date()
    const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD
    const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const randomIndex = seed % articles.length

    setArticleOfDay(articles[randomIndex])
  }, [articles])

  // ── Latest news ───────────────────────────────────────────────────────────
  const latestNews = news && news.length > 0 ? news[0] : null

  // ── Upcoming event within 3 days ──────────────────────────────────────────
  const getUpcomingEvent = () => {
    if (!events || events.length === 0) return null

    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    return (
      events.find((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= now && eventDate <= threeDaysFromNow
      }) || null
    )
  }

  const upcomingEvent = getUpcomingEvent()

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const truncateText = (text: string, length: number) =>
    text.length > length ? text.substring(0, length) + '...' : text

  // ── Card definitions ──────────────────────────────────────────────────────
  const cards = [
    {
      icon: BookOpen,
      title: "Today's News",
      description: latestNews ? truncateText(latestNews.title, 50) : 'No news yet',
      image: latestNews?.featuredImage
        ? urlFor(latestNews.featuredImage).width(200).height(200).url()
        : null,
      link: latestNews ? `/blogs/${latestNews.slug.current}` : '/blogs?category=news',
      active: true,
      readMoreText: 'Read News',
    },
    {
      icon: FileText,
      title: 'Article of the Day',
      description: articleOfDay ? truncateText(articleOfDay.title, 50) : 'Loading article...',
      image: articleOfDay?.featuredImage
        ? urlFor(articleOfDay.featuredImage).width(200).height(200).url()
        : null,
      link: articleOfDay ? `/blogs/${articleOfDay.slug.current}` : '/blogs?category=articles',
      active: false,
      readMoreText: 'Read Article',
    },
    {
      icon: Calendar,
      title: 'Upcoming Program',
      description: upcomingEvent
        ? `${upcomingEvent.title} - ${formatDate(upcomingEvent.date)}`
        : 'No events in next 3 days',
      image: null,
      link: '/events',
      active: false,
      readMoreText: 'View Events',
    },
    {
      icon: Lightbulb,
      title: 'Scripture of the Day',
      description: scriptureLoading
        ? 'Loading scripture...'
        : scriptureOfDay
        ? `"${truncateText(scriptureOfDay.text, 80)}" — ${scriptureOfDay.reference}`
        : '"For God so loved the world..." — John 3:16',
      link: '/sermons',
      active: true,
      readMoreText: '',
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative -mt-24 z-20 px-4 sm:px-6 md:-mt-32 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <Link key={index} to={card.link}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`group relative h-full cursor-pointer overflow-hidden rounded-lg transition-all duration-500 ${
                    card.active
                      ? 'bg-accent text-accent-foreground shadow-xl hover:-translate-y-1 hover:shadow-2xl'
                      : 'bg-card text-card-foreground border border-border hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg'
                  }`}
                >
                  {/* Accent top line */}
                  <div
                    className={`h-[2px] w-full ${
                      card.active ? 'bg-accent-foreground/20' : 'bg-accent'
                    }`}
                  />

                  <div className="flex h-full flex-col p-5 sm:p-6 lg:p-8">
                    {/* Icon */}
                    <div className="mb-4 sm:mb-5 lg:mb-6">
                      <div
                        className={`flex h-10 w-10 items-center justify-center transition-all sm:h-12 sm:w-12 ${
                          card.active
                            ? 'text-accent-foreground/80'
                            : 'text-foreground/60 group-hover:text-accent'
                        }`}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className={`mb-2 line-clamp-2 text-base tracking-tight sm:mb-3 sm:text-lg ${
                        card.active ? 'font-semibold' : 'font-medium'
                      }`}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {card.title}
                    </h3>

                    {/* Thumbnail */}
                    {card.image && (
                      <div className="mb-3 h-16 w-16 overflow-hidden rounded-lg border border-border/50 shadow-md sm:mb-4 sm:h-20 sm:w-20">
                        <img
                          src={card.image}
                          alt={card.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p
                      className={`mb-3 line-clamp-3 flex-1 text-xs leading-relaxed sm:mb-4 sm:text-sm ${
                        card.active ? 'text-accent-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {card.description}
                    </p>

                    {/* Read More */}
                    {card.readMoreText && (
                      <span
                        className={`inline-flex items-center gap-2 text-xs font-semibold transition-all duration-300 sm:text-sm ${
                          card.active
                            ? 'text-accent-foreground hover:text-accent-foreground/80'
                            : 'text-accent hover:text-accent/80 group-hover:gap-3'
                        }`}
                      >
                        {card.readMoreText}
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}