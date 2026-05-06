import { Heart, TrendingUp, Users, Globe } from 'lucide-react'
import { Link } from 'react-router'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'

export default function Partner() {
  const ways = [
    {
      icon: Heart,
      title: 'Monthly Giving',
      description: 'Become a regular partner with recurring monthly contributions that sustain ongoing ministry.',
    },
    {
      icon: TrendingUp,
      title: 'One-Time Gift',
      description: 'Make a single donation to support specific projects or general ghamsu operations.',
    },
    {
      icon: Users,
      title: 'Legacy Giving',
      description: 'Contribute the GHAMSU Connexional Legacy projects',
    },
    {
      icon: Globe,
      title: 'Mission Support',
      description: 'Partner with our missions initiatives and outreach programs like SICE and Ghamsu Missions.',
    },
  ]

  return (
    <div>
      <HeroSection
        title="Partner With Us"
        subtitle="Your partnership enables us to transform lives, strengthen families, and impact communities for Christ."
        backgroundImage="https://i.pinimg.com/1200x/74/f4/cb/74f4cbf489738376666d1927ff18a686.jpg"
        isHomePage={false}
      />

      <div className="pb-24">
        {/* Ways to Partner */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16">
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
                >
                  Ways to Partner
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {ways.map((way, index) => {
                const Icon = way.icon
                return (
                  <AnimatedSection key={index} delay={index * 0.1}>
                    <div className="bg-card border border-border p-6 sm:p-8 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center h-full flex flex-col">
                      <div className="inline-flex w-16 h-16 border border-border bg-primary/10 items-center justify-center mb-6 mx-auto rounded-lg">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3
                        className="text-lg sm:text-xl mb-3 tracking-tight"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        {way.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                        {way.description}
                      </p>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </section>

        {/* Bank Account Details */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 bg-secondary/50">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16">
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
                >
                  Bank Account Details
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base mt-4 max-w-2xl mx-auto">
                  Make your contribution directly to our bank account in Ghana
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-card border border-border p-6 sm:p-8 lg:p-12 rounded-lg shadow-xl">
                <div className="space-y-6 sm:space-y-8">
                  <div className="pb-6 sm:pb-8 border-b border-border">
                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                      Account Name
                    </p>
                    <p className="text-lg sm:text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                      Ghana Methodist Student's Union
                    </p>
                  </div>

                  <div className="pb-6 sm:pb-8 border-b border-border">
                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                      Bank Name
                    </p>
                    <p className="text-lg sm:text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                      GCB Bank Ltd.
                    </p>
                  </div>

                  <div className="pb-6 sm:pb-8 border-b border-border">
                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                      Branch
                    </p>
                    <p className="text-lg sm:text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                      Knust Branch, Kumasi
                    </p>
                  </div>

                  <div className="pb-6 sm:pb-8 border-b border-border">
                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                      Account Number
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-accent tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                      [Your Account Number]
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                      Or
                    </p>
                    <p className="text-lg sm:text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                      Standard Chartered Bank, Harper Road Kumasi
                    </p>
                  </div>

                  <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      For Special information and international transfer information,{' '}
                      <Link to="/contact" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                        contact us here
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Please contact us for a receipt.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Contribution Form */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <div className="max-w-2xl mx-auto">
            <AnimatedSection>
              <div className="bg-card border border-border p-6 sm:p-8 lg:p-12 rounded-lg shadow-xl">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl mb-8 text-center"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
                >
                  Make a Contribution
                </h2>

                <form className="space-y-5 sm:space-y-6">
                  <div>
                    <label className="block mb-2 sm:mb-3 font-semibold text-sm sm:text-base">
                      Contribution Type
                    </label>
                    <select className="w-full px-4 py-2.5 sm:py-3 bg-secondary border border-border rounded-lg focus:border-primary focus:outline-none transition-colors text-sm sm:text-base">
                      <option>One-Time Gift</option>
                      <option>Monthly Partnership</option>
                      <option>Mission Support</option>
                      <option>Building Fund</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-3 sm:mb-4 font-semibold text-sm sm:text-base">
                      Amount (GHS)
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                      {['₵50', '₵100', '₵250'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className="py-2.5 sm:py-3 border-2 border-border hover:border-accent hover:bg-accent/5 transition-colors font-semibold text-sm sm:text-base rounded-lg"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 sm:py-3 bg-secondary border border-border rounded-lg focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                      placeholder="Custom amount"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 sm:mb-3 font-semibold text-sm sm:text-base">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 sm:py-3 bg-secondary border border-border rounded-lg focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 sm:mb-3 font-semibold text-sm sm:text-base">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 sm:py-3 bg-secondary border border-border rounded-lg focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 sm:mb-3 font-semibold text-sm sm:text-base">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 sm:py-3 bg-secondary border border-border rounded-lg focus:border-primary focus:outline-none transition-colors text-sm sm:text-base"
                      placeholder="+233 (0) 123 456 789"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground py-3 sm:py-4 rounded-lg hover:bg-accent/90 transition-colors font-semibold text-sm sm:text-base uppercase tracking-wider"
                  >
                    Continue to Payment
                  </button>

                  <p className="text-center text-xs sm:text-sm text-muted-foreground">
                    All contributions are tax-deductible. You will receive a receipt via email.
                  </p>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </div>
  )
}