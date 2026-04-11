import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router";
// logo import fixed with Vite URL

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Blogs", href: "/blogs" },
    { name: "Sermons", href: "/sermons" },
    { name: "Boards & Major Activities", href: "/ministries" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.div
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-2xl transition-all duration-300 ${
                !isScrolled ? "bg-white/40 backdrop-blur-md border border-white/20 shadow-sm" : ""
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-300 flex items-center justify-center">
                {(() => {
                  const logo = new URL('../../images/logo.png', import.meta.url).href;
                  return (
                    <img
                      src={logo}
                      alt="GHAMSU Logo"
                      className="w-15 h-15 object-contain"  // increased size
                    />
                  );
                })()}
              </div>
              <div>
                <div className={`text-xl font-bold transition-colors ${!isScrolled ? "text-slate-800" : "text-blue-950"}`}>GHAMSU</div>
                <div className={`text-[10px] font-medium tracking-wide uppercase transition-colors ${!isScrolled ? "text-slate-700" : "text-gray-500"}`}>Ghana Methodist Students' Union</div>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center gap-6 pl-8 pr-2 py-2 rounded-full transition-all duration-300 ${
            !isScrolled 
              ? "bg-white/40 backdrop-blur-md border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.05)] text-slate-800"
              : "bg-transparent text-gray-700"
          }`}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium text-sm transition-colors hover:text-black ${
                  location.pathname === link.href
                    ? "font-bold text-black"
                    : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 rounded-full bg-[#FFD700] hover:bg-[#F3C200] text-black font-semibold transition-all shadow-md ml-2 text-sm"
              >
                Donate
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-full transition-colors ${!isScrolled ? "bg-white/40 backdrop-blur-md text-slate-800" : "text-gray-900"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100/50 shadow-lg"
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left py-2 font-medium transition-colors ${
                  location.pathname === link.href
                    ? "text-blue-900"
                    : "text-gray-700"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="w-full px-6 py-3 rounded-md bg-orange-500 text-white font-semibold">
                Donate
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}