import { motion } from "motion/react";
import { Cross, Mail, Phone, MapPin, Heart, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Blogs", href: "/blogs" },
    { name: "Sermons", href: "/sermons" },
    { name: "Gallery", href: "/gallery" },
  ];

  const departments = [
    { name: "GHAMSU MISSIONS", href: "/ministries" },
    { name: "STUDENTS IN CHURCH EVANGELISM", href: "/ministries" },
    { name: "STUDENTS IN DIGITAL EVANGELISM", href: "/ministries" },
    { name: "MEDIA AND PUBLICATIONS", href: "/ministries" },
    { name: "ARTS MINISTRY", href: "/ministries" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="relative overflow-hidden bg-blue-900 text-white">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
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
                <div className="text-xl font-bold text-white">GHAMSU</div>
                <div className="text-xs text-blue-200">Ambassadors in unity and love</div>
              </div>
            </div>
            <p className="text-blue-100 mb-6 leading-relaxed text-sm">
              GHAMSU as the campus ministry department of the church has been in existence for the past sixty years. As a youth organization in the Youth Development Ministry of the Methodist Church Ghana, GHAMSU is extinguished on the various campuses by our colors and our uniforms.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-500 border border-white/20 flex items-center justify-center text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-blue-100 hover:text-orange-400 transition-colors flex items-center gap-2 group text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">MINISTRIES</h3>
            <ul className="space-y-3">
              {departments.map((dept) => (
                <li key={dept.name}>
                  <Link
                    to={dept.href}
                    className="text-blue-100 hover:text-orange-400 transition-colors flex items-center gap-2 group text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {dept.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contact Us</h3>
            <div className="space-y-4">
              <a
                href="mailto:ghamsupcb@gmail.com"
                className="flex items-start gap-3 text-blue-100 hover:text-orange-400 transition-colors group"
              >
                <Mail className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">ghamsupcb@gmail.com</span>
              </a>
              <a
                href="tel:+233240000000"
                className="flex items-start gap-3 text-blue-100 hover:text-orange-400 transition-colors group"
              >
                <Phone className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">+233 24 000 0000</span>
              </a>
              <div className="flex items-start gap-3 text-blue-100">
                <MapPin className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Methodist Church Ghana<br />
                  Accra, Ghana
                </span>
              </div>
              <a
                href="https://wa.me/233240000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all hover:scale-105 shadow-md"
              >
                <FaWhatsapp className="w-4 h-4" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Inspirational Scripture */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 md:p-8 mb-12 border border-white/10 text-center">
          <blockquote className="text-lg md:text-xl italic text-white mb-3">
            "Walking in the Word: Equipped for Every Good Work" - 2 Timothy 3:16–17
          </blockquote>
          <p className="text-orange-400 font-semibold">THEME FOR THE YEAR</p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-blue-200 text-sm text-center md:text-left">
              &copy; {currentYear} Ghana Methodist Students' Union (GHAMSU). All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-blue-200 text-sm">
              <span>Powered by</span>
              <Heart className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
              <span>Publications and Communications Board (PCB)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}