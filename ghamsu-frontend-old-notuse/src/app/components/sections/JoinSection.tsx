import { motion } from "motion/react";
import { UserPlus, CheckCircle, Sparkles, Users, Award, Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import emailjs from "@emailjs/browser";

export function JoinSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    school: "",
    level: "",
    program: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_MEMBERSHIP_TEMPLATE_ID,
        {
          from_name: formData.fullName,
          from_email: formData.email,
          phone:      formData.phone,
          school:     formData.school,
          level:      formData.level,
          program:    formData.program || "Not specified",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus("success");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        school: "",
        level: "",
        program: "",
      });
      setTimeout(() => setStatus("idle"), 6000);

    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 6000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all";

  const benefits = [
    "Spiritual growth and discipleship",
    "Access to Bible study groups",
    "Leadership development opportunities",
    "Community service projects",
    "Networking with students nationwide",
    "Prayer and counseling support",
    "Exclusive events and conferences",
    "Mentorship programs",
  ];

  const stats = [
    { icon: Users, number: "10000+", label: "Active Members" },
    { icon: Award, number: "100+",   label: "Locals" },
    { icon: Heart, number: "60+",    label: "Years of Impact" },
  ];

  return (
    <section id="join" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-4">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600">
              Become a Member
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Join GHAMSU Today
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Be part of a transformative Christian community that will shape
            your academic experience and beyond
          </p>
        </motion.div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 text-center shadow-lg"
            >
              <stat.icon className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stat.number}
              </div>
              <div className="text-blue-200">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Benefits ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <UserPlus className="w-7 h-7 text-orange-500" />
                Membership Benefits
              </h3>
              <p className="text-gray-600 mb-6">
                Join a vibrant community of faith-filled students and unlock
                these amazing benefits:
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA box */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-lg text-white">
              <h4 className="text-2xl font-bold mb-3">
                Ready to Transform Your Life?
              </h4>
              <p className="text-white/90 mb-6 leading-relaxed">
                Join thousands of students who are making a difference for
                Christ on their campuses. Your journey to spiritual growth
                and leadership starts here.
              </p>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-sm font-semibold">
                  Over 200+ students joined this month
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Registration form ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-200"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Membership Registration
            </h3>
            <p className="text-gray-600 mb-8">
              Fill in your details below to get started
            </p>

            {/* ── Success banner ── */}
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700"
              >
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Welcome to GHAMSU! 🎉</p>
                  <p className="text-sm mt-0.5">
                    We've received your registration and will contact you
                    shortly with next steps.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Error banner ── */}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700"
              >
                <span className="text-lg shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold">Submission failed</p>
                  <p className="text-sm mt-0.5">
                    Please try again or contact us directly on WhatsApp.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Full name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="fullName" name="fullName"
                  value={formData.fullName} onChange={handleChange}
                  required placeholder="Enter your full name"
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleChange}
                  required placeholder="your.email@example.com"
                  className={inputClass}
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel" id="phone" name="phone"
                  value={formData.phone} onChange={handleChange}
                  required placeholder="+233 XX XXX XXXX"
                  className={inputClass}
                />
              </div>

              {/* School — free text */}
              <div>
                <label
                  htmlFor="school"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  School / Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="school" name="school"
                  value={formData.school} onChange={handleChange}
                  required placeholder="e.g. KNUST, Presec, Achimota School..."
                  className={inputClass}
                />
              </div>

              {/* Level + Program */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="level"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Level / Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="level" name="level"
                    value={formData.level} onChange={handleChange}
                    required className={inputClass}
                  >
                    <option value="">Select level</option>
                    <optgroup label="Senior High School">
                      <option value="SHS 1">SHS 1</option>
                      <option value="SHS 2">SHS 2</option>
                      <option value="SHS 3">SHS 3</option>
                    </optgroup>
                    <optgroup label="Tertiary">
                      <option value="Level 100">Level 100</option>
                      <option value="Level 200">Level 200</option>
                      <option value="Level 300">Level 300</option>
                      <option value="Level 400">Level 400</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </optgroup>
                    <optgroup label="Other">
                      <option value="Other">Other</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="program"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Program / Course
                  </label>
                  <input
                    type="text" id="program" name="program"
                    value={formData.program} onChange={handleChange}
                    placeholder="e.g. Medicine, Science..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-4 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-lg font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Join GHAMSU Now
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm">
                By joining, you agree to our community guidelines and values
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}