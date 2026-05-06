import { Heart, Globe, Church, Users } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

export function WhyChooseUs() {
  const features = [
    {
      icon: Heart,
      title: 'Ambassadors in Unity',
      description: 'To develop Ambassadors in unity and love for Christ, fostering deep spiritual connections and fellowship across all our communities.',
      number: '01',
    },
    {
      icon: Globe,
      title: 'Witness to Nations',
      description: 'To witness Him to the nations, spreading the message of faith and hope to every corner of the world through active evangelism.',
      number: '02',
    },
    {
      icon: Church,
      title: 'Strong Foundation',
      description: 'To build on the strong foundation of the church, establishing vibrant communities rooted in biblical values and traditions.',
      number: '03',
    },
    {
      icon: Users,
      title: 'Contributing to Society',
      description: 'To be responsible contributors to society, making meaningful impact through service, leadership, and social responsibility.',
      number: '04',
    },
  ]

  return (
    <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="mb-4">
              <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                Our Purpose
              </p>
            </div>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Our Vision
            </h2>
            <div className="h-[2px] w-16 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto font-light leading-relaxed">
              Four foundational pillars guiding our mission and commitment to excellence
            </p>
          </div>
        </AnimatedSection>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="group h-full">
                  {/* Card Container */}
                  <div className="relative bg-card border border-border/30 hover:border-accent/50 rounded-lg overflow-hidden transition-all duration-500 hover:shadow-lg h-full flex flex-col p-8 sm:p-10">
                    {/* Accent Line at Top */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" />

                    {/* Number in Top Right */}
                    <div className="absolute top-6 sm:top-8 right-6 sm:right-8">
                      <span
                        className="text-2xl sm:text-3xl font-light text-accent/40"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {feature.number}
                      </span>
                    </div>

                    {/* Icon in Box */}
                    <div className="mb-8 sm:mb-10">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 border border-accent/40 rounded-lg flex items-center justify-center group-hover:border-accent group-hover:bg-accent/5 transition-all duration-300">
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-accent" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-lg sm:text-xl mb-3 sm:mb-4 tracking-tight font-semibold text-foreground"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {feature.title}
                    </h3>

                    {/* Divider */}
                    <div className="h-[1px] w-8 bg-accent/30 mb-4 sm:mb-6" />

                    {/* Description */}
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light flex-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}