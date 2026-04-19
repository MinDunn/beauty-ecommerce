import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, Share2, Facebook, MessageCircle, ChevronRight, Minus, Plus, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, selectOnlyItems } from '../store/slices/cartSlice';
import { cn } from '../utils/cn';
import type { RootState } from '../store';
import toast from 'react-hot-toast';

import { productService } from '../api/productService';
import wishlistService from '../api/wishlistService';
import reviewService from '../api/reviewService';
import { cartService } from '../api/cartService';
import type { Review } from '../api/reviewService';
import { SEO } from '../components/common/SEO';

const resolveProductImage = (image?: string) => {
  if (!image) return 'https://placehold.co/600x600/f8fafc/64748b?text=Glowzy+Beauty';
  if (image.startsWith('http') || image.startsWith('/uploads/') || image.startsWith('/images/')) return image;
  return `/images/${image.replace(/^\/+/, '')}`;
};

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [mainImage, setMainImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const numericId = Number(id);
      if (isNaN(numericId)) {
          navigate('/');
          return;
      }
      const data = await productService.getProductById(numericId);
      
      const imageSet = new Set<string>();
      if (data.imageUrl) imageSet.add(resolveProductImage(data.imageUrl));
      if (data.images && data.images.length > 0) {
        data.images.forEach((img: string) => imageSet.add(resolveProductImage(img)));
      }
      if (data.variants && data.variants.length > 0) {
        data.variants.forEach((v: any) => {
          if (v.imageUrl) imageSet.add(resolveProductImage(v.imageUrl));
        });
      }
      
      const images = Array.from(imageSet);

      const mappedProduct = {
        id: data.id.toString(),
        name: data.name,
        price: data.currentPrice,
        originalPrice: data.originalPrice,
        brand: data.brand || 'Glowzy',
        rating: data.rating || 0,
        reviewsCount: data.reviewsCount || 0,
        sold: data.sold || 0,
        description: data.description,
        instructions: data.instructions,
        ingredients: data.ingredients,
        images: images,
        variants: data.variants || [],
        categoryId: data.categoryId
      };
      
      setProduct(mappedProduct);
      setMainImage(mappedProduct.images[0]);
      if (mappedProduct.variants.length > 0) {
        setSelectedVariant(mappedProduct.variants[0]);
      }
    } catch (err) {
      console.error("Failed to fetch product", err);
      toast.error("Không tìm thấy sản phẩm");
      navigate('/category/all');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const checkWishlistStatus = useCallback(async () => {
    try {
      const resp = await wishlistService.checkWishlist(Number(id));
      setIsWishlisted(resp.data.data);
    } catch (error: unknown) {
      console.error('Error checking wishlist', error);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    setIsLoadingReviews(true);
    try {
      const resp = await reviewService.getReviews(Number(id));
      setReviews(resp.data.data);
    } catch (error: unknown) {
      console.error('Error fetching reviews', error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (user && id && !isNaN(Number(id))) {
      checkWishlistStatus();
    }
    if (id && !isNaN(Number(id))) {
      fetchReviews();
    }
  }, [id, user, checkWishlistStatus, fetchReviews]);



  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      navigate('/login');
      return;
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích (Lưu cục bộ)');
      return;
    }

    const previousState = isWishlisted;
    setIsWishlisted(!previousState);

    try {
      if (previousState) {
        await wishlistService.removeFromWishlist(numericId);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await wishlistService.addToWishlist(numericId);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error: unknown) {
      setIsWishlisted(previousState);
      const errMsg = error instanceof Error ? (error as any).response?.data?.message || error.message : 'Có lỗi xảy ra';
      toast.error(errMsg);
    }
  };

  const handleAddToCart = async () => {
    const payload = {
      id: product.id,
      name: product.name,
      price: selectedVariant ? product.price + selectedVariant.price : product.price,
      image: mainImage,
      brand: product.brand,
      quantity: quantity,
      variantName: selectedVariant?.variantName || null,
      categoryId: product.categoryId
    };

    dispatch(addItem(payload));

    if (user) {
      try {
        await cartService.addToCart({
          productId: Number(product.id),
          quantity: quantity,
          variantName: selectedVariant?.variantName || null
        });
      } catch (error) {
        console.error("Failed to sync cart with backend", error);
      }
    }
    
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = async () => {
    // Add to cart first
    await handleAddToCart();
    
    // Select ONLY this item in the cart for checkout
    dispatch(selectOnlyItems([{ 
      id: product.id, 
      variantName: selectedVariant?.variantName || null 
    }]));
    
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá');
      navigate('/login');
      return;
    }
    if (!newReview.comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await reviewService.createReview(Number(id), {
        ratingStar: newReview.rating,
        comment: newReview.comment
      });
      toast.success('Cảm ơn bạn đã gửi đánh giá!');
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      toast.error(errMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = (platform: 'fb' | 'zalo') => {
    const url = window.location.href;
    const shareUrl = platform === 'fb' 
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      : `https://zalo.me/share?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
            <Loader2 size={64} className="text-primary-500 animate-spin" />
            <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-400">Đang tải thông tin sản phẩm...</p>
        </div>
    );
  }

  if (!product) return null;

  // Build JSON-LD Structured Data for Google
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description || `Mua ${product.name} tại Glowzy. - Mỹ phẩm chính hãng từ thương hiệu ${product.brand}.`,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "VND",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": product.reviewsCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewsCount
    } : undefined
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO 
        title={product.name}
        description={product.description?.substring(0, 160) || `Khám phá ngay ${product.name} chính hãng từ ${product.brand} tại Glowzy.`}
        image={mainImage}
        type="product"
        schema={productSchema}
      />
      <div className="bg-gray-50 py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap overflow-x-auto hide-scrollbar">
            <Link to="/" className="hover:text-primary-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-900 font-black">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-12">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="glowzy-card overflow-hidden bg-white p-8 md:p-12 flex items-center justify-center min-h-[400px] md:min-h-[600px] group">
              <img src={mainImage} alt={product.name} className="w-full h-auto max-w-[500px] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
               {product.images.map((img: string, idx: number) => (
                 <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`w-24 h-24 flex-shrink-0 bg-white rounded-2xl border-2 overflow-hidden flex items-center justify-center p-2 transition-all ${mainImage === img ? 'border-primary-500 shadow-md scale-105' : 'border-gray-100 hover:border-gray-300'}`}
                 >
                   <img src={img} className="w-full h-full object-contain mix-blend-multiply" />
                 </button>
               ))}
            </div>

            <div className="flex items-center gap-4 mt-4 p-6 bg-gray-50/50 rounded-[1.5rem] border border-gray-100">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mr-2">
                 <Share2 size={16} /> Chia sẻ:
               </span>
               <button onClick={() => handleShare('fb')} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:scale-110 hover:-rotate-6 transition-all shadow-lg active:scale-95">
                 <Facebook size={20} />
               </button>
               <button onClick={() => handleShare('zalo')} className="w-10 h-10 flex items-center justify-center bg-blue-400 text-white rounded-xl hover:scale-110 hover:rotate-6 transition-all shadow-lg active:scale-95">
                 <MessageCircle size={20} />
               </button>
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col">
            <div className="mb-8">
              <div className="text-primary-600 text-sm font-black uppercase tracking-widest mb-3 tracking-[0.2em]">{product.brand}</div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">{product.name}</h1>
              
              <div className="flex items-center flex-wrap gap-6 text-xs font-black uppercase tracking-widest">
                {reviews.length > 0 ? (
                  <div className="flex items-center text-amber-500 gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 italic">
                    <Star fill="currentColor" size={14} />
                    <span>{(reviews.reduce((acc, curr) => acc + curr.ratingStar, 0) / reviews.length).toFixed(1)}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400 gap-1 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 italic">
                    <Star fill="currentColor" size={14} />
                    <span>0.0</span>
                  </div>
                )}
                <div className="w-px h-4 bg-gray-200"></div>
                <span className="text-gray-400">{reviews.length > 0 ? `${reviews.length} đánh giá` : 'Chưa có đánh giá'}</span>
                <div className="w-px h-4 bg-gray-200"></div>
                <span className="text-gray-400">Đã bán {product.sold.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-gray-50/50 p-8 rounded-[2.5rem] mb-10 border border-primary-50 shadow-sm">
               <div className="flex items-end gap-6 mb-3">
                 <div className="text-5xl font-black text-primary-600 tracking-tighter drop-shadow-sm">
                   {(selectedVariant ? product.price + selectedVariant.price : product.price).toLocaleString('vi-VN')} đ
                 </div>
                 {product.originalPrice && product.originalPrice > (selectedVariant ? product.price + selectedVariant.price : product.price) && (
                    <div className="text-gray-400 text-xl font-bold line-through mb-1.5 italic opacity-40">
                        {product.originalPrice.toLocaleString('vi-VN')} đ
                    </div>
                 )}
               </div>
               {selectedVariant && selectedVariant.price > 0 && (
                 <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest italic">+ {selectedVariant.price.toLocaleString()}đ (Phụ phí biến thể)</p>
               )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-10">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Lựa chọn của bạn</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.imageUrl) setMainImage(resolveProductImage(v.imageUrl));
                      }}
                      className={cn(
                        "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2",
                        selectedVariant?.id === v.id 
                          ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-primary-200 hover:text-primary-500"
                      )}
                    >
                      {v.variantName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Số lượng sản phẩm</h3>
              <div className="flex items-center">
                 <div className="flex items-center border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-14 h-14 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-primary-500 transition-colors">
                      <Minus size={20} />
                    </button>
                    <div className="w-20 h-14 flex items-center justify-center font-black text-gray-900 text-lg border-x-2 border-gray-100 bg-gray-50/20">
                      {quantity}
                    </div>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-primary-500 transition-colors">
                      <Plus size={20} />
                    </button>
                 </div>
                 <span className="ml-6 text-[10px] text-green-600 font-black uppercase tracking-[0.2em] bg-green-50 px-5 py-2.5 rounded-xl border border-green-100 italic">Giao ngay trong 2h</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button onClick={handleAddToCart} className="glowzy-btn-secondary flex-1 py-5 flex items-center justify-center gap-4">
                  <ShoppingCart size={22} strokeWidth={3} />
                  <span>Thêm vào giỏ</span>
                </button>
                <button onClick={handleBuyNow} className="glowzy-btn-primary flex-[1.5] py-5 shadow-primary-500/40">
                  Mua ngay bây giờ
                </button>
              <button 
                onClick={handleToggleWishlist}
                className={`w-14 flex items-center justify-center bg-gray-50 border rounded-2xl transition-all shadow-sm active:scale-90 ${isWishlisted ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-400 border-gray-200 hover:text-red-500 hover:bg-red-50'}`}
              >
                 <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-8 border-t border-gray-100">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-500 rounded-2xl border border-green-100 shadow-sm"><ShieldCheck size={28} /></div>
                  <span className="text-[10px] font-black text-gray-700 uppercase leading-relaxed italic">100% Chính Hãng<br/><span className="text-[9px] font-medium text-gray-400 not-italic uppercase tracking-widest">Đổi trả 30 ngày</span></span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-500 rounded-2xl border border-blue-100 shadow-sm"><Truck size={28} /></div>
                  <span className="text-[10px] font-black text-gray-700 uppercase leading-relaxed italic">Miễn phí ship<br/><span className="text-[9px] font-medium text-gray-400 not-italic uppercase tracking-widest">Đơn từ 499.000đ</span></span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 glowzy-card overflow-hidden">
           <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab('description')}
                className={cn("glowzy-tab flex-1 md:flex-none py-8", activeTab === 'description' ? "glowzy-tab-active" : "glowzy-tab-inactive")}
              >
                Mô tả chi tiết
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={cn("glowzy-tab flex-1 md:flex-none py-8", activeTab === 'instructions' ? "glowzy-tab-active" : "glowzy-tab-inactive")}
              >
                Hướng dẫn sử dụng
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={cn("glowzy-tab flex-1 md:flex-none py-8", activeTab === 'ingredients' ? "glowzy-tab-active" : "glowzy-tab-inactive")}
              >
                Thành phần
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={cn("glowzy-tab flex-1 md:flex-none py-8", activeTab === 'reviews' ? "glowzy-tab-active" : "glowzy-tab-inactive")}
              >
                {reviews.length > 0 ? `⭐ ${(reviews.reduce((acc, curr) => acc + curr.ratingStar, 0) / reviews.length).toFixed(1)}` : '⭐ 0.0'} Đánh giá sản phẩm ({reviews.length})
              </button>
           </div>
           
           <div className="p-10 md:p-16">
             {activeTab === 'description' && (
                <div className="max-w-4xl mx-auto space-y-12">
                   <div className="relative pl-10 border-l-4 border-primary-500">
                     <p className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight mb-4 italic">Thông tin sản phẩm.</p>
                     <div className="text-gray-500 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                        {product.description || "Sản phẩm này hiện đang được cập nhật thông tin mô tả chi tiết từ Glowzy. Vui lòng quay lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng để biết thêm thông tin."}
                     </div>
                   </div>
                </div>
             )}

             {activeTab === 'instructions' && (
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row gap-12 items-start">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center flex-shrink-0 text-primary-500 border border-primary-50">
                      <Plus size={40} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 italic">Cách sử dụng hiệu quả nhất</h4>
                      <div className="text-gray-500 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                        {product.instructions || "1. Làm sạch vùng da cần chăm sóc.\n2. Lấy một lượng vừa đủ sản phẩm.\n3. Thoa đều và massage nhẹ nhàng để thẩm thấu.\n4. Sử dụng hàng ngày để đạt hiệu quả tốt nhất."}
                      </div>
                    </div>
                  </div>
                </div>
             )}

             {activeTab === 'ingredients' && (
                <div className="max-w-4xl mx-auto space-y-12">
                   <div className="bg-primary-50 px-10 py-12 rounded-[3rem] border border-primary-100">
                      <div className="flex items-center gap-6 mb-8">
                         <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-primary-600 border border-primary-50">
                            <ShieldCheck size={32} />
                         </div>
                         <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Danh sách thành phần</h4>
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2rem] border border-white shadow-inner text-gray-600 text-lg leading-relaxed font-semibold whitespace-pre-wrap">
                        {product.ingredients || "Aqua, Glycerin, Niacinamide, Butylene Glycol, Caprylyl Glycol, Sodium Hyaluronate, Citric Acid, Fragrance, and other skin-safe ingredients."}
                      </div>
                   </div>
                </div>
             )}
             
              {activeTab === 'reviews' && (
                <div className="max-w-5xl mx-auto space-y-16">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start pb-16 border-b border-gray-100">
                      <div className="p-8 bg-gray-50/50 rounded-[3rem] border border-gray-100">
                         {/* Average score */}
                         <div className="text-center mb-8">
                           <h4 className="text-7xl font-black text-gray-900 tracking-tighter drop-shadow-sm">
                             {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.ratingStar, 0) / reviews.length).toFixed(1) : "0.0"}
                           </h4>
                           <div className="flex items-center justify-center text-amber-400 gap-1 my-3">
                             {[1,2,3,4,5].map(s => <Star key={s} fill={s <= (reviews.length > 0 ? Math.round(reviews.reduce((acc, curr) => acc + curr.ratingStar, 0) / reviews.length) : 0) ? "currentColor" : "none"} size={22} />)}
                           </div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{reviews.length} đánh giá</p>
                         </div>
                         {/* Star breakdown */}
                         <div className="space-y-2.5">
                           {[5,4,3,2,1].map(star => {
                             const count = reviews.filter(r => r.ratingStar === star).length;
                             const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                             return (
                               <div key={star} className="flex items-center gap-3">
                                 <div className="flex items-center gap-1 w-16 flex-shrink-0">
                                   <span className="text-xs font-black text-gray-600">{star}</span>
                                   <Star fill="#f59e0b" stroke="none" size={12} className="text-amber-400" />
                                 </div>
                                 <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                   <div
                                     className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                     style={{ width: `${pct}%` }}
                                   />
                                 </div>
                                 <span className="text-[11px] font-bold text-gray-400 w-8 text-right">{count}</span>
                                </div>
                             );
                           })}
                         </div>
                      </div>

                      <div className="lg:col-span-2 space-y-8">
                         {!!user ? (
                           <>
                             <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">Để lại nhận xét cho chúng tôi</h4>
                             <form onSubmit={handleSubmitReview} className="space-y-6">
                                <div className="flex items-center gap-8">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Chất lượng sản phẩm:</span>
                                   <div className="flex items-center gap-3">
                                      {[1,2,3,4,5].map(s => (
                                        <button key={s} type="button" onClick={() => setNewReview({...newReview, rating: s})} className="hover:scale-125 transition-transform active:scale-95">
                                          <Star fill={s <= newReview.rating ? "#f59e0b" : "none"} stroke={s <= newReview.rating ? "#f59e0b" : "#cbd5e1"} size={36} />
                                        </button>
                                      ))}
                                   </div>
                                </div>
                                <textarea 
                                  value={newReview.comment}
                                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                  placeholder="Hãy chia sẻ trải nghiệm chân thực của bạn về sản phẩm này với cộng đồng Glowzy nhé..."
                                  className="glowzy-input min-h-[160px] resize-none p-8 text-base shadow-inner"
                                />
                                <button disabled={isSubmittingReview} className="glowzy-btn-primary w-full md:w-auto px-12 py-5 shadow-2xl shadow-primary-500/30">
                                    {isSubmittingReview ? 'Đang gửi...' : 'Gửi nhận xét ngay'}
                                </button>
                             </form>
                           </>
                         ) : (
                           <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                             <ShoppingCart size={48} className="text-gray-200 mb-6" />
                             <p className="text-lg font-black text-gray-900 uppercase tracking-tight italic mb-2">Chưa thể đánh giá</p>
                             <p className="text-sm text-gray-400 font-medium text-center max-w-sm">Bạn cần mua và nhận sản phẩm này trước khi có thể để lại đánh giá.</p>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="space-y-8">
                      {isLoadingReviews ? (
                         <div className="text-center py-24 flex flex-col items-center gap-8">
                            <div className="w-16 h-16 border-[6px] border-gray-100 border-t-primary-500 rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Đang cập nhật đánh giá...</p>
                         </div>
                      ) : reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {reviews.map((rev) => (
                            <div key={rev.id} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary-600 font-black shadow-inner border border-gray-100 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                                        {rev.userFullName?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-lg uppercase tracking-tight leading-none mb-2">{rev.userFullName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60 italic">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-amber-500 gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
                                        {[1,2,3,4,5].map(s => <Star key={s} fill={s <= rev.ratingStar ? "currentColor" : "none"} size={14} />)}
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium italic relative z-10">"{rev.comment}"</p>
                                <div className="absolute -bottom-4 -right-4 text-gray-50 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MessageCircle size={120} />
                                </div>
                            </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-32 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-200 shadow-inner">
                           <MessageCircle size={80} className="mx-auto text-gray-100 mb-8 opacity-50" />
                           <p className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Chia sẻ cảm nhận của bạn.</p>
                           <p className="text-gray-400 text-sm font-medium mt-3 uppercase tracking-widest opacity-70 italic">Sản phẩm này hiện chưa có nhận xét công khai.</p>
                        </div>
                      )}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
