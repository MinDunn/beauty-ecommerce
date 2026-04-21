import { useState, useRef } from 'react';
import { Sparkles, ArrowRight, Play, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const articles = [
  {
    category: 'Skincare',
    title: 'Top 5 Serum Vitamin C giúp trắng da và mờ thâm hiệu quả',
    excerpt: 'Chào đón làn da rạng rỡ với bộ sưu tập các dòng Serum Vitamin C đỉnh nhất được tin dùng bởi các chuyên gia...',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=2088&auto=format&fit=crop',
    readTime: '5 phút đọc',
    date: '10/04/2026'
  },
  {
    category: 'Makeup',
    title: 'Bí quyết đánh nền "Clean Girl" mỏng nhẹ như sương',
    excerpt: 'Lấy cảm hứng từ xu hướng tối giản, xu hướng Clean Girl mang lại vẻ ngoài tự nhiên nhưng vẫn đầy cuốn hút...',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070&auto=format&fit=crop',
    readTime: '8 phút đọc',
    date: '08/04/2026'
  },
  {
    category: 'Lifestyle',
    title: 'Chăm sóc sức khỏe tinh thần: Để vẻ đẹp tỏa sáng từ bên trong',
    excerpt: 'Vẻ đẹp không chỉ nằm ở lớp sương bên ngoài mà còn xuất phát từ một tâm hồn mạnh khỏe và cân bằng...',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop',
    readTime: '6 phút đọc',
    date: '05/04/2026'
  }
];

const BeautyGuide = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const articlesRef = useRef<HTMLDivElement>(null);

  const handleScrollToArticles = () => {
    articlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleComingSoon = (feature: string) => {
    toast.success(`${feature} sẽ sớm ra mắt!`, {
      icon: '🚀',
      style: {
        borderRadius: '16px',
        background: '#0f172a',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }
    });
  };

  const filteredArticles = activeCategory === 'Tất cả' 
    ? articles 
    : articles.filter(article => article.category === activeCategory);

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Hero Banner */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
           <div className="max-w-xl">
             <div className="flex items-center gap-2 text-primary-500 font-bold uppercase tracking-widest text-xs mb-6">
                <Sparkles size={16} />
                <span>Xu hướng & Kiến thức</span>
             </div>
             <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-8 italic uppercase">
               Beauty <span className="text-primary-500 underline decoration-4 underline-offset-8">Guide</span>
             </h1>
             <p className="text-slate-300 text-lg font-medium leading-relaxed mb-10">
               Khám phá những bí quyết chăm sóc sắc đẹp, xu hướng trang điểm mới nhất và phong cách sống lành mạnh cùng đội ngũ chuyên gia Glowzy.
             </p>
              <button 
                onClick={handleScrollToArticles}
                className="bg-primary-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center gap-3 active:scale-95"
              >
                <span>Khám phá ngay</span>
                <ArrowRight size={18} />
              </button>
           </div>
        </div>
      </div>

      {/* Featured Video Section */}
      <div className="container mx-auto px-4 max-w-7xl -mt-16 relative z-10">
         <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
            <div className="lg:w-1/2 relative group cursor-pointer">
               <img 
                src="https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=2188&auto=format&fit=crop" 
                alt="Highlight Video"
                className="w-full h-full object-cover aspect-video lg:aspect-square"
               />
               <div 
                 onClick={() => handleComingSoon('Video')}
                 className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-all flex items-center justify-center"
               >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                     <Play className="text-primary-500 fill-primary-500 ml-1" size={32} />
                  </div>
               </div>
            </div>
            <div className="lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
               <span className="text-primary-500 font-bold uppercase tracking-widest text-xs mb-4">Video nổi bật</span>
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight">Hướng dẫn chăm sóc da Routine 5 bước cho người mới bắt đầu</h2>
               <p className="text-gray-500 font-medium mb-10">
                 Cùng chuyên gia da liễu Linh Nguyễn khám phá quy trình chăm sóc da khoa học, đơn giản nhưng mang lại hiệu quả vượt trội cho làn da của bạn.
               </p>
                <button 
                  onClick={() => handleComingSoon('Trình xem Video')}
                  className="flex items-center gap-3 text-slate-900 font-black uppercase text-xs tracking-widest border-b-2 border-primary-500 pb-1 hover:text-primary-600 transition-colors w-max"
                >
                  Xem video hướng dẫn <ArrowRight size={16} />
                </button>
            </div>
         </div>
      </div>

      {/* Article Grid */}
      <div className="container mx-auto px-4 max-w-7xl mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Bài viết mới nhất</h2>
            <p className="text-gray-500 font-medium mt-2">Cập nhật tin tức và mẹo làm đẹp mỗi ngày</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {['Tất cả', 'Skincare', 'Makeup', 'Lifestyle'].map((tag) => (
              <button 
                key={tag}
                onClick={() => setActiveCategory(tag)}
                className={`px-6 py-2 rounded-full border transition-all text-sm font-bold ${
                  activeCategory === tag 
                    ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' 
                    : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-primary-500 hover:text-primary-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div ref={articlesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 scroll-mt-24">
           <AnimatePresence mode="popLayout">
           {filteredArticles.map((item) => (
             <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={item.title} 
              className="group cursor-pointer"
              onClick={() => handleComingSoon('Trang bài viết')}
             >
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-6 shadow-lg">
                   <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase text-primary-600 tracking-widest shadow-sm">
                      {item.category}
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{item.readTime}</span>
                      </div>
                      <span>•</span>
                      <span>{item.date}</span>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 group-hover:text-primary-500 transition-colors leading-snug">
                     {item.title}
                   </h4>
                   <p className="text-gray-500 font-medium text-sm line-clamp-2 leading-relaxed">
                     {item.excerpt}
                   </p>
                   <div className="pt-2 flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                      <span>Đọc tiếp</span>
                      <ArrowRight size={14} />
                   </div>
                </div>
             </motion.div>
           ))}
           </AnimatePresence>
        </div>
        
        <div className="mt-24 text-center">
           <button className="px-12 py-4 border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl">
              Tải thêm bài viết
           </button>
        </div>
      </div>
    </div>
  );
};

export default BeautyGuide;
