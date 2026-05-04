import { Link } from 'react-router';

export function HeroSection() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] flex items-center md:items-start md:pt-24 justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1762707222259-8f3afdcf9359?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjaHVyY2glMjBjb21tdW5pdHklMjBwZW9wbGV8ZW58MXx8fHwxNzc3ODU1NzcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Worship background"
            className="w-full h-full object-cover scale-105"
          />
        </div>
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="mb-4 md:mb-6 inline-block">
          <div className="h-[1px] w-12 bg-accent mx-auto mb-3" />
          <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
            Welcome Home
          </p>
        </div>
        <h1
          className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 md:mb-6 tracking-tight leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          A Community of<br />Faith & Purpose
        </h1>
        <p className="text-sm md:text-base text-white/80 mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed font-light">
          Experience authentic worship, meaningful connections, and transformative spiritual growth in a welcoming community.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link to="/partner">
            <button className="bg-accent text-accent-foreground px-8 py-3 text-xs tracking-wider uppercase font-semibold hover:bg-accent/90 transition-all duration-300 shadow-lg">
              Give Today
            </button>
          </Link>
          <Link to="/about">
            <button className="border-2 border-white/40 text-white px-8 py-3 text-xs tracking-wider uppercase font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
              Learn More
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
