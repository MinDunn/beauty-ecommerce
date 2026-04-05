import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FilterSidebar } from '../components/category/FilterSidebar';
import { ProductCard } from '../components/ui/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';

const mockCategoryProducts = [
  { id: '1', name: 'Kem Chống Nắng La Roche-Posay Anthelios', price: 435000, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop', badge: '-10%' },
  { id: '2', name: 'Sữa Rửa Mặt CeraVe Foaming Cleanser', price: 365000, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop' },
  { id: '3', name: 'Kem Dưỡng Ẩm Neutrogena Hydro Boost', price: 350000, image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=600&auto=format&fit=crop', badge: 'Mới' },
  { id: '4', name: 'Serum Vichy Mineral 89', price: 790000, originalPrice: 950000, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop' },
  { id: '5', name: 'Tẩy trang Bioderma Sensibio H2O', price: 495000, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop', badge: 'Bán chạy' },
  { id: '6', name: 'Son Mac Ruby Woo Matte Lipstick', price: 650000, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop' },
  { id: '7', name: 'Kem dưỡng Paula\'s Choice 2% BHA', price: 899000, originalPrice: 1100000, image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=600&auto=format&fit=crop' },
  { id: '8', name: 'Kem chống nắng Anessa Tone Up', price: 540000, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop' },
  { id: '9', name: 'Nước hoa hồng Thayers', price: 290000, image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop' },
];

const getCategoryName = (slug?: string) => {
  switch (slug) {
    case 'skincare': return 'Chăm sóc da';
    case 'makeup': return 'Trang điểm';
    case 'haircare': return 'Chăm sóc tóc';
    case 'bodycare': return 'Chăm sóc cơ thể';
    case 'supplements': return 'Thực phẩm chức năng';
    default: return 'Khám phá Sản phẩm';
  }
};

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const categoryName = getCategoryName(slug);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Category Banner Background */}
      <div className="bg-primary-50 py-12 mb-8 border-b border-primary-100">
        <div className="container mx-auto px-4 max-w-7xl">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs md:text-sm text-primary-600 mb-4 font-bold uppercase tracking-widest">
              <span className="hover:text-primary-800 cursor-pointer">Trang chủ</span>
              <span>/</span>
              <span className="text-gray-900">{categoryName}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-2">
              {categoryName}
            </h1>
            <p className="text-primary-700 font-medium max-w-xl text-sm md:text-base">Khám phá bộ sưu tập hàng trăm sản phẩm chính hãng với mức giá siêu ưu đãi từ Guardian.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar Filter */}
          <div className="lg:w-1/4 lg:sticky lg:top-24 w-full">
             <FilterSidebar isMobileOpen={isMobileFilterOpen} setIsMobileOpen={setIsMobileFilterOpen} />
          </div>

          {/* Right Content Area */}
          <div className="lg:w-3/4 flex-1 w-full">
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between mb-8 shadow-sm gap-4">
              <span className="text-sm text-gray-500 font-medium">Tìm thấy <strong className="text-gray-900 text-lg">145</strong> sản phẩm</span>
              
              <div className="flex items-center gap-3">
                 {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-black text-gray-700 uppercase tracking-wide transition-colors"
                >
                  <Filter size={18} /> <span>Lọc SP</span>
                </button>

                {/* Sort Dropdown */}
                <div className="relative group flex-1 sm:flex-none">
                  <button className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl text-sm font-black text-gray-700 uppercase tracking-wide transition-all">
                    Mới nhất <ChevronDown size={18} className="ml-3 text-gray-400 group-hover:text-primary-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {mockCategoryProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

             {/* Pagination */}
             <div className="mt-16 flex justify-center">
               <div className="flex space-x-2">
                 <button className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400 cursor-not-allowed">
                    &lt;
                 </button>
                 <button className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center font-black text-white shadow-xl shadow-primary-500/30">
                    1
                 </button>
                 <button className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black hover:border-primary-500 hover:text-primary-600 hover:shadow-md transition-all">
                    2
                 </button>
                 <button className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black hover:border-primary-500 hover:text-primary-600 hover:shadow-md transition-all">
                    3
                 </button>
                 <button className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black hover:border-primary-500 hover:text-primary-600 hover:shadow-md transition-all">
                    &gt;
                 </button>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Category;
