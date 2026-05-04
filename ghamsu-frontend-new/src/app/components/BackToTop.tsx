import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-accent text-accent-foreground border-2 border-accent hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 flex items-center justify-center group"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />
        </button>
      )}
    </>
  );
}
