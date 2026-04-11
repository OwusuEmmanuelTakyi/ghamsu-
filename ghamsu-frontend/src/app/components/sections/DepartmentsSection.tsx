import { motion } from "motion/react";
import { Music, Heart, Megaphone, BookOpen, Users, HandHeart, Lightbulb, Video } from "lucide-react";

const departments = [
  {
    id: 1,
    name: "Choir & Music",
    icon: Music,
    description: "Leading worship through song and inspiring hearts with melody",
    members: "250+",
    color: "purple",
  },
  {
    id: 2,
    name: "Prayer Team",
    icon: Heart,
    description: "Interceding for our members and campuses in powerful prayer",
    members: "180+",
    color: "blue",
  },
  {
    id: 3,
    name: "Evangelism",
    icon: Megaphone,
    description: "Sharing the Gospel and winning souls for Christ on campus",
    members: "200+",
    color: "purple",
  },
  {
    id: 4,
    name: "Bible Study",
    icon: BookOpen,
    description: "Deep diving into God's Word for spiritual growth and maturity",
    members: "300+",
    color: "blue",
  },
  {
    id: 5,
    name: "Ushering",
    icon: Users,
    description: "Creating welcoming environments and serving with excellence",
    members: "150+",
    color: "purple",
  },
  {
    id: 6,
    name: "Welfare & Outreach",
    icon: HandHeart,
    description: "Caring for members and serving communities in need",
    members: "120+",
    color: "blue",
  },
  {
    id: 7,
    name: "Creative Arts",
    icon: Lightbulb,
    description: "Expressing faith through drama, poetry, and visual arts",
    members: "100+",
    color: "purple",
  },
  {
    id: 8,
    name: "Media & Tech",
    icon: Video,
    description: "Amplifying our message through digital platforms and technology",
    members: "80+",
    color: "blue",
  },
];

export function DepartmentsSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Departments & Units</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Discover your calling and serve with your unique gifts and talents
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="glass-strong rounded-2xl p-6 border border-purple-400/20 hover-lift group cursor-pointer relative overflow-hidden"
            >
              {/* Background glow */}
              <div className={`absolute inset-0 bg-${dept.color}-500/0 group-hover:bg-${dept.color}-500/10 transition-all duration-500 blur-xl`} />
              
              <div className="relative z-10 text-center">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-20 h-20 mx-auto mb-4 rounded-2xl gradient-purple-blue flex items-center justify-center glow-${dept.color} group-hover:glow-purple transition-all`}
                >
                  <dept.icon className="w-10 h-10 text-white" />
                </motion.div>

                {/* Name */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient transition-all">
                  {dept.name}
                </h3>

                {/* Description */}
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  {dept.description}
                </p>

                {/* Members Count */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-400/30 group-hover:border-purple-400/60 transition-all">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-200">{dept.members} members</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join a Department CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-white/80 mb-6">
            Ready to serve and make a difference?
          </p>
          <button className="px-8 py-4 rounded-full gradient-purple-blue text-white glow-purple hover:glow-blue transition-all hover-lift">
            Join a Department
          </button>
        </motion.div>
      </div>
    </section>
  );
}
