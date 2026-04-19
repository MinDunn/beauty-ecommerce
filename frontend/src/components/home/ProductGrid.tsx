import { useState, useEffect, useRef, useCallback } from 'react';
import { ProductCard } from '../ui/ProductCard';
import { productService } from '../../api/productService';
import { Loader2, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountdownClock } from './CountdownClock';
import { Link } from 'react-router-dom';

const resolveProductImage = (imageUrl?: string) => {
  if (!imageUrl) {
    return 'https://placehold.co/600x600/f8fafc/64748b?text=Glowzy+Beauty';
  }
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/uploads/')) {
    return imageUrl;
  }
  return `/images/${imageUrl}`;
};

export const ProductGrid = ({ 
  title = "Sản phẩm nổi bật", 
  subtitle,
  type = 'latest',
  isCarousel = false,
  autoPlay = false,
  infinite = true,
  viewAllLink = "/category"
}: { 
  title?: string;
  subtitle?: string;
  type?: 'latest' | 'trending' | 'flash-sale';
  isCarousel?: boolean;
  autoPlay?: boolean;
  infinite?: boolean;
  viewAllLink?: string;
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  const visibleCards = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 3 : 2;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let data;
        if (type === 'trending') {
          const res = await productService.getTrendingProducts(10);
          data = res.data;
        } else if (type === 'flash-sale') {
          const res = await productService.searchProducts({ onSale: true, size: 12, sortBy: 'createdAt,desc' });
          data = res.content;
        } else {
          const res = await productService.searchProducts({ size: 10, sortBy: 'createdAt,desc' });
          data = res.content;
        }
        setProducts(data || []);
        
        if (isCarousel && data && data.length > 0) {
          setCurrentIndex(infinite ? data.length : 0);
        }
      } catch (err) {
        console.error(`Failed to fetch ${type} products for grid`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [type, isCarousel, infinite]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const totalWidth = containerRef.current.offsetWidth;
        const contentWidth = window.innerWidth >= 768 ? totalWidth - 96 : totalWidth;
        setCardWidth(contentWidth / visibleCards);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [products.length, visibleCards]);

  const handleNext = useCallback(() => {
    if (infinite) {
      setCurrentIndex((prev) => (prev + 1));
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, products.length - visibleCards));
    }
  }, [infinite, products.length, visibleCards]);

  const handlePrev = useCallback(() => {
    if (infinite) {
      setCurrentIndex((prev) => (prev - 1));
    } else {
      const nextIdx = Math.max(currentIndex - 1, 0);
      setCurrentIndex(nextIdx);
    }
  }, [infinite, currentIndex]);

  // Infinite Logic
  useEffect(() => {
    if (isCarousel && infinite && products.length > 0) {
      if (currentIndex >= products.length * 3) {
        setCurrentIndex(currentIndex % products.length + products.length);
      } else if (currentIndex < products.length) {
        setCurrentIndex(currentIndex % products.length + products.length);
      }
    }
  }, [currentIndex, products.length, isCarousel, infinite]);

  // AutoPlay logic
  useEffect(() => {
    if (isCarousel && autoPlay && products.length > 0 && !isPaused) {
      const interval = setInterval(handleNext, 4000);
      return () => clearInterval(interval);
    }
  }, [isCarousel, autoPlay, products.length, isPaused, handleNext]);

  const displayIndex = products.length > 0 ? (currentIndex % products.length) : 0;
  
  // Điều kiện để disable nút
  const canGoPrev = infinite || currentIndex > 0;
  const canGoNext = infinite || (products.length > visibleCards && currentIndex < products.length - visibleCards);

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative" ref={containerRef}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-gray-100 pb-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Cụm Tiêu đề Flash Sale - Bỏ nền đen, dùng text accent */}
              <div className="flex items-center">
                {autoPlay && (
                  <div className="bg-primary-50 p-2 rounded-xl mr-3 shadow-inner">
                     <Zap size={22} className="text-primary-500 fill-current" />
                  </div>
                )}
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                  {!autoPlay && <span className="w-2 h-8 bg-primary-500 mr-3 hidden md:inline-block rounded-sm align-middle"></span>}
                  {title}
                </h3>
              </div>
              
              {/* Đồng hồ đếm ngược */}
              {autoPlay && <CountdownClock />}
            </div>

            {/* Dòng mô tả ngay dưới tiêu đề */}
            <p className="text-gray-500 text-sm md:text-base font-medium ml-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
              {subtitle || (isCarousel ? "Săn ngay kẻo lỡ - Ưu đãi giới hạn mỗi ngày" : "Các sản phẩm được yêu thích nhất trong tuần")}
            </p>
          </div>
          
          <Link to={viewAllLink} className="px-8 py-3 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap">
            Xem tất cả
          </Link>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
             <Loader2 className="text-primary-500 animate-spin" size={32} />
             <p className="text-[10px] font-black uppercase text-gray-400">Đang tìm hàng...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="relative">
            <div 
              className={`relative ${isCarousel ? 'md:px-12' : ''} group`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Nút điều hướng bên trái - Luôn hiển thị nếu là Carousel */}
              {isCarousel && (
                <button 
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  className={`absolute left-0 lg:left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 
                    ${canGoPrev 
                      ? 'text-gray-700 hover:bg-primary-500 hover:text-white hover:border-primary-600 active:scale-90' 
                      : 'text-gray-300 cursor-not-allowed opacity-30 lg:opacity-30'
                    }`}
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <div className={isCarousel ? "overflow-hidden" : ""}>
                <motion.div 
                  className={`
                    ${isCarousel 
                      ? 'flex gap-4 md:gap-6 py-4' 
                      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 py-4'
                    }
                  `}
                  animate={isCarousel ? {
                    x: -(currentIndex * cardWidth)
                  } : {}}
                  transition={(isCarousel && infinite && (currentIndex < products.length || currentIndex >= products.length * 3)) ? { duration: 0 } : {
                    type: "spring",
                    stiffness: 80,
                    damping: 18,
                    mass: 0.8
                  }}
                >
                  {(isCarousel && infinite ? [...products, ...products, ...products, ...products] : products).map((product, index) => (
                    <div 
                      key={`${product.id}-${index}`} 
                      className={isCarousel ? 'shrink-0' : ''}
                      style={isCarousel ? { width: cardWidth - (window.innerWidth >= 768 ? 24 : 16) } : {}}
                    >
                      <ProductCard 
                        id={product.id.toString()}
                        name={product.name}
                        price={product.currentPrice}
                        originalPrice={product.originalPrice}
                        image={resolveProductImage(product.imageUrl)}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Nút điều hướng bên phải - Luôn hiển thị nếu là Carousel */}
              {isCarousel && (
                <button 
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className={`absolute right-0 lg:right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 
                    ${canGoNext 
                      ? 'text-gray-700 hover:bg-primary-500 hover:text-white hover:border-primary-600 active:scale-90' 
                      : 'text-gray-300 cursor-not-allowed opacity-30 lg:opacity-30'
                    }`}
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
            
            {isCarousel && (
              <div className="flex justify-center gap-1.5 mt-2 md:hidden">
                {(infinite ? products.slice(0, 5) : products.slice(0, Math.ceil(products.length / visibleCards))).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${displayIndex === i ? 'w-6 bg-primary-500' : 'w-1.5 bg-gray-200'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 font-bold italic">Chưa có sản phẩm nào.</div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <button className="w-full px-6 py-3 border border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
            Xem tất cả sản phẩm
          </button>
        </div>
      </div>
    </section>
  );
};
