import { Link } from 'react-router'
import logoImage from '../../images/logo.png'

export function Footer() {
  const exploreLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Events', path: '/events' },
    { label: 'Sermons', path: '/sermons' },
  ]

  const resourcesLinks = [
    { label: 'Blogs', path: '/blogs' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Boards', path: '/boards' },
    { label: 'Contact', path: '/contact' },
  ]

  const supportLinks = [
    { label: 'Partner With Us', path: '/partner' },
    { label: 'Help', path: '/contact' },
    { label: 'FAQ', path: '#' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', path: '#' },
  ]

  return (
    <footer className="bg-card border-t border-border text-foreground px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto">
        {/* Yearly Theme Section */}
        <div className="mb-12 sm:mb-16 pb-8 sm:pb-12 border-b border-border">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-semibold mb-2 sm:mb-3">
              {new Date().getFullYear()} Theme
            </p>
            <h3
              className="text-2xl sm:text-3xl text-accent mb-2 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Walking in the Word: Equipped for Every Good Work
            </h3>
            <p className="text-sm text-muted-foreground font-light">
              2 Timothy 3:16–17 - "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work."
            </p>
          </div>
        </div>

        {/* Footer Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-10 sm:mb-12">
          {/* Logo Area */}
          <div className="md:col-span-5 lg:col-span-6">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img
                src={logoImage}
                alt="GHAMSU Logo"
                className="h-14 sm:h-16 w-auto"
              />

              <div>
                <h3
                  className="text-sm sm:text-base tracking-wider leading-tight"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  GHANA METHODIST
                  <br />
                  STUDENT&apos;S UNION
                </h3>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Ambassadors for Christ, walking in the word and equipped for every good work.
            </p>
          </div>

          {/* Links Area */}
          <div className="md:col-span-7 lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">
                Explore
              </h4>
              <ul className="space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">
                Resources
              </h4>
              <ul className="space-y-3">
                {resourcesLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">
                Support
              </h4>
              <ul className="space-y-3">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            
          </div>
        </div>

        {/* Bottom Text */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ghana Methodist Student&apos;s Union. All rights reserved.
          </p>

          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <span className="text-accent font-semibold">
              Publications & Communications Board
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}