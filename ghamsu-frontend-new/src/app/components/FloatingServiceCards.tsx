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

  // Get scripture of the day from OurManna API
  useEffect(() => {
    const fetchScriptureOfDay = async () => {
      try {
        const response = await fetch(
          `https://beta.ourmanna.com/api/v1/get?format=json&order=daily`
        )
        
        if (!response.ok) throw new Error('Failed to fetch')

        const data = await response.json()
        
        // Log to see the actual structure
        console.log('Scripture API Response:', data)
        
        // Parse the correct structure from OurManna API
        if (data.result) {
          const verseData = data.result.verses ? data.result.verses[0] : data.result
          const reference = `${verseData.bookname} ${verseData.chapter}:${verseData.verse}`
          
          setScriptureOfDay({
            text: verseData.text || 'For God so loved the world that he gave his one and only Son...',
            reference: reference || 'John 3:16',
          })
        } else {
          throw new Error('Invalid API response structure')
        }
      } catch (error) {
        console.error('Error fetching scripture:', error)
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

  // Get article of the day (deterministic based on date, so same article all day)
  useEffect(() => {
    if (!articles || articles.length === 0) return

    // Create a seed based on today's date for consistent daily article
    const today = new Date()
    const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD
    const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const randomIndex = seed % articles.length

    setArticleOfDay(articles[randomIndex])
  }, [articles])

  // Get most recent news
  const latestNews = news && news.length > 0 ? news[0] : null

  // Get upcoming event within 3 days
  const getUpcomingEvent = () => {
    if (!events || events.length === 0) return null

    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    return events.find((event) => {
      const eventDate = new Date(event.date)
      return eventDate >= now && eventDate <= threeDaysFromNow
    }) || null
  }

  const upcomingEvent = getUpcomingEvent()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const truncateText = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  const cards = [
    {
      icon: BookOpen,
      title: "Today's News",
      description: latestNews ? truncateText(latestNews.title, 50) : 'No news yet',
      image: latestNews?.featuredImage ? urlFor(latestNews.featuredImage).width(200).height(200).url() : null,
      link: latestNews ? `/blogs/${latestNews.slug.current}` : '/blogs?category=news',
      active: true,
      readMoreText: 'Read News',
    },
    {
      icon: FileText,
      title: 'Article of the Day',
      description: articleOfDay ? truncateText(articleOfDay.title, 50) : 'Loading article...',
      image: articleOfDay?.featuredImage ? urlFor(articleOfDay.featuredImage).width(200).height(200).url() : null,
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
      image: upcomingEvent?.featuredImage ? urlFor(upcomingEvent.featuredImage).width(200).height(200).url() : null,
      link: '/events',
      active: false,
      readMoreText: 'View Events',
    },
    {
      icon: Lightbulb,
      title: 'Scripture of the Day',
      description: scriptureOfDay 
        ? `"${truncateText(scriptureOfDay.text, 40)}" - ${scriptureOfDay.reference}`
        : 'Loading scripture...',
      link: '/sermons',
      active: true,
      readMoreText: '',
    },
  ]

  return (
    <div className="relative -mt-24 md:-mt-32 z-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <Link key={index} to={card.link}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`group relative overflow-hidden transition-all duration-500 h-full cursor-pointer rounded-lg ${
                    card.active
                      ? 'bg-accent text-accent-foreground shadow-xl hover:shadow-2xl hover:-translate-y-1'
                      : 'bg-card text-card-foreground border border-border hover:border-accent/50 hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  {/* Accent top line */}
                  <div className={`h-[2px] w-full ${card.active ? 'bg-accent-foreground/20' : 'bg-accent'}`} />

                  <div className="p-5 sm:p-6 lg:p-8 flex flex-col h-full">
                    {/* Icon */}
                    <div className="mb-4 sm:mb-5 lg:mb-6">
                      <div
                        className={`w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center transition-all ${
                          card.active
                            ? 'text-accent-foreground/80'
                            : 'text-foreground/60 group-hover:text-accent'
                        }`}
                      >
                        <Icon className="w-5 sm:w-6 h-5 sm:h-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className={`text-base sm:text-lg mb-2 sm:mb-3 tracking-tight line-clamp-2 ${
                        card.active ? 'font-semibold' : 'font-medium'
                      }`}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {card.title}
                    </h3>

                    {/* Small Square Flyer */}
                    {card.image && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border/50 mb-3 sm:mb-4 shadow-md">
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p
                      className={`text-xs sm:text-sm leading-relaxed line-clamp-2 flex-1 ${
                        card.active ? 'text-accent-foreground/70' : 'text-muted-foreground'
                      } mb-3 sm:mb-4`}
                    >
                      {card.description}
                    </p>

                    {/* Read More Text Link */}
                    {card.readMoreText && (
                      <span
                        className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-300 ${
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