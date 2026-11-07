import { useEffect } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { ActivityCard } from '../components/MajorActivitiesSection'
import { useMajorActivities } from '../../lib/hooks'
import { splitActivities } from '../../lib/activities'

/** Every published major activity: upcoming first, then ones that have ended. */
export default function Activities() {
  const { data, loading, error } = useMajorActivities()
  const { upcoming, past } = splitActivities((data ?? []).filter((activity) => activity.slug))

  useEffect(() => {
    const previous = document.title
    document.title = 'Major Activities · GHAMSU'
    return () => { document.title = previous }
  }, [])

  return (
    <div>
      <HeroSection
        title="Major Activities"
        subtitle="Union-wide gatherings across the Connexion. Register online to secure your place."
        pageKey="events"
        isHomePage={false}
      />

      <section className="bg-[#003D82] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 dark:bg-[#0a1628]">
        <div className="mx-auto max-w-7xl">
          {loading && !data ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-white/70" aria-label="Loading" /></div>
          ) : error ? (
            <p className="py-16 text-center text-white/80">We couldn't load the activities right now. Please try again later.</p>
          ) : (
            <>
              <Heading id="upcoming-heading" title="Upcoming" />
              {upcoming.length ? (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3" aria-labelledby="upcoming-heading">
                  {upcoming.map((activity, index) => <ActivityCard key={activity.id} activity={activity} index={index} />)}
                </div>
              ) : (
                <p className="text-white/70">No upcoming activities have been announced yet. Check back soon.</p>
              )}

              {past.length > 0 && (
                <div className="mt-16 sm:mt-20">
                  <Heading id="past-heading" title="Past activities" />
                  <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3" aria-labelledby="past-heading">
                    {past.map((activity, index) => <ActivityCard key={activity.id} activity={activity} index={index} />)}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-14 text-center">
            <Link to="/events" className="inline-flex items-center gap-2 font-medium text-[#D4AF37] hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to events
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Heading({ id, title }: { id: string; title: string }) {
  return (
    <AnimatedSection>
      <div className="mb-8 sm:mb-10">
        <div className="mb-4 h-px w-12 bg-[#D4AF37]" />
        <h2 id={id} className="text-2xl tracking-tight text-white sm:text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          {title}
        </h2>
      </div>
    </AnimatedSection>
  )
}
