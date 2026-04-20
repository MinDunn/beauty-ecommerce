import { useState } from 'react';
import { Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { VoucherDrawer } from './VoucherDrawer';

export const VoucherWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed top-48 right-8 z-[900]">
        <motion.button
          animate={{ 
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.05, 1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "loop",
            ease: "easeInOut",
            times: [0, 0.1, 0.2, 0.3, 0.4, 0.5]
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 md:w-20 md:h-20 bg-primary-500 rounded-[2rem] shadow-2xl shadow-primary-500/40 flex items-center justify-center text-white group"
        >
          {/* Glowing Effect */}
          <div className="absolute inset-0 bg-primary-500 rounded-[2rem] animate-ping opacity-20" />
          
          <Gift className="w-7 h-7 md:w-10 md:h-10 relative z-10 transition-transform group-hover:drop-shadow-lg" />
          
          {/* Badge/Pulse */}
          <div className="absolute -top-1 -right-1 w-6 h-6 md:w-7 md:h-7 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse" />
          </div>

          {/* Label - Visible on Hover */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Săn ưu đãi ngay
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-slate-900" />
          </div>

        </motion.button>
      </div>

      <VoucherDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
