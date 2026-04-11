import { useState, useEffect } from 'react';
import { ProductCard } from '../ui/ProductCard';
import { productService } from '../../api/productService';
import { Loader2 } from 'lucide-react';

export const ProductGrid = ({ title = "Sản phẩm nổi bật" }: { title?: string }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.searchProducts({ size: 5, sortBy: 'createdAt,desc' });
        setProducts(res.content);
      } catch (err) {
        console.error("Failed to fetch products for grid", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center">
              <span className="w-2 h-8 bg-primary-500 mr-3 hidden md:block rounded-sm"></span>
              {title}
            </h3>
            <p className="text-gray-500 mt-2 ml-0 md:ml-5 text-sm md:text-base font-medium">Các sản phẩm được yêu thích nhất trong tuần</p>
          </div>
          <button className="px-6 py-2.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors hidden md:block">
            Xem tất cả
          </button>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
             <Loader2 className="text-primary-500 animate-spin" size={32} />
             <p className="text-[10px] font-black uppercase text-gray-400">Đang tìm hàng...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id.toString()}
                name={product.name}
                price={product.currentPrice}
                originalPrice={product.originalPrice}
                image={`/images/${product.imageUrl}`}
              />
            ))}
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
