import { motion, useInView } from "motion/react";
import { Target, Eye, Heart,Speaker, Users, Award, BookOpen, Globe } from "lucide-react";
import { useRef, useEffect, useState } from "react";

// Counter animation component
function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = Math.floor(easeOutQuad(progress) * (end - startValue) + startValue);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}</span>;
}

export function AboutSection() {
  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To evangelize and disciple others to a personal faith in Christ, train and bring up spirit-filled leaders who will affect the church and society at large.",
      color: "blue-900",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: " •	To develop Ambassadors in unity and love for Christ •To witness Him to the nations •To build on the strong foundation of the church  •To be responsible contributors to society",
      color: "orange-500",
    },
    {
      icon: Speaker,
      title: "Our Slogan",
      description: "Members of the union for easy interaction and identification use the slogan “Ambassadors for Christ” which shall be anchored on 2 Corinthians 5:20.",
      color: "blue-700",
    },
  ];

  const highlights = [
    {
      icon: Award,
      title: "Excellence",
      description: "Promoting academic and spiritual excellence",
    },
    {
      icon: BookOpen,
      title: "Growth",
      description: "Continuous discipleship and development",
    },
    {
      icon: Globe,
      title: "Impact",
      description: "Making a difference across Ghana",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">Who We Are</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            About GHAMSU
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            GHAMSU as the campus ministry department of the church has been in existence for the past sixty years. As a youth organization in the Youth Development Ministry of the Methodist Church Ghana, GHAMSU is extinguished on the various campuses by our colors and our uniforms. 
            The Union in the past years has been confronted with issues pertaining the usage of our uniform.
          </p>
        </motion.div>

        {/* Statistics with Animated Counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { number: 100, label: "Locals", suffix: "+" },
            { number: 10000, label: "Active Members", suffix: "+" },
            { number: 60, label: "Years of Impact", suffix: "+" },
            { number: 1000, label: "Events Annually", suffix: "+" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-8 text-center shadow-lg hover-lift"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={stat.number} />
                {stat.suffix}
              </div>
              <div className="text-blue-200 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-md hover-lift border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-lg bg-${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* What Makes Us Special */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
            What Makes Us Special
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-4">
                  <highlight.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{highlight.title}</h3>
                <p className="text-gray-600">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                The union was formed in 1965 under the name Ghana Inter-University Methodist Union (GIUMU). The birth of the union is credited to Prof. S.N. Quartey. He was a member of the Methodist youth fellowship (MYF) branch at Shama in the Western region.</p>
              <p>
                There was nothing like a Christian denomination al fellowship on the university campus; Students Christian Movement (SCM) and Scripture Union (SU) were the Christian organizations who held meetings on Saturdays. 
                Two vibrant former students of Trinity Theological Seminary, 
                Rt. Rev. Michael Kumi and Rt. Rev. Blankson enrolled at the University of Ghana 
                during the next academic year of 1996.
              </p>
              <p>
                They were elected as the President and Secretary, respectively, of the group which saw the linking upp with the University of Science and Technology (KNUST) and University of Cape Coast (UCC) into forming the Ghana Inter-University Methodist Union (GIUMU). Eventually, 
                the Union was extended to include other tertiary institutions and second cycle institutions.
                On 8th June, 1984 at Annual Conference, it was decided that henceforth, GHAMSU be constituted by all post-elementary school Methodist students. The 23rd Annual Conference held at UCC FROM 14th-17th April, 1938 was very historical. The new GHAMSU emblem was officially unveiled whilst delegates adopted the 
                GHAMSU anthem which was composed by Bro. Ben Otchere with the tune-name “BENREEN”.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-48 rounded-xl overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1775846606933-7935fb012768?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8M3x8fGVufDB8fHx8fA%3D%3D"
                  alt="GHAMSU Fellowship"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-64 rounded-xl overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1775846986147-d3b6f1560636?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D"
                  alt="GHAMSU Worship"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="h-64 rounded-xl overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1775846986181-aedb2bf687fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NHx8fGVufDB8fHx8fA%3D%3D"
                  alt="GHAMSU Community"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-48 rounded-xl overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1775846986098-5874276cb51a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MTB8fHxlbnwwfHx8fHw%3D"
                  alt="GHAMSU Study"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
