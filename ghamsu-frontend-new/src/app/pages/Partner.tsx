import { Heart, TrendingUp, Users, Globe } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';

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
      description: 'Make a single donation to support specific projects or general church operations.',
    },
    {
      icon: Users,
      title: 'Legacy Giving',
      description: 'Plan for the future through planned giving and estate contributions.',
    },
    {
      icon: Globe,
      title: 'Mission Support',
      description: 'Partner with our global missions initiatives and international outreach programs.',
    },
  ];

  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-4 mb-24">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h1
              className="text-5xl md:text-6xl mb-6"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              Partner With Us
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your partnership enables us to transform lives, strengthen families, and impact communities for Christ.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Ways to Give */}
      <section className="px-4 mb-24">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2
              className="text-4xl mb-12 text-center"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              Ways to Partner
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ways.map((way, index) => {
              const Icon = way.icon;
              return (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="bg-card border border-border p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
                    <div className="inline-flex w-16 h-16 border border-border bg-primary/10 items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3
                      className="text-xl mb-3"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      {way.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {way.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bank Account Details */}
      <section className="px-4 mb-24 bg-secondary py-24">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2
              className="text-4xl mb-12 text-center"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              Bank Account Details
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="bg-card border border-border p-10 shadow-xl">
              <div className="space-y-6">
                <div className="pb-6 border-b border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Account Name</p>
                  <p className="text-xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                    Ghana Methodist Student's Union
                  </p>
                </div>

                <div className="pb-6 border-b border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Bank Name</p>
                  <p className="text-xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                    [Bank Name]
                  </p>
                </div>

                <div className="pb-6 border-b border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Account Number</p>
                  <p className="text-2xl font-semibold text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                    [Account Number]
                  </p>
                </div>

                <div className="pb-6 border-b border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Branch</p>
                  <p className="text-xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                    [Branch Location]
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Swift Code</p>
                  <p className="text-xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                    [Swift Code]
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    For international transfers, please contact us for additional banking information.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Giving Form */}
      <section className="px-4">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection>
            <div className="bg-card border border-border p-8 md:p-12 shadow-xl">
              <h2
                className="text-3xl mb-8 text-center"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
              >
                Make a Contribution
              </h2>

              <form className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium">Contribution Type</label>
                  <select className="w-full px-4 py-3  bg-secondary border border-border focus:border-primary focus:outline-none transition-colors">
                    <option>One-Time Gift</option>
                    <option>Monthly Partnership</option>
                    <option>Mission Support</option>
                    <option>Building Fund</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Amount</label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {['$50', '$100', '$250'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className="py-3  border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors font-medium"
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    className="w-full px-4 py-3  bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="Custom amount"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3  bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3  bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground py-4  hover:opacity-90 transition-opacity font-medium text-lg"
                >
                  Continue to Payment
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  All contributions are tax-deductible. You will receive a receipt via email.
                </p>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
