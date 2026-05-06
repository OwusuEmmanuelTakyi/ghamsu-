import { useState, useEffect } from 'react'
import { Menu, X, Moon, Sun, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useLocation } from 'react-router'
import logoImage from '../../images/logo.png'

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBlogDropdownOpen, setIsBlogDropdownOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Sermons', path: '/sermons' },
    { label: 'Events', path: '/events' },
    { label: 'Boards', path: '/boards' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
    { label: 'Give', path: '/partner' },
  ]

  const blogDropdownItems = [
    { label: 'All Posts', path: '/blogs#all-posts' },
    { label: 'News', path: '/blogs#news' },
    { label: 'Articles', path: '/blogs#articles' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-background/98 backdrop-blur-xl border-b border-border' : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src={logoImage} alt="GHAMSU Logo" className={`h-10 sm:h-12 w-auto transition-all duration-300 ${isScrolled ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`} />
              <h1
                className={`text-xs sm:text-sm tracking-wide font-semibold transition-colors ${isScrolled ? 'text-foreground' : 'text-white'}`}
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.08em' }}
              >
                GHANA METHODIST
                <br />
                STUDENT'S UNION
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 lg:gap-10">
            {navLinks.slice(0, 6).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[13px] font-medium tracking-wide transition-all duration-300 relative group ${
                  location.pathname === link.path ? 'text-accent' : isScrolled ? 'text-foreground hover:text-accent' : 'text-white/90 hover:text-white'
                }`}
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}
                />
              </Link>
            ))}

            {/* Blog Dropdown */}
            <div className="relative group">
              <button
                className={`text-[13px] font-medium tracking-wide transition-all duration-300 flex items-center gap-1 ${
                  location.pathname.includes('/blogs') ? 'text-accent' : isScrolled ? 'text-foreground hover:text-accent' : 'text-white/90 hover:text-white'
                }`}
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}
              >
                Blog
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-2">
                {blogDropdownItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-2.5 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      location.pathname === item.path
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground hover:bg-accent/5 hover:text-accent'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {navLinks.slice(6).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[13px] font-medium tracking-wide transition-all duration-300 relative group ${
                  location.pathname === link.path ? 'text-accent' : isScrolled ? 'text-foreground hover:text-accent' : 'text-white/90 hover:text-white'
                }`}
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}
                />
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 transition-all duration-300 ${isScrolled ? 'hover:bg-secondary' : 'hover:bg-white/10'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className={`w-4 sm:w-[18px] h-4 sm:h-[18px] ${isScrolled ? 'text-foreground' : 'text-white'}`} />
                ) : (
                  <Moon className={`w-4 sm:w-[18px] h-4 sm:h-[18px] ${isScrolled ? 'text-foreground' : 'text-white'}`} />
                )}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 ${isScrolled ? 'text-foreground' : 'text-white'}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-xl border-t border-border">
          <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
            {navLinks.slice(0, 6).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block text-sm font-medium tracking-wide transition-colors ${
                  location.pathname === link.path ? 'text-accent' : 'text-foreground hover:text-accent'
                }`}
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Blog Dropdown */}
            <div>
              <button
                onClick={() => setIsBlogDropdownOpen(!isBlogDropdownOpen)}
                className={`flex items-center gap-2 text-sm font-medium tracking-wide transition-colors w-full ${
                  location.pathname.includes('/blogs') ? 'text-accent' : 'text-foreground hover:text-accent'
                }`}
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}
              >
                Blog
                <ChevronDown className={`w-4 h-4 transition-transform ${isBlogDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBlogDropdownOpen && (
                <div className="mt-3 ml-4 space-y-2 border-l border-accent/20 pl-4">
                  {blogDropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block text-sm font-medium transition-colors ${
                        location.pathname === item.path ? 'text-accent' : 'text-foreground hover:text-accent'
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsBlogDropdownOpen(false)
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.slice(6).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block text-sm font-medium tracking-wide transition-colors ${
                  location.pathname === link.path ? 'text-accent' : 'text-foreground hover:text-accent'
                }`}
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}