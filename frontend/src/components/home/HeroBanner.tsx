import { ArrowRight } from 'lucide-react';

export const HeroBanner = () => {
  const banners = [
    {
      id: 1,
      image: '/images/banner.png',
      title: 'Đại Tiệc Skincare',
      subtitle: 'Giảm đến 50% các dòng siêu phẩm chăm sóc da từ Guardian.',
    },
  ];

  return (
    <div className="relative w-full h-[350px] md:h-[450px] lg:h-[550px] bg-slate-900 overflow-hidden mt-0 md:mt-4 md:rounded-3xl max-w-7xl mx-auto shadow-2xl">
      {/* Banner Image Placeholder */}
      <img
        src={banners[0].image}
        alt="Beauty Banner"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      
      {/* Content */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center">
        <div className="px-6 md:px-16 w-full max-w-2xl">
          <div className="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-black uppercase rounded-lg mb-4 tracking-widest shadow-lg shadow-primary-500/30">
            Guardian Độc Quyền
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-4 tracking-tighter">
            {banners[0].title} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-yellow-300">Summer Sale</span>
          </h2>
          <p className="text-gray-200 text-sm md:text-lg mb-8 max-w-md font-medium">
            {banners[0].subtitle}
          </p>
          <button className="flex items-center space-x-2 bg-white text-gray-900 px-6 py-4 md:px-8 md:py-4 rounded-xl font-black hover:bg-primary-50 transition-all hover:scale-105 shadow-xl group uppercase tracking-wider text-sm md:text-base">
            <span>Mua sắm ngay</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
