import { Link } from 'react-router'
import { ArrowRight, Calendar, MapPin } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import { useMajorActivities } from '../../lib/hooks'
import { fallbackToFull, focusStyle } from '../../lib/media'
import { activityDate, isRegistrationOpen } from '../../lib/activities'

/** Major activities on the Events page, each linking to /activities/:slug. */
export function MajorActivitiesSection() {
  const { data } = useMajorActivities()
  // Activities need a slug for their page (added by migration 0004).
  const activities = (data ?? []).filter((activity) => activity.slug)
  if (!activities.length) return null

  return (
    <section className="bg-[#003D82] px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8 dark:bg-[#0a1628]" aria-labelledby="major-activities-heading">
      <div className="mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="mb-10 sm:mb-14">
            <div className="mb-4 h-px w-12 bg-[#D4AF37]" />
            <h2 id="major-activities-heading" className="text-3xl tracking-tight text-white sm:text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
              Major Activities
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-light text-white/70 sm:text-base">
              Union-wide gatherings across the Connexion. Register online to secure your place.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => {
            const open = isRegistrationOpen(activity)
            const date = activityDate(activity)
            const href = `/activities/${activity.slug}`
            return (
              <AnimatedSection key={activity.id} delay={index * 0.1}>
                <article className="group flex h-full flex-col overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-500 hover:border-[#D4AF37] dark:border-white/10 dark:bg-[#0d1f3c] dark:hover:border-[#D4AF37]/50">
                  <Link to={href} className="relative block h-48 overflow-hidden sm:h-56" tabIndex={-1} aria-hidden="true">
                    {activity.thumbnailUrl && (
                      <img
                        src={activity.thumbnailUrl}
                        onError={fallbackToFull(activity.imageUrl)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={focusStyle(activity.imageFocus)}
                      />
                    )}
                    <span className={`absolute right-4 top-4 rounded px-3 py-1 text-xs font-semibold ${open ? 'bg-green-500 text-white' : 'bg-black/60 text-white'}`}>
                      {open ? 'Registration open' : 'Registration closed'}
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <h3 className="mb-4 text-xl tracking-tight text-white sm:text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                      <Link to={href} className="hover:text-[#D4AF37]">{activity.title}</Link>
                    </h3>
                    <div className="mb-6 flex-1 space-y-2 text-sm font-light text-white/70">
                      {date && <p className="flex items-center gap-2"><Calendar className="h-4 w-4 flex-shrink-0 text-[#D4AF37]" />{date}</p>}
                      {activity.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 flex-shrink-0 text-[#D4AF37]" />{activity.location}</p>}
                      {activity.description && <p className="line-clamp-3 pt-2 leading-relaxed text-white/65">{activity.description}</p>}
                    </div>
                    {open ? (
                      <Link to={href} className="flex items-center justify-center gap-2 bg-[#D4AF37] py-3 text-sm font-semibold uppercase tracking-wider text-[#003D82] transition-colors hover:bg-white">
                        Register <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link to={href} className="flex items-center justify-center gap-2 border border-white/25 py-3 text-sm font-medium uppercase tracking-wider text-white/70 transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]">
                        Registration closed · Details
                      </Link>
                    )}
                  </div>
                </article>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
