import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Truck, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/slices/cartSlice';

import { products } from '../data/products';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Find product from central data
  const realProduct = products.find(p => p.id === id);
  
  // Fallback / Enhanced data
  const product = {
    id: realProduct?.id || id || '1',
    name: realProduct?.name || 'Sản phẩm đang cập nhật',
    price: realProduct?.price || 0,
    originalPrice: realProduct?.originalPrice,
    brand: realProduct?.brand || 'Glowzy',
    rating: 4.8,
    reviews: 1254,
    sold: 5400,
    images: [
      realProduct?.image || 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=600&auto=format&fit=crop',
    ],
  };

  const [mainImage, setMainImage] = useState(product.images[0]);

  const handleAddToCart = () => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      brand: product.brand,
      quantity: quantity
    }));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium uppercase tracking-wider overflow-x-auto hide-scrollbar whitespace-nowrap">
            <Link to="/" className="hover:text-primary-600 cursor-pointer">Trang chủ</Link>
            <span>/</span>
            <Link to="/category/skincare" className="hover:text-primary-600 cursor-pointer">Chăm sóc da</Link>
            <span>/</span>
            <span className="text-gray-900 font-bold max-w-[200px] truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-square bg-white rounded-3xl border border-gray-100 flex items-center justify-center p-8 overflow-hidden shadow-sm">
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
            </div>
            
             {/* Thumbnail row */}
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
               {product.images.map((img, idx) => (
                 <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 md:w-24 md:h-24 snap-start flex-shrink-0 bg-white rounded-2xl border-2 overflow-hidden flex items-center justify-center p-2 transition-all ${mainImage === img ? 'border-primary-500 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                 >
                   <img src={img} className="w-full h-full object-contain mix-blend-multiply" />
                 </button>
               ))}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Header info */}
            <div className="mb-6">
              <div className="text-primary-600 text-sm font-black uppercase tracking-widest mb-2">{product.brand}</div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center flex-wrap gap-4 text-sm">
                <div className="flex items-center text-amber-400">
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <span className="text-gray-600 font-bold ml-2">{product.rating}</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className="text-gray-600">Đánh giá: <strong>{product.reviews.toLocaleString()}</strong></span>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className="text-gray-600">Đã bán: <strong>{product.sold.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-gray-50/50 p-6 rounded-3xl mb-8 border border-primary-50">
               <div className="flex items-end gap-6 mb-2">
                 <div className="text-4xl font-black text-primary-600 tracking-tighter">{product.price.toLocaleString('vi-VN')} đ</div>
                 <div className="text-gray-400 text-lg font-bold line-through mb-1">{product.originalPrice?.toLocaleString('vi-VN')} đ</div>
               </div>
               <div className="inline-block bg-red-100 text-red-600 text-xs font-black px-2 py-1.5 rounded-lg uppercase tracking-wide">
                 Tiết kiệm {product.originalPrice ? (product.originalPrice - product.price).toLocaleString('vi-VN') : 0} đ ({Math.round((1 - product.price/product.originalPrice!) * 100)}%)
               </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Số lượng</h3>
              <div className="flex items-center">
                 <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary-500 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="w-16 h-12 flex items-center justify-center font-black text-gray-900 border-x-2 border-gray-100 shadow-inner">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary-500 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                 </div>
                 <div className="ml-4 text-sm text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg">Còn 150 sản phẩm</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-50 text-primary-600 font-black border-2 border-primary-500 rounded-2xl hover:bg-primary-100 transition-colors uppercase tracking-widest text-sm"
              >
                 <ShoppingCart size={20} />
                 <span>Thêm vào giỏ</span>
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center py-4 bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
              >
                 Mua ngay
              </button>
              <button className="w-14 h-14 flex items-center justify-center bg-gray-50 text-gray-400 font-black border border-gray-200 rounded-2xl hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                 <Heart size={24} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-8 border-t border-gray-100">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-500 rounded-2xl"><ShieldCheck size={24} /></div>
                 <span className="text-sm font-bold text-gray-700 leading-tight">100% Chính Hãng<br/><span className="text-xs font-normal text-gray-500">Hoàn tiền 200%</span></span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-500 rounded-2xl"><Truck size={24} /></div>
                 <span className="text-sm font-bold text-gray-700 leading-tight">Miễn phí giao hàng<br/><span className="text-xs font-normal text-gray-500">Đơn từ 399k</span></span>
              </div>
            </div>

          </div>
        </div>
        
        {/* Product Details Section (Tabs) */}
        <div className="mt-16 bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
           <div className="flex border-b border-gray-100/80 overflow-x-auto hide-scrollbar bg-gray-50/50">
             <button 
               onClick={() => setActiveTab('description')}
               className={`px-8 py-6 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'description' ? 'text-primary-600 border-b-4 border-primary-500 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
             >
                Mô tả sản phẩm
             </button>
             <button 
               onClick={() => setActiveTab('ingredients')}
               className={`px-8 py-6 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'ingredients' ? 'text-primary-600 border-b-4 border-primary-500 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
             >
                Thành phần
             </button>
             <button 
               onClick={() => setActiveTab('reviews')}
               className={`px-8 py-6 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'text-primary-600 border-b-4 border-primary-500 bg-white' : 'text-gray-500 hover:text-gray-800'}`}
             >
                Đánh giá (1254)
             </button>
           </div>
           
           <div className="p-8 md:p-12 prose prose-slate max-w-none text-gray-600 leading-relaxed font-medium">
             {activeTab === 'description' && (
                <div className="space-y-4">
                   <p className="text-lg text-gray-900 font-bold mb-4">Kem Trị Mụn Phục Hồi Hàng Rào Bảo Vệ Da.</p>
                   <p>Khám phá bí mật ngăn ngừa lão hóa và bảo vệ da tuyệt đối với kem chống nắng thế hệ mới. Được thiết kế đặc biệt dành riêng cho làn da dầu mụn và nhạy cảm.</p>
                   <p>Công nghệ đột phá giúp màng lọc siêu bám, kháng nước tối đa và giữ da bạn khô thoáng suốt 12 giờ đồng hồ liên tục.</p>
                </div>
             )}
              {activeTab === 'ingredients' && (
                <div>
                   <p>Thành phần chính: Nước khoáng tự nhiên, màng lọc XL-Protect, ZinC PCA giúp kiểm soát dầu nhờn.</p>
                </div>
             )}
              {activeTab === 'reviews' && (
                <div className="text-center py-8">
                   <Star size={48} className="mx-auto text-gray-200 mb-4" />
                   <p className="text-lg font-bold text-gray-900">Tính năng Đánh Giá đang được cập nhật</p>
                   <p className="text-gray-500">Vui lòng quay lại sau nhé!</p>
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
