import { useState, useEffect } from 'react'
import { Menu, X, Moon, Sun, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import logoImage from '../../images/logo.png'

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBlogDropdownOpen, setIsBlogDropdownOpen] = useState(false)
  const [isMobileBlogOpen, setIsMobileBlogOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Sermons', path: '/sermons' },
    { label: 'Events', path: '/events' },
    { label: 'Boards', path: '/boards' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
  ]

  const blogDropdownItems = [
    { label: 'All Posts', path: '/blogs#all-posts' },
    { label: 'News', path: '/blogs#news' },
    { label: 'Articles', path: '/blogs#articles' },
  ]

  const isActive = (path: string) => location.pathname === path
  const isBlogActive = location.pathname.includes('/blogs')

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-transparent'
            : 'bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className={`flex justify-between items-center transition-all duration-300 ${
            isScrolled ? 'h-16 sm:h-18 lg:h-20' : 'h-18 sm:h-20 lg:h-24'
          }`}>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 sm:gap-3.5 group flex-shrink-0">
              <motion.div
                whileHover={{ rotate: -5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#D4AF37]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={logoImage}
                  alt="GHAMSU Logo"
                  className={`relative h-11 sm:h-12 lg:h-14 w-auto transition-all duration-300`}
                />
              </motion.div>

              <AnimatePresence>
                {!isScrolled && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                    exit={{ opacity: 0, x: -10, width: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col leading-none overflow-hidden whitespace-nowrap"
                  >
                    <h1
                      className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight"
                      style={{
                        fontFamily: 'Drizzle, var(--font-heading)',
                        letterSpacing: '-0.02em',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      GHAMSU
                    </h1>
                    <p
                      className="text-[8px] sm:text-[10px] lg:text-[11px] font-bold tracking-[0.18em] mt-0.5"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: '#D4AF37',
                      }}
                    >
                      GHANA METHODIST STUDENTS' UNION
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {/* Desktop Navigation Pill */}
            <div className="hidden lg:flex items-center">
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/15 shadow-lg shadow-black/10 transition-all duration-500"
              >
                {navLinks.slice(0, 6).map((link) => {
                  const active = isActive(link.path)
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="relative px-3.5 py-1.5 rounded-full"
                    >
                      {active && (
                        <motion.div
                          layoutId="desktop-nav-pill"
                          className="absolute inset-0 rounded-full bg-[#003D82] shadow-lg shadow-[#003D82]/25"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span
                        className={`relative z-10 text-[12.5px] font-semibold tracking-wide transition-colors duration-300 ${
                          active ? 'text-white' : 'text-white/80 hover:text-white'
                        }`}
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {link.label}
                      </span>
                    </Link>
                  )
                })}

                {/* Blog Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsBlogDropdownOpen(true)}
                  onMouseLeave={() => setIsBlogDropdownOpen(false)}
                >
                  <button
                    className="relative px-3.5 py-1.5 rounded-full flex items-center gap-1"
                  >
                    {isBlogActive && (
                      <motion.div
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 rounded-full bg-[#003D82] shadow-lg shadow-[#003D82]/25"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative z-10 text-[12.5px] font-semibold tracking-wide transition-colors duration-300 ${
                        isBlogActive ? 'text-white' : 'text-white/80 hover:text-white'
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Blog
                    </span>
                    <motion.div
                      animate={{ rotate: isBlogDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-10"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 ${isBlogActive ? 'text-white' : 'text-white/70'}`}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isBlogDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-52"
                      >
                        <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/10 p-1.5 overflow-hidden">
                          {blogDropdownItems.map((item, idx) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="block group/item relative"
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-foreground/80 hover:text-[#003D82] hover:bg-[#003D82]/5 transition-all duration-200 flex items-center justify-between"
                                style={{ fontFamily: 'var(--font-body)' }}
                              >
                                <span>{item.label}</span>
                                <span className="w-1 h-1 rounded-full bg-[#D4AF37] opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/contact"
                  className="relative px-3.5 py-1.5 rounded-full"
                >
                  {isActive('/contact') && (
                    <motion.div
                      layoutId="desktop-nav-pill"
                      className="absolute inset-0 rounded-full bg-[#003D82] shadow-lg shadow-[#003D82]/25"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 text-[12.5px] font-semibold tracking-wide transition-colors duration-300 ${
                      isActive('/contact') ? 'text-white' : 'text-white/80 hover:text-white'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Contact
                  </span>
                </Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme toggle */}
              {mounted && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="relative p-2.5 rounded-full bg-black/30 hover:bg-black/40 border border-white/15 backdrop-blur-xl transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-[#D4AF37]" />
                      ) : (
                        <Moon className="w-4 h-4 text-white" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Give / Donate CTA — Desktop only */}
              <Link
                to="/partner"
                className="hidden lg:block"
              >
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative px-5 py-2.5 rounded-full overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D67A 50%, #D4AF37 100%)',
                    backgroundSize: '200% 100%',
                  }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #003D82 0%, #0052B0 100%)',
                    }}
                  />
                  <span
                    className="relative z-10 text-[12.5px] font-bold tracking-wider text-[#003D82] group-hover:text-white transition-colors duration-300"
                    style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.08em' }}
                  >
                    GIVE
                  </span>
                </motion.div>
              </Link>

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative p-2.5 rounded-full bg-black/30 hover:bg-black/40 border border-white/15 backdrop-blur-xl transition-all duration-300"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMobileMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5 text-white" />
                    ) : (
                      <Menu className="w-5 h-5 text-white" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu — Full screen overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden bg-background/98 backdrop-blur-2xl pt-20 sm:pt-24 overflow-y-auto"
          >
            <div className="px-6 py-8">
              {/* Decorative top accent */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
                <span
                  className="text-[10px] font-bold tracking-[0.25em] text-[#D4AF37]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  MENU
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
              </div>

              <div className="space-y-1">
                {navLinks.slice(0, 6).map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center justify-between py-4 px-4 rounded-2xl transition-all duration-300 ${
                        isActive(link.path)
                          ? 'bg-[#003D82] text-white shadow-lg shadow-[#003D82]/25'
                          : 'text-foreground hover:bg-[#003D82]/5 hover:text-[#003D82]'
                      }`}
                    >
                      <span
                        className="text-base font-semibold tracking-wide"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {link.label}
                      </span>
                      <motion.span
                        className={`text-xl ${
                          isActive(link.path) ? 'text-[#D4AF37]' : 'text-[#D4AF37]/0 group-hover:text-[#D4AF37]'
                        } transition-colors duration-300`}
                      >
                        →
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Blog Dropdown */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 6 * 0.04, duration: 0.3 }}
                >
                  <button
                    onClick={() => setIsMobileBlogOpen(!isMobileBlogOpen)}
                    className={`w-full flex items-center justify-between py-4 px-4 rounded-2xl transition-all duration-300 ${
                      isBlogActive
                        ? 'bg-[#003D82] text-white shadow-lg shadow-[#003D82]/25'
                        : 'text-foreground hover:bg-[#003D82]/5 hover:text-[#003D82]'
                    }`}
                  >
                    <span
                      className="text-base font-semibold tracking-wide"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Blog
                    </span>
                    <motion.div
                      animate={{ rotate: isMobileBlogOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown className={`w-5 h-5 ${isBlogActive ? 'text-[#D4AF37]' : 'text-foreground/60'}`} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isMobileBlogOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 ml-4 pl-4 border-l-2 border-[#D4AF37]/30 space-y-1 py-1">
                          {blogDropdownItems.map((item, idx) => (
                            <motion.div
                              key={item.path}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Link
                                to={item.path}
                                onClick={() => {
                                  setIsMobileMenuOpen(false)
                                  setIsMobileBlogOpen(false)
                                }}
                                className={`block py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                                  isActive(item.path)
                                    ? 'text-[#003D82] bg-[#003D82]/5'
                                    : 'text-foreground/70 hover:text-[#003D82] hover:bg-[#003D82]/5'
                                }`}
                                style={{ fontFamily: 'var(--font-body)' }}
                              >
                                {item.label}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 7 * 0.04, duration: 0.3 }}
                >
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center justify-between py-4 px-4 rounded-2xl transition-all duration-300 ${
                      isActive('/contact')
                        ? 'bg-[#003D82] text-white shadow-lg shadow-[#003D82]/25'
                        : 'text-foreground hover:bg-[#003D82]/5 hover:text-[#003D82]'
                    }`}
                  >
                    <span
                      className="text-base font-semibold tracking-wide"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Contact
                    </span>
                    <span
                      className={`text-xl ${
                        isActive('/contact') ? 'text-[#D4AF37]' : 'text-[#D4AF37]/0 group-hover:text-[#D4AF37]'
                      } transition-colors duration-300`}
                    >
                      →
                    </span>
                  </Link>
                </motion.div>
              </div>

              {/* Mobile Give CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-8 pt-8 border-t border-border/50"
              >
                <Link
                  to="/partner"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <div
                    className="relative w-full py-4 rounded-2xl text-center overflow-hidden shadow-xl shadow-[#D4AF37]/20"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F4D67A 50%, #D4AF37 100%)',
                    }}
                  >
                    <span
                      className="relative z-10 text-base font-bold tracking-[0.15em] text-[#003D82]"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      GIVE & PARTNER
                    </span>
                  </div>
                </Link>

                <p
                  className="text-center text-xs text-foreground/50 mt-6 tracking-wider"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  GHANA METHODIST STUDENTS' UNION
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}