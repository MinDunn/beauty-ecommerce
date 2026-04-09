import { ProductCard } from '../ui/ProductCard';
import { products } from '../../data/products';

const featuredProducts = products.filter(p => p.isFeatured).slice(0, 5);

export const ProductGrid = ({ title = "Sản phẩm nổi bật" }: { title?: string }) => {
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <button className="w-full px-6 py-3 border border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
            Xem tất cả sản phẩm
          </button>
        </div>
      </div>
    </section>
  );
};
