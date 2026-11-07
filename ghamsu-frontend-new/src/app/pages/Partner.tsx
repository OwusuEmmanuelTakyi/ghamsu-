import { Heart, TrendingUp, Users, Globe } from 'lucide-react'
import { Link } from 'react-router'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { useSiteSetting } from '../../lib/hooks'
import type { BankDetailsSetting } from '../../types/types'

const CONTACT_PHRASE = 'contact us here'

export default function Partner() {
  const { data: bank } = useSiteSetting<BankDetailsSetting>('bank_details')

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

  // Each row appears only once it has a value in the database.
  const bankRows = [
    { label: 'Account Name', value: bank?.account_name },
    { label: 'Bank Name', value: bank?.bank_name },
    { label: 'Branch', value: bank?.branch },
    { label: 'Account Number', value: bank?.account_number, emphasis: true },
    { label: 'Or', value: bank?.alternative_bank },
    { label: 'Account Number', value: bank?.alternative_bank ? bank?.alternative_account_number : null, emphasis: true },
    { label: 'Mobile Money Name', value: bank?.momo_name },
    { label: 'Mobile Money Number', value: bank?.momo_number, emphasis: true },
    { label: 'Mobile Money Network', value: bank?.momo_network },
  ].filter((row) => row.value)

  // "...information, contact us here" links the closing phrase to /contact.
  const note = bank?.international_note?.trim()
  const noteLinked = note?.toLowerCase().endsWith(CONTACT_PHRASE)
  const noteText = noteLinked ? note!.slice(0, -CONTACT_PHRASE.length) : note

  return (
    <div>
      <HeroSection
        title="Partner With Us"
        subtitle="Your partnership enables us to transform lives, strengthen families, and impact communities for Christ."
        pageKey="partner"
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

        {/* Bank and Mobile Money Details */}
        {bankRows.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 bg-secondary/50">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <div className="text-center mb-12 sm:mb-16">
                  <h2
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
                  >
                    {bank?.section_heading || 'Bank Account Details'}
                  </h2>
                  {bank?.section_subheading && (
                    <p className="text-muted-foreground text-sm sm:text-base mt-4 max-w-2xl mx-auto">
                      {bank.section_subheading}
                    </p>
                  )}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-card border border-border p-6 sm:p-8 lg:p-12 rounded-lg shadow-xl">
                  <div className="space-y-6 sm:space-y-8">
                    {bankRows.map((row, index) => (
                      <div
                        key={`${row.label}-${index}`}
                        className={index < bankRows.length - 1 ? 'pb-6 sm:pb-8 border-b border-border' : ''}
                      >
                        <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                          {row.label}
                        </p>
                        <p
                          className={row.emphasis
                            ? 'text-xl sm:text-2xl font-bold text-accent tracking-wide'
                            : 'text-lg sm:text-xl font-semibold'}
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {row.value}
                        </p>
                      </div>
                    ))}

                    {(note || bank?.receipt_note) && (
                      <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
                        {note && (
                          <p className="text-sm text-muted-foreground text-center mb-4">
                            {noteText}
                            {noteLinked && (
                              <Link to="/contact" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                                {CONTACT_PHRASE}
                              </Link>
                            )}
                          </p>
                        )}
                        {bank?.receipt_note && (
                          <p className="text-xs text-muted-foreground text-center">
                            {bank.receipt_note}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
