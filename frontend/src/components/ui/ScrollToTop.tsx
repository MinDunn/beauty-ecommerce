import { useState, useEffect } from 'react';
import { ArrowUpToLine, Phone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {/* Hotline Button - Always visible or based on other logic */}
      <motion.a
        href="tel:18001000"
        initial={{ opacity: 0, scale: 0.5, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="w-11 h-11 md:w-12 md:h-12 bg-primary-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-primary-600 transition-all duration-300 active:scale-90 group relative"
        title="Hotline: 1800 1000"
      >
        <Phone size={20} />
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hotline: 1800 1000
        </span>
      </motion.a>

      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            onClick={scrollToTop}
            className="w-11 h-11 md:w-12 md:h-12 bg-white border border-primary-100 text-primary-500 rounded-full shadow-2xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300 active:scale-90 group"
            aria-label="Scroll to top"
          >
            <ArrowUpToLine size={20} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
