import { motion } from "motion/react";
import { Music, Heart, Megaphone, BookOpen, Users, HandHeart, Lightbulb, Video } from "lucide-react";
import { Link } from "react-router";

const ministries = [
  {
    id: 1,
    name: "Choir & Music Ministry",
    icon: Music,
    description: "Leading worship through song and inspiring hearts with melody",
    members: "250+",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Prayer Ministry",
    icon: Heart,
    description: "Interceding for our members and campuses in powerful prayer",
    members: "180+",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Evangelism Ministry",
    icon: Megaphone,
    description: "Sharing the Gospel and winning souls for Christ on campus",
    members: "200+",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Bible Study Ministry",
    icon: BookOpen,
    description: "Deep diving into God's Word for spiritual growth and maturity",
    members: "300+",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Ushering Ministry",
    icon: Users,
    description: "Creating welcoming environments and serving with excellence",
    members: "150+",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Welfare & Outreach",
    icon: HandHeart,
    description: "Caring for members and serving communities in need",
    members: "120+",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Creative Arts Ministry",
    icon: Lightbulb,
    description: "Expressing faith through drama, poetry, and visual arts",
    members: "100+",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Media & Tech Ministry",
    icon: Video,
    description: "Amplifying our message through digital platforms and technology",
    members: "80+",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
  },
];

export function MinistriesSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">Get Involved</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Our Ministries
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your calling and serve with your unique gifts and talents
          </p>
        </motion.div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {ministries.map((ministry, index) => (
            <motion.div
              key={ministry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md hover-lift group overflow-hidden border border-gray-100"
            >
              {/* Ministry Icon/Image */}
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
                  >
                    <ministry.icon className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                  {ministry.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {ministry.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>{ministry.members} members</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action Section */}
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
            Join one of our vibrant ministries and use your gifts to impact lives, 
            grow spiritually, and build God's kingdom on campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-lg hover:shadow-xl">
                Join a Ministry
              </button>
            </Link>
            <Link to="/about">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-md font-semibold transition-all border border-white/30">
                Learn More
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Ministry Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900">
            Why Join a Ministry?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Spiritual Growth",
                description: "Deepen your faith and relationship with God through active service",
                icon: Heart,
              },
              {
                title: "Develop Skills",
                description: "Learn new skills and discover hidden talents while serving",
                icon: Lightbulb,
              },
              {
                title: "Build Community",
                description: "Form lasting friendships with like-minded believers",
                icon: Users,
              },
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
