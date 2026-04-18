import { motion } from "motion/react";
import { Heart, Users, Lightbulb, HandHeart,  Globe2, Smartphone, Tv, Radio, ArrowRight } from "lucide-react";
import { Link } from "react-router";

const boards = [
  
  {
    id: 2,
    slug: "publication-communication-board",
    name: "Publication & Communication Board",
    hostLocal: "UG Local",
    description: "Managing official publications and communications across the connexion",
    image: "https://images.unsplash.com/photo-1775926766081-4b8764c05488?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 1,
    slug: "project-board",
    name: "Project Board",
    hostLocal: "UCC Local",
    description: "Overseeing and coordinating connexional projects and initiatives",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    slug: "audit-board",
    name: "Audit Board",
    hostLocal: "UPSA Local",
    description: "Ensuring financial accountability and transparency in all operations",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    slug: "medical-board",
    name: "Medical Board",
    hostLocal: "KORLE-BU Local",
    description: "Providing health guidance and welfare support for members",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    slug: "prayer-board",
    name: "Prayer Board",
    hostLocal: "KNUST Local",
    description: "Coordinating intercession and spiritual covering for the connexion",
    image: "https://images.unsplash.com/photo-1438232992991-995b671e4668?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    slug: "research-education-board",
    name: "Research & Education Board",
    hostLocal: "UEW Local",
    description: "Driving academic excellence, research, and educational development",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
  },
];

const ministries = [
  {
    id: 1,
    name: "GHAMSU MISSIONS",
    icon: Globe2,
    description: "Outreach and evangelistic initiatives to spread the Gospel and establish new congregations in unreached areas",
  },
  {
    id: 2,
    name: "Students in Church Evangelism",
    icon: HandHeart,
    description: "Winning souls and spreading the Gospel within church communities through outreach and evangelistic activities",
  },
  {
    id: 3,
    name: "CONNEXTIONAL PRAYER CONFERENCE",
    icon: Radio,
    description: "Connexional program organized annually to foster spiritual growth and intercession among members",
  },
  {
    id: 4,
    name: "Students in Digital Evangelism",
    icon: Smartphone,
    description: "Spreading the Gospel through digital platforms, social media, and online content creation to reach a wider audience",
  },
];

export function MinistriesSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* ── BOARDS SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3"></p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Connexional Boards
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Supporting the Connexional Executives in discharging their duties effectively
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {boards.map((board, index) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/boards/${board.slug}`} className="block group">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Board Image */}
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={board.image}
                      alt={board.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/30 to-transparent" />
                    {/* Host Local Badge */}
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      {board.hostLocal}
                    </div>
                    {/* "View Details" hover overlay */}
                    <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="flex items-center gap-2 text-white font-semibold text-sm bg-orange-500 px-4 py-2 rounded-full shadow-lg">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                      {board.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {board.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-gray-500">Host Local:</span>
                        <span className="text-orange-500">{board.hostLocal}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── DIVIDER ── */}
        <div className="flex items-center gap-4 mb-20">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm font-medium uppercase tracking-widest">GHAMSU MAJOR ACTIVITIES</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ── MINISTRIES SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">Get Involved</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Major Connexional Programs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get to know our major programs and how you can be part of the impact on campus and beyond
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {ministries.map((ministry, index) => (
            <motion.div
              key={ministry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md group overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg"
                >
                  <ministry.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                </motion.div>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                  {ministry.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {ministry.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── CALL TO ACTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Serve and Make a Difference?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join one of our vibrant programs and use your gifts to impact lives,
            grow spiritually, and build God's kingdom on campus and beyound.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-lg hover:shadow-xl">
                Join us
              </button>
            </Link>
            <Link to="/about">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-md font-semibold transition-all border border-white/30">
                Learn More
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ── WHY JOIN ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900">
            Why Join GHAMSU MISSIONS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Spiritual Growth", description: "Deepen your faith and relationship with God through active service", icon: Heart },
              { title: "Spread the Gospel", description: "Spread chirst in an unreach community by doing your national service there", icon: Lightbulb },
              { title: "Build Community", description: "Form lasting friendships with like-minded believers", icon: Users },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}