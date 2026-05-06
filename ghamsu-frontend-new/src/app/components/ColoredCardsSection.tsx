import { MapPin, Clock, Users, Zap } from 'lucide-react'
import { AnimatedSection } from '../components/AnimatedSection'

export function ColoredCardsSection() {
  const cards = [
    {
      icon: MapPin,
      title: 'Our Location',
      description: 'Visit us at our main campus in Accra, Greater Accra Region',
      bgColor: 'bg-[#003D82]',
      textColor: 'text-white',
      accentColor: 'text-[#D4AF37]',
    },
    {
      icon: Clock,
      title: 'Service Times',
      description: 'Sunday Worship: 9:00 AM & 11:00 AM | Wednesday Prayer: 7:00 PM',
      bgColor: 'bg-[#003D82]',
      textColor: 'text-white',
      accentColor: 'text-[#D4AF37]',
    },
    {
      icon: Users,
      title: 'Join Our Community',
      description: 'Become part of our growing faith family and spiritual journey',
      bgColor: 'bg-[#003D82]',
      textColor: 'text-white',
      accentColor: 'text-[#D4AF37]',
    },
    {
      icon: Zap,
      title: 'Get Involved',
      description: 'Discover ways to serve and grow with us in ministry',
      bgColor: 'bg-[#003D82]',
      textColor: 'text-white',
      accentColor: 'text-[#D4AF37]',
    },
  ]

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[1400px] mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12 sm:mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl text-[#003D82] mb-4 sm:mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Why Join Us
            </h2>
            <div className="h-[3px] w-20 bg-[#D4AF37] mx-auto" />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className={`${card.bgColor} ${card.textColor} p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col group border-t-4 border-[#D4AF37]`}>
                  {/* Icon */}
                  <div className={`${card.accentColor} mb-4 sm:mb-6`}>
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg sm:text-xl mb-3 sm:mb-4 tracking-tight font-semibold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-light flex-1 mb-4">
                    {card.description}
                  </p>

                  {/* Gold accent line on hover */}
                  <div className="h-[2px] bg-[#D4AF37]/0 group-hover:bg-[#D4AF37] transition-all duration-300" />
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}