import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATIC_BANNERS = [
  {
    id: 4,
    image: "https://media.vneconomy.vn/images/upload/2025/04/08/roundup-korean-skincare-2048px-9736-2x1-1.jpg",
    title: "Vẻ Đẹp Hoàn Mỹ",
    campaign: "Premium Collection",
    subtitle: "Nâng tầm phong cách sống với những sản phẩm làm đẹp đẳng cấp, được tuyển chọn khắt khe dành riêng cho bạn.",
  },
  {
    id: 3,
    image: "https://owa.bestprice.vn/images/articles/uploads/tu-a-z-kinh-nghiem-mua-my-pham-han-quoc-chat-luong-tiet-kiem-5e8698f6a74c9.jpg",
    title: "Chăm Sóc Da Chuyên Sâu",
    campaign: "Summer Sale",
    subtitle: "Làn da khỏe mạnh là nền tảng của vẻ đẹp bền vững. Đánh thức vẻ đẹp tự nhiên với liệu trình chăm sóc da từ chuyên gia.",
  },
  {
    id: 2,
    image: "https://thanhnien.mediacdn.vn/Uploaded/dieutrang-qc/2021_10_22/mai-han-duoc-my-pham-2-4439.png",
    title: "Chăm Sóc Da Chuyên Sâu",
    campaign: "Summer Sale",
    subtitle: "Làn da khỏe mạnh là nền tảng của vẻ đẹp bền vững. Đánh thức vẻ đẹp tự nhiên với liệu trình chăm sóc da từ chuyên gia.",
  },
  {
    id: 1,
    image: "https://bizweb.dktcdn.net/100/413/259/articles/lam-my-pham-tu-thien-nhien.jpg?v=1678420307457",
    title: "Thế Giới Trang Điểm",
    campaign: "New Trend 2026",
    subtitle: "Khám phá bộ sưu tập mỹ phẩm thời thượng, giúp bạn tự tin tỏa sáng mọi góc nhìn và tôn vinh phong cách riêng.",
  }
];

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === STATIC_BANNERS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === STATIC_BANNERS.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? STATIC_BANNERS.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-[380px] md:h-[450px] lg:h-[520px] bg-white overflow-hidden mt-0 md:mt-6 md:rounded-[3rem] max-w-7xl mx-auto shadow-2xl group">
      
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {STATIC_BANNERS.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay and Text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/5 to-transparent flex items-center">
              <div className="px-6 md:px-16 w-full max-w-2xl">
                <div 
                  className={`transition-all duration-700 delay-300 transform ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  {/* Badge */}
                  <div className="inline-block px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black uppercase rounded-full mb-4 tracking-[0.2em] shadow-xl shadow-orange-500/20">
                    Premium Quality
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] max-w-[90%] md:max-w-none">
                    {slide.title} <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-300 drop-shadow-sm">
                      {slide.campaign}
                    </span>
                  </h2>
                  
                  {/* Subtitle */}
                  <p className="text-white/90 text-sm md:text-base mb-6 max-w-md font-medium leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                    {slide.subtitle}
                  </p>
                  
                  {/* Action Button */}
                  <Link 
                    to="/category"
                    className="inline-flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all hover:shadow-2xl hover:shadow-orange-200 hover:-translate-y-1 active:scale-95 group/btn uppercase tracking-widest text-xs"
                  >
                    <span>Khám phá ngay</span>
                    <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-sm border border-white/50 flex items-center justify-center text-slate-900 hover:bg-white transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-sm border border-white/50 flex items-center justify-center text-slate-900 hover:bg-white transition-all hover:scale-110 active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-20">
        {STATIC_BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full border-2 border-white/80 ${
              index === currentSlide 
                ? 'w-10 h-3 bg-orange-600 border-orange-600' 
                : 'w-3 h-3 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
