import { motion } from "motion/react";
import { UserPlus, CheckCircle, Sparkles, Users, Award, Heart } from "lucide-react";
import { useState } from "react";

export function JoinSection() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    university: "",
    level: "",
    program: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Membership form submitted:", formData);
    alert("Welcome to GHAMSU! We'll contact you shortly with next steps.");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      university: "",
      level: "",
      program: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    { icon: Award, number: "100+", label: "Locals" },
    { icon: Heart, number: "60+", label: "Years of Impact" },
  ];

  return (
    <section id="join" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-4">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600">Become a Member</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Join GHAMSU Today
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Be part of a transformative Christian community that will shape your university experience and beyond
          </p>
        </motion.div>

        {/* Stats Bar */}
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
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-blue-200">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Membership Benefits */}
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
                Join a vibrant community of faith-filled students and unlock these amazing benefits:
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

            {/* CTA Box */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-lg text-white">
              <h4 className="text-2xl font-bold mb-3">Ready to Transform Your Campus Life?</h4>
              <p className="text-white/90 mb-6 leading-relaxed">
                Join thousands of students who are making a difference for Christ on their campuses. Your journey to spiritual growth and leadership starts here.
              </p>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-sm font-semibold">Over 200+ students joined this month</span>
              </div>
            </div>
          </motion.div>

          {/* Sign-up Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-gray-200"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Membership Registration</h3>
            <p className="text-gray-600 mb-8">Fill in your details below to get started</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="+233 XX XXX XXXX"
                />
              </div>

              <div>
                <label htmlFor="university" className="block text-gray-700 font-semibold mb-2">
                  University <span className="text-red-500">*</span>
                </label>
                <select
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                >
                  <option value="">Select your university</option>
                  <option value="UG">University of Ghana</option>
                  <option value="KNUST">KNUST</option>
                  <option value="UCC">University of Cape Coast</option>
                  <option value="UEW">University of Education, Winneba</option>
                  <option value="GTU">Ghana Technology University</option>
                  <option value="UMAT">UMaT</option>
                  <option value="UDS">University for Development Studies</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="level" className="block text-gray-700 font-semibold mb-2">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  >
                    <option value="">Select level</option>
                    <option value="100">Level 100</option>
                    <option value="200">Level 200</option>
                    <option value="300">Level 300</option>
                    <option value="400">Level 400</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="program" className="block text-gray-700 font-semibold mb-2">
                    Program
                  </label>
                  <input
                    type="text"
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder="e.g., Medicine"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Join GHAMSU Now
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
