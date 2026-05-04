import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useLocation } from 'react-router';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Sermons', path: '/sermons' },
    { label: 'Events', path: '/events' },
    { label: 'Boards', path: '/boards' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Blog', path: '/blogs' },
    { label: 'Contact', path: '/contact' },
    { label: 'Give', path: '/partner' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/98 backdrop-blur-xl border-b border-border'
          : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}
    >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-3">
                <div className={`w-12 h-12 border-2 flex items-center justify-center ${
                  isScrolled ? 'border-primary' : 'border-white'
                }`}>
                  <span className={`text-2xl font-bold ${
                    isScrolled ? 'text-primary' : 'text-white'
                  }`} style={{ fontFamily: 'var(--font-heading)' }}>G</span>
                </div>
                <h1
                  className={`text-sm tracking-wide font-semibold transition-colors ${
                    isScrolled ? 'text-foreground' : 'text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.08em' }}
                >
                  GHANA METHODIST<br />STUDENT'S UNION
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[13px] font-medium tracking-wide transition-all duration-300 relative group ${
                    location.pathname === link.path
                      ? 'text-accent'
                      : isScrolled
                      ? 'text-foreground hover:text-accent'
                      : 'text-white/90 hover:text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-300 ${
                    location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-6">
              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`p-2.5  transition-all duration-300 ${
                    isScrolled
                      ? 'hover:bg-secondary'
                      : 'hover:bg-white/10'
                  }`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className={`w-[18px] h-[18px] ${isScrolled ? 'text-foreground' : 'text-white'}`} />
                  ) : (
                    <Moon className={`w-[18px] h-[18px] ${isScrolled ? 'text-foreground' : 'text-white'}`} />
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
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block text-sm font-medium tracking-wide transition-colors ${
                    location.pathname === link.path
                      ? 'text-accent'
                      : 'text-foreground hover:text-accent'
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
  );
}
