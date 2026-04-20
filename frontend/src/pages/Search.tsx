import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FilterSidebar } from '../components/category/FilterSidebar';
import { ProductCard } from '../components/ui/ProductCard';
import { Filter, ChevronDown, SearchIcon, Loader2 } from 'lucide-react';
import { productService } from '../api/productService';
import { toast } from 'react-hot-toast';

const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Filter states
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedOnSale, setSelectedOnSale] = useState(false);

  const handleFilterChange = (type: 'price' | 'skinType' | 'offer' | 'rating', value: any) => {
     if (type === 'price') {
        setSelectedPriceRange(prev => prev === value ? null : value);
     } else if (type === 'skinType') {
        setSelectedSkinTypes(prev => prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]);
     } else if (type === 'offer') {
       setSelectedOnSale(prev => !prev);
     } else if (type === 'rating') {
       // Logic for rating filter if needed
     }
  };

  const clearFilters = () => {
    setSelectedPriceRange(null);
    setSelectedSkinTypes([]);
    setSelectedOnSale(false);
  };

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let minPrice, maxPrice;
        if (selectedPriceRange === 'p1') { maxPrice = 100000; }
        else if (selectedPriceRange === 'p2') { minPrice = 100000; maxPrice = 300000; }
        else if (selectedPriceRange === 'p3') { minPrice = 300000; maxPrice = 500000; }
        else if (selectedPriceRange === 'p4') { minPrice = 500000; }

        const response = await productService.searchProducts({
          keyword: query,
          minPrice,
          maxPrice,
          page: 0, // Reset to page 0 on filter change
          size: 20
        });

        // Response from Spring Data Page object: { content: [...], totalElements: ... }
        setProducts(response.content || []);
        setTotalElements(response.totalElements || 0);
      } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        toast.error('Không thể tải danh sách sản phẩm.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [query, selectedPriceRange]); // For now only keyword and price

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-slate-900 py-16 mb-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex items-center space-x-2 text-xs md:text-sm text-primary-400 mb-6 font-bold uppercase tracking-widest">
              <Link to="/" className="hover:text-primary-300 transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-white">Tìm kiếm</span>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-primary-500/20 rounded-2xl">
                 <SearchIcon className="text-primary-500 w-8 h-8" />
               </div>
               <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                 KẾT QUẢ TÌM KIẾM
               </h1>
            </div>
            
            <p className="text-slate-400 font-medium text-lg">
              {query ? (
                <>Đang hiển thị kết quả cho: <span className="text-primary-500 font-black italic">"{query}"</span></>
              ) : (
                <>Tất cả sản phẩm</>
              )}
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="lg:w-1/4 lg:sticky lg:top-24 w-full">
             <FilterSidebar 
              isMobileOpen={isMobileFilterOpen} 
              setIsMobileOpen={setIsMobileFilterOpen}
              selectedPriceRange={selectedPriceRange}
              selectedSkinTypes={selectedSkinTypes}
              selectedOnSale={selectedOnSale}
              onFilterChange={handleFilterChange}
              onReset={clearFilters}
             />
          </div>

          <div className="lg:w-3/4 flex-1 w-full">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between mb-8 shadow-sm gap-4">
              <span className="text-sm text-gray-500 font-medium">Tìm thấy <strong className="text-slate-900 text-2xl font-black">{totalElements}</strong> sản phẩm phù hợp</span>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-sm font-black text-gray-700 uppercase tracking-wide transition-colors"
                >
                  <Filter size={18} /> <span>Lọc SP</span>
                </button>

                <div className="relative group flex-1 sm:flex-none">
                  <button className="w-full flex items-center justify-between px-6 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200 rounded-2xl text-sm font-black text-gray-700 uppercase tracking-wide transition-all">
                    Phổ biến nhất <ChevronDown size={18} className="ml-3 text-gray-400 group-hover:text-primary-500" />
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Đang tìm sản phẩm cho bạn...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    id={product.id.toString()}
                    name={product.name}
                    price={product.currentPrice}
                    originalPrice={product.originalPrice}
                    image={product.imageUrl}
                    views={product.viewCount || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="p-6 bg-white rounded-full shadow-xl mb-6">
                   <SearchIcon size={48} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Rất tiếc, không tìm thấy sản phẩm!</h3>
                <p className="text-gray-500 mb-8 max-w-sm text-center">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bớt các bộ lọc đang chọn.</p>
                <button 
                  onClick={clearFilters}
                  className="px-8 py-3 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

             {products.length > 0 && !isLoading && (
               <div className="mt-20 flex justify-center">
                 <div className="flex space-x-3">
                   <button className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-300">
                      &lt;
                   </button>
                   <button className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center font-black text-white shadow-xl shadow-primary-500/30">
                      1
                   </button>
                   <button className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center font-black hover:border-primary-500 hover:text-primary-600 transition-all">
                      &gt;
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage;
