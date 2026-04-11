import { motion } from "motion/react";
import Slider from "react-slick";
// @ts-ignore
import { Link } from "react-router";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1775847086199-4a541ae87e46?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8Mnx8fGVufDB8fHx8fA%3D%3D",
    quote: "We are therefore Christ’s ambassadors, as though God were making his appeal through us. We implore you on Christ’s behalf: Be reconciled to God.",
    reference: "2 Corinthians 5:20",
  },
  {
    image: "https://images.unsplash.com/photo-1775846636949-43aabf5cb8d9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8Nnx8fGVufDB8fHx8fA%3D%3D",
    quote: " All Scripture is God-breathed (inspired by God) and profitable for teaching, rebuking, correcting, and training in righteousness.",
    reference: "2 Timothy 3:16-17",
  },
  {
    image: "https://images.unsplash.com/photo-1775846986181-aedb2bf687fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NHx8fGVufDB8fHx8fA%3D%3D",
    quote: "Walking in the Word: Equipped for Every Good Work",
    reference: "THEME FOR THE YEAR",
  },
];

export function HeroSection() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    pauseOnHover: false,
  };

  return (
    <section id="home" className="relative h-[70vh] md:h-screen overflow-hidden">
      <Slider {...settings} className="h-full">
        {heroSlides.map((slide, index) => (
          <div key={index} className="h-[70vh] md:h-screen relative">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Deep Blue Overlay */}
            <div className="absolute inset-0 hero-overlay" />

            {/* Content */}
            <div className="relative h-full flex items-center justify-center px-4">
              <div className="max-w-5xl mx-auto text-center mt-16 md:mt-24">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-3xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight text-white"
                >
                  Welcome to <br />
                  Ghana Methodist Students Union
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="mb-6 md:mb-8"
                >
                  <p className="text-orange-400 text-sm md:text-2xl font-semibold mb-2 md:mb-3">
                    Ambassadors in unity and love
                  </p>
                  <blockquote className="text-base md:text-xl text-white/90 mb-2 italic">
                    "{slide.quote}"
                  </blockquote>
                  <p className="text-blue-200 text-xs md:text-sm"> {slide.reference}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mt-8"
                >
                  <Link to="/about">
                    <button className="w-full sm:w-auto px-8 py-4 bg-[#FFD700] hover:bg-[#F3C200] text-black rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transform hover:-translate-y-1 text-sm md:text-base tracking-wide">
                      Learn More
                    </button>
                  </Link>
                  <Link to="/events">
                    <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/30 hover:border-white/50 shadow-lg text-sm md:text-base tracking-wide">
                      View Events
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}