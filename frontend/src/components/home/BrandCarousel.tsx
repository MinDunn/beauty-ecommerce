import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export const BrandCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/images/promo-science.png',
      title: 'Skincare Khoa Học',
      subtitle: 'Công nghệ tế bào gốc đột phá.',
      tag: 'Innovation'
    },
    {
      id: 2,
      image: '/images/promo-luxury.png',
      title: 'Vẻ Đẹp Quyền Quý',
      subtitle: 'Trải nghiệm đẳng cấp thượng lưu.',
      tag: 'Luxury'
    },
    {
      id: 3,
      image: '/images/promo-nature.png',
      title: 'Thuần Khiết Tự Nhiên',
      subtitle: '100% chiết xuất từ thảo mộc quý.',
      tag: 'Organic'
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">
              Thương Hiệu <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Đẳng Cấp</span>
            </h3>
            <p className="text-gray-500 font-medium text-lg">
              Đối tác chiến lược toàn cầu của Glowzy.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-500 rounded-full ${
                  index === currentSlide 
                    ? 'w-12 h-2 bg-blue-600' 
                    : 'w-2 h-2 bg-gray-200 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                index === currentSlide 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-105 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              
              {/* Ultra-transparent Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                <div 
                  className={`transition-all duration-700 delay-300 transform ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] font-black uppercase rounded-full mb-4 tracking-[0.2em]">
                    {slide.tag}
                  </span>
                  <h4 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-md">
                    {slide.title}
                  </h4>
                  <p className="text-white/90 text-lg md:text-2xl font-medium mb-8 max-w-xl">
                    {slide.subtitle}
                  </p>
                  <button className="inline-flex items-center space-x-2 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-xl group">
                    <span>Xem bộ sưu tập</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
