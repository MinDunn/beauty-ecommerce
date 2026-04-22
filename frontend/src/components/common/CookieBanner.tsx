import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('glowzy_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('glowzy_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('glowzy_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '-50%', y: 100, opacity: 0 }}
          animate={{ x: '-50%', y: 0, opacity: 1 }}
          exit={{ x: '-50%', y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-3xl"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-transparent pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-primary-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
              <Shield size={32} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">Chúng tôi trân trọng quyền riêng tư của bạn</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed italic">
                Glowzy sử dụng cookie để mang lại trải nghiệm cá nhân hóa và phân tích hiệu quả hoạt động. Bằng cách nhấp vào "Chấp nhận", bạn đồng ý với việc sử dụng cookie của chúng tôi theo{' '}
                <Link to="/privacy" className="text-primary-600 font-black hover:underline">Chính sách bảo mật</Link>
                {' '}(NĐ 13/2023/NĐ-CP).
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-4 bg-gray-50 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px]"
              >
                Từ chối
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none px-8 py-4 bg-primary-500 text-white font-black rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
              >
                <Check size={16} strokeWidth={3} />
                Chấp nhận
              </button>
            </div>

            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
