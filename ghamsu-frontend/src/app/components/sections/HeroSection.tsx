import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Slider from "react-slick";
// @ts-ignore
import { Link } from "react-router";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1775847086199-4a541ae87e46?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8Mnx8fGVufDB8fHx8fA%3D%3D",
    headingLine1: "Welcome to",
    headingLine2: "Ghana Methodist Students' Union",
    tagline: "Ambassadors in unity and love",
    quote: "We are therefore Christ’s ambassadors, as though God were making his appeal through us. We implore you on Christ’s behalf: Be reconciled to God.",
    reference: "2 Corinthians 5:20",
  },
  {
    image: "https://images.unsplash.com/photo-1775846636949-43aabf5cb8d9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8Nnx8fGVufDB8fHx8fA%3D%3D",
    headingLine1: "Growing Together",
    headingLine2: "In Faith and Excellence",
    tagline: "Rooted in the Word",
    quote: " All Scripture is God-breathed (inspired by God) and profitable for teaching, rebuking, correcting, and training in righteousness.",
    reference: "2 Timothy 3:16-17",
  },
  {
    image: "https://images.unsplash.com/photo-1775846986181-aedb2bf687fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NHx8fGVufDB8fHx8fA%3D%3D",
    headingLine1: "Equipped For",
    headingLine2: "Every Good Work",
    tagline: "Transforming our generation",
    quote: "Walking in the Word: Equipped for Every Good Work",
    reference: "THEME FOR THE YEAR",
  },
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
    <section id="home" className="relative h-[70vh] md:h-screen overflow-hidden bg-black">
      {/* BACKGROUND SLIDER */}
      <div className="absolute inset-0 z-0">
        <Slider {...settings} className="h-full">
          {heroSlides.map((slide, index) => (
            <div key={index} className="h-[70vh] md:h-screen relative overflow-hidden focus:outline-none">
              {/* Cinematic Background Image */}
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: activeSlide === index ? 1.15 : 1 }}
                transition={{ duration: 8, ease: "linear" }}
                className="absolute inset-0 bg-cover bg-center origin-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              
              {/* Deep Blue Overlay */}
              <div className="absolute inset-0 hero-overlay opacity-80" />
            </div>
          ))}
        </Slider>
      </div>

      {/* FOREGROUND CONTENT (STATIC & SYNCED) */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 pointer-events-none pt-[80px] md:pt-[100px]">
        <div className="max-w-5xl mx-auto text-center pointer-events-auto w-full">
          {/* DYNAMIC SLIDE CONTENT (Changes smoothly per slide) */}
          <div className="min-h-[320px] md:min-h-[380px] flex flex-col justify-center mb-6 md:mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full"
              >
                {/* DYNAMIC MAIN TITLE */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-xl"
                >
                  {heroSlides[activeSlide].headingLine1} <br />
                  {heroSlides[activeSlide].headingLine2}
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[#FFD700] text-lg md:text-2xl font-bold mb-6 md:mb-8 tracking-wide drop-shadow-md"
                >
                  {heroSlides[activeSlide].tagline}
                </motion.p>

                <div className="overflow-hidden mb-3 w-full">
                  <motion.blockquote 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xl md:text-3xl text-white/95 italic font-serif leading-relaxed max-w-3xl mx-auto"
                  >
                    "{heroSlides[activeSlide].quote}"
                  </motion.blockquote>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-gray-300 text-xs md:text-sm font-semibold uppercase tracking-widest mt-4 md:mt-6"
                > 
                  — {heroSlides[activeSlide].reference} —
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* STATIC BUTTONS (Animates only once on mount) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"
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
    </section>
  );
}