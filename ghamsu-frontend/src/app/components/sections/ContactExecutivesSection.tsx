import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { useExecutives } from "../../../lib/hooks";
import { imageUrl } from "../../../lib/sanity";
import type { Executive } from "../../../types/types";
import emailjs from "@emailjs/browser";

// ── Category tabs — values must match schema option values exactly ─────────────
const CATEGORIES: { label: string; value: Executive["category"] }[] = [
  { label: "Connexional Executives", value: "connexional" },
  { label: "Connexional Boards",     value: "Connexional Boards" },
  { label: "Diocese",                value: "Diocese" },
  { label: "Local",                  value: "local" },
];

// ── Contact form ───────────────────────────────────────────────────────────────


// ── Contact form ───────────────────────────────────────────────────────────────
function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name:  formData.name,
          from_email: formData.email,
          phone:      formData.phone,
          subject:    formData.subject,
          message:    formData.message,
          reply_to:   formData.email,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });

      // Reset back to idle after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);

    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="lg:col-span-3 bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        Send Us a Message
      </h2>
      <p className="text-gray-600 mb-8">
        Have a question or want to get involved? Fill out the form below and
        we'll get back to you as soon as possible.
      </p>

      {/* ── Success banner ── */}
      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">
            Message sent! We'll get back to you soon.
          </p>
        </motion.div>
      )}

      {/* ── Error banner ── */}
      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">
            Failed to send. Please try again or contact us directly.
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
              Full Name *
            </label>
            <input
              type="text" id="name" name="name" value={formData.name}
              onChange={handleChange} required placeholder="Your full name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              Email Address *
            </label>
            <input
              type="email" id="email" name="email" value={formData.email}
              onChange={handleChange} required placeholder="your.email@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
              Phone Number
            </label>
            <input
              type="tel" id="phone" name="phone" value={formData.phone}
              onChange={handleChange} placeholder="+233 XX XXX XXXX"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">
              Subject *
            </label>
            <select
              id="subject" name="subject" value={formData.subject}
              onChange={handleChange} required className={inputClass}
            >
              <option value="">Select a subject</option>
              <option value="general">General Inquiry</option>
              <option value="membership">Membership</option>
              <option value="events">Events & Programs</option>
              <option value="testimonies">Testimonies</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
            Message *
          </label>
          <textarea
            id="message" name="message" value={formData.message}
            onChange={handleChange} required rows={6}
            placeholder="Tell us how we can help you..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full py-4 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Send Message
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

// ── Contact info sidebar ───────────────────────────────────────────────────────
function ContactInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="lg:col-span-2 space-y-6"
    >
      {/* Contact card */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-6">Contact Information</h3>

        <div className="space-y-6">
          {[
            { icon: Mail,  label: "Email", href: "mailto:ghamsupcb@gmail.com", text: "ghamsupcb@gmail.com" },
            { icon: Phone, label: "Phone", href: "tel:+233240000000",           text: "+233 24 000 0000" },
          ].map(({ icon: Icon, label, href, text }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">{label}</h4>
                <a href={href} className="text-blue-100 hover:text-white transition-colors">
                  {text}
                </a>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Address</h4>
              <p className="text-blue-100">
                Methodist Church Ghana<br />Head Office, Accra
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <a
            href="https://wa.me/233240000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all font-semibold shadow-md hover:scale-105"
          >
            <FaWhatsapp className="w-6 h-6" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Office hours */}
      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
        <div className="space-y-3 text-gray-600">
          {[
            { day: "Monday - Friday", hours: "9:00 AM - 5:00 PM" },
            { day: "Saturday",        hours: "10:00 AM - 2:00 PM" },
            { day: "Sunday",          hours: "Closed" },
          ].map(({ day, hours }) => (
            <div key={day} className="flex justify-between">
              <span>{day}</span>
              <span className="font-semibold text-gray-900">{hours}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Executive card ─────────────────────────────────────────────────────────────
function ExecutiveCard({ exec, index }: { exec: Executive; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-xl shadow-md hover-lift group overflow-hidden border border-gray-100"
    >
      {/* Profile photo */}
      <div className="h-64 relative overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800">
        {exec.image ? (
          <img
            src={imageUrl(exec.image, 400, 400)}
            alt={exec.name}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-6xl font-bold">
              {exec.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h4 className="text-xl font-bold text-white mb-1 drop-shadow">{exec.name}</h4>
          <p className="text-orange-400 font-semibold text-sm">{exec.position}</p>
        </div>
      </div>

      {/* Contact details */}
      <div className="p-6 space-y-3">
        {exec.phone && (
          <a
            href={`tel:${exec.phone}`}
            className="flex items-center gap-3 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <Phone className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-sm">{exec.phone}</span>
          </a>
        )}

        {exec.email && (
          <a
            href={`mailto:${exec.email}`}
            className="flex items-center gap-3 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <Mail className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-sm truncate">{exec.email}</span>
          </a>
        )}

        {/* WhatsApp button — shown when whatsapp number is set in Sanity */}
        {exec.whatsapp && (
          <a
            href={`https://wa.me/${exec.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-2 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all font-semibold text-sm shadow-md hover:scale-105"
          >
            <FaWhatsapp className="w-4 h-4" />
            WhatsApp
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export function ContactExecutivesSection() {
  const { data: executives, loading, error } = useExecutives();
  const [activeCategory, setActiveCategory] = useState<Executive["category"]>("connexional");

  const filtered = executives?.filter((e) => e.category === activeCategory) ?? [];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* ── Contact form + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-20">
          <ContactForm />
          <ContactInfo />
        </div>

        {/* ── Executive council ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">
              Leadership
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Executives
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Our dedicated officers are here to serve you and guide GHAMSU towards
              God's vision for our union. Feel free to reach out for any inquiries,
              support, or to get involved in our ministries and programs.
            </p>

            {/* Category filter tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === value
                      ? "bg-blue-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-900/10 hover:text-blue-900 border border-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-center text-red-500 py-10">
              Failed to load executives. Please try again later.
            </p>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              No executives listed under this category yet.
            </p>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((exec, index) => (
                <ExecutiveCard key={exec._id} exec={exec} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}