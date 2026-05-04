import { AnimatedSection } from './AnimatedSection';
import { Link } from 'react-router';

export function AboutSection() {
  return (
    <section className="py-32 px-6 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Content side */}
          <AnimatedSection>
            <div>
              <div className="mb-8">
                <div className="h-[1px] w-12 bg-accent mb-4" />
                <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                  Our Story
                </p>
              </div>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl mb-8 tracking-tight leading-[1.1]"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Transforming Lives<br />Since 1999
              </h2>
              <p className="text-muted-foreground text-base mb-6 leading-relaxed font-light">
                For over 25 years, Ghana Methodist Student's Union has been a beacon of hope and spiritual guidance
                in our community. We are committed to creating a welcoming environment where
                people from all walks of life can discover God's love and purpose for their lives.
              </p>
              <p className="text-muted-foreground text-base mb-10 leading-relaxed font-light">
                Our vision is to be a church that transforms lives, strengthens families, and
                impacts communities through the power of faith, love, and service.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mb-10 pb-10 border-b border-border">
                <div>
                  <p className="text-3xl font-semibold text-foreground mb-1" style={{ fontFamily: 'var(--font-heading)' }}>25+</p>
                  <p className="text-xs text-muted-foreground tracking-wider uppercase">Years</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-foreground mb-1" style={{ fontFamily: 'var(--font-heading)' }}>5K+</p>
                  <p className="text-xs text-muted-foreground tracking-wider uppercase">Members</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-foreground mb-1" style={{ fontFamily: 'var(--font-heading)' }}>30+</p>
                  <p className="text-xs text-muted-foreground tracking-wider uppercase">Nations</p>
                </div>
              </div>

              <Link to="/about">
                <button className="border-2 border-primary text-primary px-10 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  Our Story
                </button>
              </Link>
            </div>
          </AnimatedSection>

          {/* Image side */}
          <AnimatedSection delay={0.2}>
            <div className="relative">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1569292567777-e5d61a759322?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBjb21tdW5pdHklMjBwZW9wbGV8ZW58MXx8fHwxNzc3ODU1NzcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Church community"
                  className="w-full h-[600px] object-cover"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
