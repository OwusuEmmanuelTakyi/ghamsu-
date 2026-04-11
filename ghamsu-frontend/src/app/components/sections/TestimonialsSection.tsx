import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Akosua Mensah",
    role: "4th Year Medical Student, UG",
    image: "https://images.unsplash.com/photo-1639436926668-2f8b4f32e15a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY2hyaXN0aWFuJTIweW91dGglMjBncm91cCUyMGhhcHB5fGVufDF8fHx8MTc3NTgyNzQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    testimony: "GHAMSU transformed my university experience. I found a spiritual family that supported me through challenges and celebrated my victories. The fellowship helped me grow deeper in faith while excelling academically.",
    rating: 5,
  },
  {
    id: 2,
    name: "Kwame Osei",
    role: "3rd Year Engineering Student, KNUST",
    image: "https://images.unsplash.com/photo-1542032352628-2afb10c773ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnaGFuYSUyMHN0dWRlbnRzJTIwY29tbXVuaXR5JTIwZ2F0aGVyaW5nfGVufDF8fHx8MTc3NTgyNzQ1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    testimony: "Being part of GHAMSU's leadership team taught me servant leadership and accountability. The prayer support and mentorship I received have shaped me into a better Christian and leader.",
    rating: 5,
  },
  {
    id: 3,
    name: "Abena Boateng",
    role: "2nd Year Law Student, UCC",
    image: "https://images.unsplash.com/photo-1620829813795-9855fe1ff0e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwdW5pdmVyc2l0eSUyMHN0dWRlbnRzJTIwd29yc2hpcCUyMHByYXllcnxlbnwxfHx8fDE3NzU4Mjc0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    testimony: "The Bible study sessions and worship experiences in GHAMSU have been life-changing. I've discovered my purpose and learned to trust God in every aspect of my life, especially during exams!",
    rating: 5,
  },
  {
    id: 4,
    name: "Yaw Appiah",
    role: "Final Year Business Student, UEW",
    image: "https://images.unsplash.com/photo-1590585678878-4bea9c6f9a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RpYW4lMjBmZWxsb3dzaGlwJTIweW91dGglMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzU4Mjc0NTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    testimony: "GHAMSU gave me a platform to use my musical gifts in the choir ministry. Through worship, I've experienced God's presence powerfully and have seen lives transformed including my own.",
    rating: 5,
  },
  {
    id: 5,
    name: "Ama Owusu",
    role: "3rd Year Education Student, UEW",
    image: "https://images.unsplash.com/photo-1551802052-b7bc699cd890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWJsZSUyMHN0dWR5JTIwZ3JvdXAlMjB5b3VuZyUyMHBlb3BsZXxlbnwxfHx8fDE3NzU4Mjc0NTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    testimony: "The community outreach programs opened my eyes to serve beyond myself. GHAMSU taught me that Christianity is not just about receiving but also giving back to society.",
    rating: 5,
  },
  {
    id: 6,
    name: "Kofi Mensah",
    role: "2nd Year Science Student, UG",
    image: "https://images.unsplash.com/photo-1756136836696-0e3374ebfbac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY2hvaXIlMjBzaW5naW5nJTIwY2h1cmNofGVufDF8fHx8MTc3NTgyNzQ1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    testimony: "Joining GHAMSU was the best decision I made in university. The friendships formed here are genuine, and the spiritual growth I've experienced is immeasurable. Forever grateful!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Student Testimonies</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Real stories of transformation from our community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-strong rounded-2xl p-8 border border-purple-400/20 hover-lift group relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-500" />
              
              <div className="relative z-10">
                {/* Quote Icon */}
                <div className="w-12 h-12 rounded-full gradient-purple-blue flex items-center justify-center mb-6 glow-purple">
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Testimony */}
                <p className="text-white/90 leading-relaxed mb-6 italic">
                  "{testimonial.testimony}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Student Info */}
                <div className="flex items-center gap-4 border-t border-purple-400/20 pt-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-purple-400/30">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    <p className="text-purple-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
