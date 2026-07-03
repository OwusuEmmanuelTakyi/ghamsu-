import { useState } from "react";
import { motion } from "motion/react";
import {
  Handshake,
  Heart,
  TrendingUp,
  Users,
  Globe,
  Award,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
} from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { PageHero } from "../components/PageHero";

interface PartnerBenefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PartnershipLevel {
  name: string;
  amount: string;
  benefits: string[];
  highlighted?: boolean;
}

const partnerBenefits: PartnerBenefit[] = [
  {
    icon: <Users className="w-10 h-10" />,
    title: "Reach Students",
    description:
      "Connect with over 100,000 Methodist students across 25+ campuses in Ghana",
  },
  {
    icon: <Heart className="w-10 h-10" />,
    title: "Impact Lives",
    description:
      "Help us transform student lives through spiritual growth and community service",
  },
  {
    icon: <TrendingUp className="w-10 h-10" />,
    title: "Brand Growth",
    description:
      "Increase brand awareness among a highly engaged and loyal demographic",
  },
  {
    icon: <Globe className="w-10 h-10" />,
    title: "National Reach",
    description:
      "Access a network spanning all regions of Ghana with growing influence",
  },
];

const partnershipLevels: PartnershipLevel[] = [
  {
    name: "Bronze Partner",
    amount: "₵5,000 - ₵10,000",
    benefits: [
      "Logo on website",
      "Social media mentions",
      "Event recognition",
      "Quarterly report",
    ],
  },
  {
    name: "Silver Partner",
    amount: "₵10,000 - ₵25,000",
    benefits: [
      "Everything in Bronze",
      "Featured in newsletter",
      "Event sponsorship opportunity",
      "Annual plaque",
      "Media coverage",
    ],
    highlighted: true,
  },
  {
    name: "Gold Partner",
    amount: "₵25,000 - ₵50,000",
    benefits: [
      "Everything in Silver",
      "Executive partnership",
      "Dedicated liaison officer",
      "Custom sponsorship package",
      "Annual gala invitation",
      "Co-branded materials",
    ],
  },
  {
    name: "Platinum Partner",
    amount: "₵50,000+",
    benefits: [
      "Everything in Gold",
      "Board representation option",
      "Strategic partnership meeting",
      "Custom partnership agreement",
      "Exclusive naming rights",
      "VIP event access",
      "Impact reporting",
    ],
  },
];

export function PartnerWithUsPage() {
  const { isDark } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(1);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Partnership form submitted:", formData);
    // Reset form
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? "bg-slate-900" : "bg-white"
    }`}>
      {/* Hero Section */}
      <PageHero
        title="Partner With Us"
        subtitle="Join us in transforming lives and building a stronger GHAMSU community"
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop&q=80"
      />

      {/* Why Partner Section */}
      <section className={`py-20 px-4 transition-colors ${
        isDark ? "bg-slate-800" : "bg-slate-50"
      }`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className={`font-semibold uppercase tracking-wide mb-3 ${
              isDark ? "text-orange-400" : "text-orange-500"
            }`}>
              Why Partner
            </p>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Make a Meaningful Impact
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}>
              Your partnership directly supports our mission to empower Methodist
              students and create lasting change in their lives and communities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partnerBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-8 rounded-xl transition-all hover:shadow-lg ${
                  isDark
                    ? "bg-slate-700 border border-slate-600 hover:border-sky-400"
                    : "bg-white border border-slate-200 hover:border-blue-500 shadow-sm"
                }`}
              >
                <div className={`${isDark ? "text-sky-400" : "text-blue-600"} mb-4`}>
                  {benefit.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  {benefit.title}
                </h3>
                <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Levels Section */}
      <section className={`py-20 px-4 transition-colors ${
        isDark ? "bg-slate-900" : "bg-white"
      }`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className={`font-semibold uppercase tracking-wide mb-3 ${
              isDark ? "text-orange-400" : "text-orange-500"
            }`}>
              Partnership Levels
            </p>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Choose Your Partnership Level
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}>
              Select the partnership level that best fits your organization's
              capacity and vision
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnershipLevels.map((level, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all transform hover:scale-105 ${
                  level.highlighted
                    ? isDark
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl ring-2 ring-orange-400"
                      : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl ring-2 ring-orange-300"
                    : isDark
                    ? "bg-slate-800 border border-slate-700 hover:border-sky-400"
                    : "bg-white border border-slate-200 hover:border-blue-500 shadow-sm"
                }`}
                onClick={() => setSelectedLevel(index)}
              >
                {level.highlighted && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className={`p-8 h-full flex flex-col ${
                  level.highlighted ? "text-white" : isDark ? "text-slate-100" : "text-slate-900"
                }`}>
                  <h3 className="text-2xl font-bold mb-2">{level.name}</h3>
                  <div className="mb-6">
                    <p className={`text-3xl font-bold ${
                      level.highlighted ? "text-white" : isDark ? "text-sky-400" : "text-blue-600"
                    }`}>
                      {level.amount}
                    </p>
                    <p className={`text-sm ${
                      level.highlighted ? "text-white/80" : isDark ? "text-slate-400" : "text-slate-600"
                    }`}>
                      per year
                    </p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {level.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          level.highlighted
                            ? "text-white"
                            : isDark
                            ? "text-orange-400"
                            : "text-orange-500"
                        }`} />
                        <span className={`text-sm ${
                          level.highlighted
                            ? "text-white"
                            : isDark
                            ? "text-slate-300"
                            : "text-slate-700"
                        }`}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`mt-8 w-full py-3 rounded-lg font-semibold transition-all ${
                      level.highlighted
                        ? "bg-white text-orange-600 hover:bg-white/90"
                        : isDark
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Process Section */}
      <section className={`py-20 px-4 transition-colors ${
        isDark ? "bg-slate-800" : "bg-slate-50"
      }`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className={`font-semibold uppercase tracking-wide mb-3 ${
              isDark ? "text-orange-400" : "text-orange-500"
            }`}>
              How It Works
            </p>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Partnership Process
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Initial Conversation",
                description:
                  "Connect with our partnership team to discuss your organization's vision and goals",
              },
              {
                step: "02",
                title: "Partnership Agreement",
                description:
                  "Finalize partnership terms and create a customized plan that works for both parties",
              },
              {
                step: "03",
                title: "Activation & Promotion",
                description:
                  "Launch your partnership with announcement, branding, and strategic visibility",
              },
              {
                step: "04",
                title: "Ongoing Engagement",
                description:
                  "Regular communication, impact reporting, and collaboration on initiatives",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6"
              >
                <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${
                  isDark
                    ? "bg-gradient-to-br from-sky-400 to-blue-500 text-white"
                    : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                }`}>
                  {item.step}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className={`text-xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={`py-20 px-4 transition-colors ${
        isDark ? "bg-slate-900" : "bg-white"
      }`}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className={`font-semibold uppercase tracking-wide mb-3 ${
              isDark ? "text-orange-400" : "text-orange-500"
            }`}>
              Ready to Partner?
            </p>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Get In Touch
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}>
              Fill out the form below and our partnership team will reach out
              within 48 hours
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`space-y-6 p-8 rounded-xl border ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white focus:border-sky-400 focus:ring-sky-400/20"
                      : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white focus:border-sky-400 focus:ring-sky-400/20"
                      : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white focus:border-sky-400 focus:ring-sky-400/20"
                      : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white focus:border-sky-400 focus:ring-sky-400/20"
                      : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white focus:border-sky-400 focus:ring-sky-400/20"
                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Tell us about your organization and partnership interests"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Send Partnership Inquiry
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.form>

          {/* Quick Contact */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 rounded-lg flex items-start gap-4 ${
                isDark
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-slate-50 border border-slate-200"
              }`}
            >
              <Mail className={`w-6 h-6 mt-1 flex-shrink-0 ${
                isDark ? "text-sky-400" : "text-blue-600"
              }`} />
              <div>
                <h3 className={`font-bold mb-1 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Email
                </h3>
                <a href="mailto:partnerships@ghamsu.org" className={`${
                  isDark
                    ? "text-slate-400 hover:text-sky-400"
                    : "text-slate-600 hover:text-blue-600"
                }`}>
                  partnerships@ghamsu.org
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`p-6 rounded-lg flex items-start gap-4 ${
                isDark
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-slate-50 border border-slate-200"
              }`}
            >
              <Phone className={`w-6 h-6 mt-1 flex-shrink-0 ${
                isDark ? "text-sky-400" : "text-blue-600"
              }`} />
              <div>
                <h3 className={`font-bold mb-1 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Phone
                </h3>
                <a href="tel:+233240000000" className={`${
                  isDark
                    ? "text-slate-400 hover:text-sky-400"
                    : "text-slate-600 hover:text-blue-600"
                }`}>
                  +233 24 000 0000
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 px-4 ${
        isDark
          ? "bg-gradient-to-r from-blue-900 to-slate-900"
          : "bg-gradient-to-r from-blue-600 to-blue-700"
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Together, We Can Make a Difference
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join hundreds of organizations already partnering with GHAMSU to
              impact thousands of students
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}