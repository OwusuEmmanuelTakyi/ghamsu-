import { motion } from "motion/react";
import { Quote, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router";

const testimonials = [
  {
    id: 1,
    name: "Akua Mensah",
    role: "Computer Science Student, UG",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    text: "GHAMSU has been a blessing to my university life. I've found true friends who support me spiritually.",
    rating: 5,
  },
  {
    id: 2,
    name: "Kwame Asante",
    role: "Business Administration, KNUST",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    text: "The leadership training and spiritual growth I've experienced here is unmatched. Highly recommend!",
    rating: 5,
  },
  {
    id: 3,
    name: "Ama Boateng",
    role: "Medicine, UCC",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    text: "Being part of GHAMSU helped me balance my faith with my demanding academic schedule.",
    rating: 5,
  },
];

export function TestimonialsPreview() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">Testimonies</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            What Ambassadors Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real testimonies from students whose lives have been transformed
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-md hover-lift"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <Quote className="w-10 h-10 text-orange-200 mb-4" />
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-md"
          >
            Read More Testimonies
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}