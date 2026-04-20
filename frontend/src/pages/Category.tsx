import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FilterSidebar } from '../components/category/FilterSidebar';
import { ProductCard } from '../components/ui/ProductCard';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import { productService } from '../api/productService';
import { categoryService } from '../api/categoryService';
import { cn } from '../utils/cn';
import { SEO } from '../components/common/SEO';

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const onSaleParam = queryParams.get('onSale') === 'true';
  const sortParamFromUrl = queryParams.get('sort');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('Khám phá Sản phẩm');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState(sortParamFromUrl === 'latest' ? 'newest' : sortParamFromUrl === 'trending' ? 'trending' : 'newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedOnSale, setSelectedOnSale] = useState(onSaleParam);
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(null);

  const categoryDescriptions: Record<string, string> = {
    'skincare': 'Serum, kem dưỡng, đặc trị, mặt nạ và các sản phẩm chăm sóc da chuyên sâu.',
    'makeup': 'Son môi, phấn nền, chì kẻ mắt, má hồng và bộ sưu tập trang điểm thời thượng.',
    'haircare': 'Dầu gội, dầu xả, tinh dầu dưỡng và các sản phẩm tạo kiểu tóc chuyên nghiệp.',
    'bodycare': 'Sữa tắm, dưỡng thể, tẩy tế bào chết và chăm sóc da toàn thân mịn màng.',
    'perfume': 'Nước hoa nam, nữ, unisex và các dòng tinh dầu thơm cao cấp chính hãng.'
  };

  const normalize = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');

  // Fetch individual category info and all categories
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
        if (slug) {
          const cat = data.find((c: any) => 
            normalize(c.name) === slug || 
            (slug === 'skincare' && c.name === 'Chăm sóc da') ||
            (slug === 'makeup' && c.name === 'Trang điểm') ||
            (slug === 'haircare' && c.name === 'Chăm sóc tóc') ||
            (slug === 'bodycare' && c.name === 'Chăm sóc cơ thể') ||
            (slug === 'perfume' && c.name === 'Nước hoa')
          );
          if (cat) setCategoryName(cat.name);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchMeta();
  }, [slug]);

  useEffect(() => {
    // Luôn cuộn lên đầu khi URL thay đổi
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Đồng bộ state từ URL
    setSelectedOnSale(onSaleParam);
    if (onSaleParam) {
      setCategoryName('Khuyến mãi HOT Deal');
      // Nếu là Hot Deal thì mặc định là mới nhất nếu không có sort khác
      if (!sortParamFromUrl) setSortBy('newest');
    } else if (sortParamFromUrl === 'latest') {
      setCategoryName('Hàng mới về');
      setSortBy('newest');
    } else if (sortParamFromUrl === 'trending') {
      setCategoryName('Sản phẩm yêu thích nhất tuần');
      setSortBy('trending');
    } else if (!slug) {
      setCategoryName('Tất cả sản phẩm');
    }
  }, [slug, onSaleParam, sortParamFromUrl]);

  const fetchProducts = async () => {
    if (slug && categories.length === 0) return;
    setLoading(true);
    try {
      let categoryId = undefined;
      if (slug && categories.length > 0) {
        const cat = categories.find((c: any) => 
          normalize(c.name) === slug || 
          (slug === 'skincare' && c.name === 'Chăm sóc da') ||
          (slug === 'makeup' && c.name === 'Trang điểm') ||
          (slug === 'haircare' && c.name === 'Chăm sóc tóc') ||
          (slug === 'bodycare' && c.name === 'Chăm sóc cơ thể') ||
          (slug === 'perfume' && c.name === 'Nước hoa')
        );
        if (cat) categoryId = cat.id;
      }

      let minPrice = undefined;
      let maxPrice = undefined;
      if (selectedPriceRange) {
        if (selectedPriceRange === 'p1') maxPrice = 100000;
        else if (selectedPriceRange === 'p2') { minPrice = 100000; maxPrice = 300000; }
        else if (selectedPriceRange === 'p3') { minPrice = 300000; maxPrice = 500000; }
        else if (selectedPriceRange === 'p4') minPrice = 500000;
      }

      let sortParam = 'createdAt,desc';
      if (sortBy === 'price-asc') sortParam = 'currentPrice,asc';
      if (sortBy === 'price-desc') sortParam = 'currentPrice,desc';
      if (sortBy === 'trending') sortParam = 'trending';

      // TRƯỜNG HỢP ĐẶC BIỆT: Yêu thích nhất tuần (Trending) 
      // Chỉ dùng API trending riêng biệt nếu KHÔNG có lọc sale hoặc các lọc khác
      if (sortBy === 'trending' && !selectedOnSale && !selectedPriceRange && !selectedSkinType) {
        const trendingRes = await productService.getTrendingProducts(100);
        const allTrending = trendingRes.data || [];
        
        // Phân trang thủ công cho Trending
        const pageSize = 9;
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const pagedTrending = allTrending.slice(start, end);

        setProducts(pagedTrending);
        setTotalPages(Math.ceil(allTrending.length / pageSize));
        setTotalElements(allTrending.length);
        setLoading(false);
        // Cuộn lên đầu khi có dữ liệu mới
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const res = await productService.searchProducts({
        categoryId,
        minPrice,
        maxPrice,
        sortBy: sortParam,
        onSale: selectedOnSale,
        skinType: selectedSkinType ?? undefined,
        page: currentPage,
        size: 9
      });

      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
      // Cuộn lên đầu khi có dữ liệu mới
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [sortBy, selectedPriceRange, selectedOnSale, selectedSkinType]);

  useEffect(() => {
    fetchProducts();
  }, [slug, selectedPriceRange, currentPage, sortBy, categories, selectedOnSale, selectedSkinType]);

  const handleFilterChange = (type: 'brand' | 'price' | 'skinType' | 'offer' | 'rating', value: any) => {
     if (type === 'price') {
        setSelectedPriceRange(prev => prev === value ? null : value);
     } else if (type === 'offer') {
        if (value === 'onSale') setSelectedOnSale(!selectedOnSale);
     } else if (type === 'skinType') {
        setSelectedSkinType(prev => prev === value ? null : value);
     }
  };

  const clearFilters = () => {
    setSelectedPriceRange(null);
    setSelectedOnSale(false);
    setSelectedSkinType(null);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'price-asc': return 'Giá thấp đến cao';
      case 'price-desc': return 'Giá cao đến thấp';
      case 'trending': return 'Yêu thích nhất';
      default: return 'Mới nhất';
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO 
        title={categoryName}
        description={onSaleParam ? "Tổng hợp tất cả các sản phẩm đang có chương trình giảm giá cực sốc tại Glowzy." : (slug && categoryDescriptions[slug] ? categoryDescriptions[slug] : `Khám phá bộ sưu tập ${categoryName} chính hãng tại Glowzy.`)}
      />
      <div className="bg-primary-50 py-12 mb-8 border-b border-primary-100">
        <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center space-x-2 text-xs md:text-sm text-primary-600 mb-4 font-bold uppercase tracking-widest">
              <Link to="/" className="hover:text-primary-800 cursor-pointer transition-colors px-1">Trang chủ</Link>
              <span>/</span>
              <span className="text-gray-900">{categoryName}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-2">
              {categoryName}
            </h1>
            <p className="text-primary-700 font-medium max-w-xl text-sm md:text-base italic">
              {onSaleParam ? "Tổng hợp tất cả các sản phẩm đang có chương trình giảm giá cực sốc tại Glowzy." : (sortParamFromUrl === 'trending' ? "Bảng xếp hạng những sản phẩm 'quốc dân' được tìm kiếm và săn đón nhiều nhất trong tuần qua." : (slug && categoryDescriptions[slug] ? categoryDescriptions[slug] : "Khám phá bộ sưu tập hàng trăm sản phẩm chính hãng với mức giá siêu ưu đãi từ Glowzy."))}
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
              selectedSkinTypes={selectedSkinType ? [selectedSkinType] : []}
              selectedOnSale={selectedOnSale}
              onFilterChange={handleFilterChange}
              onReset={clearFilters}
              isSkincare={
                categories.find(c => normalize(c.name) === slug || (slug === 'skincare' && c.name === 'Chăm sóc da'))?.name === "Chăm sóc da" ||
                categories.find(c => (normalize(c.name) === slug || (slug === 'skincare' && c.name === 'Chăm sóc da')) && c.parentId === categories.find(p => p.name === "Chăm sóc da")?.id) !== undefined
              }
             />
          </div>

          <div className="lg:w-3/4 flex-1 w-full">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between mb-8 shadow-sm gap-4">
              <span className="text-sm text-gray-500 font-medium">Tìm thấy <strong className="text-gray-900 text-lg">{totalElements}</strong> sản phẩm</span>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-black text-gray-700 uppercase tracking-wide transition-colors"
                >
                  <Filter size={18} /> <span>Lọc SP</span>
                </button>

                <div className="relative group flex-1 sm:flex-none">
                  <button className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl text-sm font-black text-gray-700 uppercase tracking-wide transition-all">
                    {getSortLabel()} <ChevronDown size={18} className="ml-3 text-gray-400 group-hover:text-primary-500" />
                  </button>
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 overflow-hidden">
                    <button 
                      onClick={() => setSortBy('newest')}
                      className={cn("w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-600 transition-colors", sortBy === 'newest' ? 'text-primary-600 bg-primary-50' : 'text-gray-600')}
                    >
                      Mới nhất
                    </button>
                    <button 
                      onClick={() => setSortBy('price-asc')}
                      className={cn("w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-600 transition-colors", sortBy === 'price-asc' ? 'text-primary-600 bg-primary-50' : 'text-gray-600')}
                    >
                      Giá thấp đến cao
                    </button>
                    <button 
                      onClick={() => setSortBy('price-desc')}
                      className={cn("w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-600 transition-colors", sortBy === 'price-desc' ? 'text-primary-600 bg-primary-50' : 'text-gray-600')}
                    >
                      Giá cao đến thấp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 size={48} className="text-primary-500 animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Đang tải sản phẩm...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    id={product.id.toString()}
                    name={product.name}
                    price={product.currentPrice}
                    originalPrice={product.originalPrice}
                    image={product.imageUrl}
                    reviewCount={product.reviewCount}
                    views={product.viewCount || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                 <p className="text-xl font-black text-gray-400 uppercase tracking-tighter italic">Không tìm thấy sản phẩm nào phù hợp :(</p>
              </div>
            )}

             {totalPages > 1 && (
               <div className="mt-16 flex justify-center">
                 <div className="flex space-x-2">
                   <button 
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all", currentPage === 0 ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-white border border-gray-100 hover:border-primary-500 hover:text-primary-600")}
                   >
                      &lt;
                   </button>
                   {[...Array(totalPages)].map((_, i) => (
                     <button 
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all",
                        currentPage === i 
                          ? "bg-primary-500 text-white shadow-xl shadow-primary-500/30" 
                          : "bg-white border border-gray-100 hover:border-primary-500 hover:text-primary-600"
                      )}
                     >
                        {i + 1}
                     </button>
                   ))}
                   <button 
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all", currentPage === totalPages - 1 ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-white border border-gray-100 hover:border-primary-500 hover:text-primary-600")}
                   >
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

export default Category;
