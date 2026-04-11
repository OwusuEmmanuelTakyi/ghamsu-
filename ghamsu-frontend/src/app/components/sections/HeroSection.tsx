import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Slider from "react-slick";
// @ts-ignore
import { Link } from "react-router";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1775847086199-4a541ae87e46?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8Mnx8fGVufDB8fHx8fA%3D%3D",
    heading: "Welcome to \n Ghana Methodist Students Union",
  },
  {
    image: "https://images.unsplash.com/photo-1775846636949-43aabf5cb8d9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8Nnx8fGVufDB8fHx8fA%3D%3D",
    heading: "We are Ambassadors \n in Unity and Love",
  },
  {
    image: "https://images.unsplash.com/photo-1775846986181-aedb2bf687fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NHx8fGVufDB8fHx8fA%3D%3D",
    heading: "Walking in the Word \n Equipped for Every Good Work",
  },
  {
    image: "https://images.unsplash.com/photo-1738743118919-dd556ab6b876?q=80&w=2070&auto=format&fit=crop",
    heading: "Christ's Ambassadors \n Reconciling the World",
  }
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    fade: true,
    pauseOnHover: false,
    beforeChange: (current: number, next: number) => setActiveSlide(next),
  };

  return (
    <section id="home" className="relative h-[70vh] md:h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background Slider - Purely for images */}
      <div className="absolute inset-0 z-0">
        <Slider {...settings} className="h-full">
          {heroSlides.map((slide, index) => (
            <div key={index} className="h-[70vh] md:h-screen relative overflow-hidden">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: activeSlide === index ? 1.15 : 1 }}
                transition={{ duration: 8, ease: "linear" }}
                className="absolute inset-0 bg-cover bg-center origin-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-black/60 md:bg-black/50" />
            </div>
          ))}
        </Slider>
      </div>

      {/* Static Foreground Layer - Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 pointer-events-none">
        <div className="max-w-5xl w-full mx-auto text-center mt-16 md:mt-24 flex flex-col items-center pointer-events-auto">
          
          {/* Dynamic Hero Text Container */}
          <div className="h-[120px] md:h-[200px] flex items-center justify-center mb-6 md:mb-10 w-full">
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-lg text-center"
              >
                {heroSlides[activeSlide].heading.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Static Subtitle / Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex flex-col items-center max-w-3xl"
          >
            <p className="text-[#FFD700] text-sm md:text-xl font-bold mb-4 md:mb-6 tracking-wide drop-shadow-md uppercase">
              Ambassadors for Christ
            </p>
            
            <div className="overflow-hidden mb-2">
              <blockquote className="text-lg md:text-2xl text-white/95 italic font-serif leading-relaxed text-center">
                "We are therefore Christ’s ambassadors, as though God were making his appeal through us."
              </blockquote>
            </div>
            
            <p className="text-gray-300 text-xs md:text-sm font-semibold uppercase tracking-widest mt-4"> 
              — 2 Corinthians 5:20 —
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mt-10 md:mt-12 w-full px-4"
          >
            <Link to="/about" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-[#FFD700] hover:bg-[#F3C200] text-black rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transform hover:-translate-y-1 text-sm md:text-base tracking-wide">
                Learn More
              </button>
            </Link>
            <Link to="/events" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/30 hover:border-white/50 shadow-lg text-sm md:text-base tracking-wide">
                View Events
              </button>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}