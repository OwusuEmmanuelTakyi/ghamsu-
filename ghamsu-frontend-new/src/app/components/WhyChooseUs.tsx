import { Heart, Globe, Church, Users } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { useInView } from 'motion/react'

export function WhyChooseUs() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

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
    <>
      <style>{`
        .why-section {
          background-color: #003D82;
        }
        .why-eyebrow {
          color: #D4AF37;
        }
        .why-heading {
          color: #FFFFFF;
        }
        .why-divider {
          background-color: #D4AF37;
        }
        .why-subtitle {
          color: rgba(255, 255, 255, 0.65);
        }
        .why-card {
          background-color: #002f6c;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
        .why-card:hover {
          border-color: rgba(212, 175, 55, 0.55);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.15);
          transform: translateY(-4px);
        }
        .why-card-top-bar {
          background-color: #D4AF37;
        }
        .why-card-number {
          color: rgba(212, 175, 55, 0.35);
        }
        .why-icon-box {
          border: 1px solid rgba(212, 175, 55, 0.35);
        }
        .why-card:hover .why-icon-box {
          border-color: #D4AF37;
          background-color: rgba(212, 175, 55, 0.08);
        }
        .why-icon {
          color: #D4AF37;
        }
        .why-card-title {
          color: #FFFFFF;
        }
        .why-card-micro-divider {
          background-color: rgba(212, 175, 55, 0.35);
        }
        .why-card-desc {
          color: rgba(255, 255, 255, 0.65);
        }

        /* Dark mode — restore original CSS variable styles */
        .dark .why-section {
          background-color: var(--background);
        }
        .dark .why-eyebrow {
          color: var(--accent);
        }
        .dark .why-heading {
          color: var(--foreground);
        }
        .dark .why-divider {
          background-color: var(--accent);
        }
        .dark .why-subtitle {
          color: var(--muted-foreground);
        }
        .dark .why-card {
          background-color: var(--card);
          border: 1px solid rgba(var(--border-rgb, 255 255 255 / 0.3));
        }
        .dark .why-card:hover {
          border-color: var(--accent);
          box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.4));
          transform: translateY(-4px);
        }
        .dark .why-card-top-bar {
          background-color: var(--accent);
        }
        .dark .why-card-number {
          color: color-mix(in srgb, var(--accent) 40%, transparent);
        }
        .dark .why-icon-box {
          border-color: color-mix(in srgb, var(--accent) 40%, transparent);
        }
        .dark .why-card:hover .why-icon-box {
          border-color: var(--accent);
          background-color: color-mix(in srgb, var(--accent) 5%, transparent);
        }
        .dark .why-icon {
          color: var(--accent);
        }
        .dark .why-card-title {
          color: var(--foreground);
        }
        .dark .why-card-micro-divider {
          background-color: color-mix(in srgb, var(--accent) 30%, transparent);
        }
        .dark .why-card-desc {
          color: var(--muted-foreground);
        }
      `}</style>

      <section
        ref={sectionRef}
        className="why-section py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header with Scroll Animations */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            {/* Eyebrow - slides up */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <p
                className="why-eyebrow text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Our Purpose
              </p>
            </motion.div>

            {/* Main Heading - slides up with delay */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="why-heading text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Our Vision
            </motion.h2>

            {/* Divider - scales in */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="why-divider h-[2px] w-16 mx-auto mb-6 origin-center"
            />

            {/* Subtitle - fades in */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="why-subtitle text-sm sm:text-base max-w-3xl mx-auto font-light leading-relaxed"
            >
              Four foundational pillars guiding our mission and commitment to excellence
            </motion.p>
          </div>

          {/* Cards Grid with Staggered Animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -8 }}
                  className="group h-full"
                >
                  <div className="why-card relative rounded-lg overflow-hidden transition-all duration-500 h-full flex flex-col p-8 sm:p-10">
                    {/* Accent Line at Top - expands on scroll */}
                    <motion.div
                      className="why-card-top-bar absolute top-0 left-0 right-0 h-[2px]"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.12 + 0.2 }}
                      style={{ originX: 0 }}
                    />

                    {/* Number - fades and scales in */}
                    <motion.div
                      className="absolute top-6 sm:top-8 right-6 sm:right-8"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.12 + 0.1 }}
                    >
                      <span
                        className="why-card-number text-2xl sm:text-3xl font-light"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {feature.number}
                      </span>
                    </motion.div>

                    {/* Icon - bounces in with rotation */}
                    <motion.div
                      className="mb-8 sm:mb-10"
                      initial={{ opacity: 0, scale: 0, rotate: -15 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.12 + 0.15,
                        type: 'spring',
                        stiffness: 100,
                      }}
                    >
                      <div className="why-icon-box w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center transition-all duration-300">
                        <Icon
                          className="why-icon w-7 h-7 sm:w-8 sm:h-8"
                          strokeWidth={1.5}
                        />
                      </div>
                    </motion.div>

                    {/* Title - slides in from left */}
                    <motion.h3
                      className="why-card-title text-lg sm:text-xl mb-3 sm:mb-4 tracking-tight font-semibold"
                      style={{ fontFamily: 'var(--font-heading)' }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.12 + 0.2,
                      }}
                    >
                      {feature.title}
                    </motion.h3>

                    {/* Micro Divider - scales in */}
                    <motion.div
                      className="why-card-micro-divider h-[1px] w-8 mb-4 sm:mb-6"
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileInView={{ scaleX: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.12 + 0.25,
                      }}
                      style={{ originX: 0 }}
                    />

                    {/* Description - fades in with word reveal effect */}
                    <motion.p
                      className="why-card-desc text-xs sm:text-sm leading-relaxed font-light flex-1"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.12 + 0.3,
                      }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}