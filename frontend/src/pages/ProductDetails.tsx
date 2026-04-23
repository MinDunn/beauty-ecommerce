import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, Share2, Facebook, MessageCircle, ChevronRight, Minus, Plus, Loader2, Eye, AlertCircle, Edit2 } from 'lucide-react';
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
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);
  const [mainImage, setMainImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

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
        viewCount: data.viewCount || 0,
        description: data.description,
        instructions: data.instructions,
        ingredients: data.ingredients,
        origin: data.origin,
        warnings: data.warnings,
        images: images,
        variants: data.variants || [],
        categoryId: data.categoryId,
        stockQuantity: data.stockQuantity || 0
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

    const sessionKey = `viewed_product_${id}`;
    if (id && !sessionStorage.getItem(sessionKey) && !isNaN(Number(id))) {
      productService.incrementViewCount(Number(id)).then(async () => {
        // Sau khi cộng ở server, fetch lại để lấy viewCount chính xác từ DB
        try {
          const updated = await productService.getProductById(Number(id));
          setProduct((prev: any) => prev ? { ...prev, viewCount: updated.viewCount || 0 } : prev);
        } catch {
          // fallback: tự cộng 1 nếu fetch thất bại
          setProduct((prev: any) => prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : prev);
        }
        sessionStorage.setItem(sessionKey, 'true');
      });
    }

    // Khi rời khỏi trang, cho phép lần sau vào lại được cộng tiếp
    return () => {
      sessionStorage.removeItem(sessionKey);
    };
  }, [fetchProduct, id]);

  useEffect(() => {
    if (user && id && !isNaN(Number(id))) {
      checkWishlistStatus();
    }
  }, [id, user, checkWishlistStatus]);

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      fetchReviews();
    }
  }, [id, fetchReviews]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (user && id && !isNaN(Number(id))) {
        try {
          const resp = await reviewService.checkPurchase(Number(id));
          setHasPurchased(resp.data.data);
        } catch (error) {
          console.error('Error checking purchase status', error);
        }
      }
    };
    checkPurchase();
  }, [id, user]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.categoryId) return;
      setLoadingRelated(true);
      try {
        const resp = await productService.searchProducts({
          categoryId: product.categoryId,
          size: 6
        });
        // Filter out current product
        const filtered = (resp.content || []).filter((p: any) => String(p.id) !== String(id));
        setRelatedProducts(filtered.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch related products", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (product?.categoryId) {
      fetchRelatedProducts();
    }
  }, [product?.categoryId, id]);

  const ProductCard = ({ id, name, price, originalPrice, image, categoryId, brand, views = 0, stockQuantity }: any) => {
    const resolvedImage = resolveProductImage(image);

    const handleQuickAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(addItem({
        id: id,
        name: name,
        price: price,
        image: resolvedImage,
        brand: brand || 'Glowzy',
        quantity: 1,
        variantName: null,
        categoryId: categoryId,
        stockQuantity: stockQuantity
      }));
      toast.success('Đã thêm vào giỏ hàng');
    };

    return (
      <Link
        to={`/product/${id}`}
        className="group flex flex-col bg-white rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden h-full"
      >
        <div className="relative aspect-square overflow-hidden bg-white p-6 flex items-center justify-center">
          {/* View Count - Top Left (No Background) */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-gray-400 font-black text-[11px] transition-colors group-hover:text-primary-500 drop-shadow-sm">
            <Eye size={14} strokeWidth={2.5} />
            <span>{(views || 0).toLocaleString()}</span>
          </div>

          <img src={resolvedImage} alt={name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
          {originalPrice && originalPrice > price && (
            <div className="absolute top-11 left-4 bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg z-10">GIẢM SỐC</div>
          )}

          <button
            onClick={handleQuickAddToCart}
            className="absolute bottom-4 right-4 bg-primary-500 text-white p-2.5 rounded-full shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-20 hover:scale-110 active:scale-95 transition-all duration-300"
            title="Thêm nhanh vào giỏ"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
        <div className="p-6 pt-2 flex flex-col flex-1">
          <h3 className="text-sm font-black text-gray-900 line-clamp-2 mb-4 group-hover:text-primary-500 transition-colors uppercase leading-tight min-h-[2.5rem]">{name}</h3>
          <div className="mt-auto flex items-center gap-x-3 gap-y-1 flex-wrap">
            <span className="text-lg font-black text-primary-600 tracking-tighter">
              {price.toLocaleString()} đ
            </span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-xs text-gray-400 line-through font-bold opacity-60 italic">
                  {originalPrice.toLocaleString('vi-VN')} đ
                </span>
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg shadow-red-500/20">
                  -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  };

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
    const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

    const payload = {
      id: product.id,
      name: product.name,
      price: selectedVariant ? product.price + selectedVariant.price : product.price,
      image: mainImage,
      brand: product.brand,
      quantity: quantity,
      variantName: selectedVariant?.variantName || null,
      categoryId: product.categoryId,
      stockQuantity: currentStock
    };
    if (currentStock <= 0) {
      toast.error('Xin lỗi, sản phẩm này hiện đã hết hàng');
      return;
    }

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
    const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
    if (currentStock <= 0) {
      toast.error('Xin lỗi, sản phẩm này hiện đã hết hàng');
      return;
    }
    await handleAddToCart();
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

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    if (!editingReview.comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setIsUpdatingReview(true);
    try {
      await reviewService.updateReview(editingReview.id, {
        ratingStar: editingReview.ratingStar,
        comment: editingReview.comment
      });
      toast.success('Cập nhật đánh giá thành công!');
      setEditingReview(null);
      fetchReviews();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      toast.error(errMsg);
    } finally {
      setIsUpdatingReview(false);
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
        <div className="container mx-auto px-4 max-w-[1536px]">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap overflow-x-auto hide-scrollbar">
            <Link to="/" className="hover:text-primary-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-900 font-black">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1536px] mt-12">
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
                <span className="text-gray-400">Đã bán {(product.sold || 0).toLocaleString()}</span>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center text-primary-500 gap-1.5 bg-primary-50/50 px-3 py-1.5 rounded-xl border border-primary-100/50">
                  <Eye size={14} strokeWidth={2.5} />
                  <span>{(product.viewCount || 0).toLocaleString()} lượt xem</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 p-8 rounded-[2.5rem] mb-10 border border-primary-50 shadow-sm">
              <div className="flex items-center gap-6 mb-3">
                <div className="text-4xl font-black text-primary-600 tracking-tighter drop-shadow-sm">
                  {(selectedVariant ? product.price + selectedVariant.price : product.price).toLocaleString('vi-VN')} đ
                </div>
                {product.originalPrice && product.originalPrice > (selectedVariant ? product.price + selectedVariant.price : product.price) && (
                  <>
                    <div className="text-gray-400 text-xl font-bold line-through italic opacity-40 leading-none">
                      {product.originalPrice.toLocaleString('vi-VN')} đ
                    </div>
                    <div className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/25 animate-bounce-subtle">
                      -{Math.round(((product.originalPrice - (selectedVariant ? product.price + selectedVariant.price : product.price)) / product.originalPrice) * 100)}%
                    </div>
                  </>
                )}
              </div>
              {selectedVariant && selectedVariant.price > 0 && (
                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest italic">+ {selectedVariant.price.toLocaleString()}đ (Phụ phí biến thể)</p>
              )}

              {/* Legal Compliance Info (ND 85) */}
              <div className="mt-6 pt-6 border-t border-primary-100/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Xuất xứ sản phẩm</p>
                    <p className="text-sm font-bold text-gray-900">{product.origin || 'Chính hãng (Xem trên bao bì)'}</p>
                  </div>
                </div>
                
                {product.warnings && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Thông tin cảnh báo (NĐ 85)</p>
                      <p className="text-xs font-semibold text-amber-900 leading-relaxed italic">{product.warnings}</p>
                    </div>
                  </div>
                )}
              </div>
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
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    disabled={(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0}
                    className="w-14 h-14 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-primary-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="w-20 h-14 flex items-center justify-center font-black text-gray-900 text-lg border-x-2 border-gray-100 bg-gray-50/20">
                    {(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0 ? 0 : quantity}
                  </div>
                  <button 
                    onClick={() => {
                      const max = (selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity);
                      if (quantity < max) setQuantity(quantity + 1);
                      else toast.error(`Xin lỗi, chỉ còn ${max} sản phẩm`);
                    }} 
                    disabled={(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0}
                    className="w-14 h-14 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-primary-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="ml-6 flex flex-col gap-1">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border italic",
                    (selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) > 0 
                      ? "text-primary-600 bg-primary-50 border-primary-100" 
                      : "text-red-600 bg-red-50 border-red-100"
                  )}>
                    {(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) > 0 
                      ? `Còn lại: ${(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity)} sản phẩm` 
                      : "Hết hàng"}
                  </span>
                  {(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) > 0 && (
                    <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest pl-2 italic">Giao ngay trong 2h</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={handleAddToCart} 
                disabled={(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0}
                className={cn(
                  "glowzy-btn-secondary flex-1 py-5 flex items-center justify-center gap-4 transition-all",
                  (selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0 && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                <ShoppingCart size={22} strokeWidth={3} />
                <span>{(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
              </button>
              <button 
                onClick={handleBuyNow} 
                disabled={(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0}
                className={cn(
                  "glowzy-btn-primary flex-[1.5] py-5 shadow-primary-500/40 transition-all",
                  (selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0 && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                {(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0 ? 'Tạm hết hàng' : 'Mua ngay bây giờ'}
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
                <span className="text-[10px] font-black text-gray-700 uppercase leading-relaxed italic">100% Chính Hãng<br /><span className="text-[9px] font-medium text-gray-400 not-italic uppercase tracking-widest">Đổi trả 30 ngày</span></span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-500 rounded-2xl border border-blue-100 shadow-sm"><Truck size={28} /></div>
                <span className="text-[10px] font-black text-gray-700 uppercase leading-relaxed italic">Miễn phí ship<br /><span className="text-[9px] font-medium text-gray-400 not-italic uppercase tracking-widest">Đơn từ 499.000đ</span></span>
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
                    <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Thành phần chi tiết</h4>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2rem] border border-white shadow-inner text-gray-600 text-lg leading-relaxed font-semibold whitespace-pre-wrap">
                    {product.ingredients || "Aqua, Glycerin, Niacinamide, Butylene Glycol, Caprylyl Glycol, Sodium Hyaluronate, Citric Acid, Fragrance, and other skin-safe ingredients."}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-[1536px] mx-auto space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start pb-16 border-b border-gray-100">
                  <div className="p-8 bg-gray-50/50 rounded-[3rem] border border-gray-100">
                    <div className="text-center mb-8">
                      <h4 className="text-7xl font-black text-gray-900 tracking-tighter drop-shadow-sm">
                        {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.ratingStar, 0) / reviews.length).toFixed(1) : "0.0"}
                      </h4>
                      <div className="flex items-center justify-center text-amber-400 gap-1 my-3">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} fill={s <= (reviews.length > 0 ? Math.round(reviews.reduce((acc, curr) => acc + curr.ratingStar, 0) / reviews.length) : 0) ? "currentColor" : "none"} size={22} />)}
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{reviews.length} đánh giá</p>
                    </div>
                    <div className="space-y-2.5">
                      {[5, 4, 3, 2, 1].map(star => {
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
                          {!hasPurchased ? (
                            <div className="p-10 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex flex-col items-center text-center gap-4">
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm">
                                <AlertCircle size={32} />
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-amber-900 uppercase italic tracking-tight">Bạn chưa thể đánh giá</h4>
                                <p className="text-amber-700 font-medium leading-relaxed mt-2">Glowzy chỉ cho phép những khách hàng đã mua và nhận hàng thành công đánh giá sản phẩm này để đảm bảo tính khách quan nhất.</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">Để lại nhận xét cho chúng tôi</h4>
                              <form onSubmit={handleSubmitReview} className="space-y-6">
                                <div className="flex items-center gap-8">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Chất lượng sản phẩm:</span>
                                  <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map(s => (
                                      <button key={s} type="button" onClick={() => setNewReview({ ...newReview, rating: s })} className="hover:scale-125 transition-transform active:scale-95">
                                        <Star fill={s <= newReview.rating ? "#f59e0b" : "none"} stroke={s <= newReview.rating ? "#f59e0b" : "#cbd5e1"} size={36} />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <textarea
                                  value={newReview.comment}
                                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                  placeholder="Hãy chia sẻ trải nghiệm chân thực của bạn về sản phẩm này với cộng đồng Glowzy nhé..."
                                  className="glowzy-input min-h-[160px] resize-none p-8 text-base shadow-inner"
                                />
                                <button disabled={isSubmittingReview} className="glowzy-btn-primary w-full md:w-auto px-12 py-5 shadow-2xl shadow-primary-500/30">
                                  {isSubmittingReview ? 'Đang gửi...' : 'Gửi nhận xét ngay'}
                                </button>
                              </form>
                            </>
                          )}
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
                    <div className="grid grid-cols-1 gap-10">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                          <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary-600 font-black shadow-inner border border-gray-100 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                                {rev.userFullName?.[0] || 'U'}
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-lg uppercase tracking-tight leading-none mb-2">{rev.userFullName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60 italic">{new Date(rev.createdAt).toLocaleDateString('vi-VN')} {rev.isEdited && <span className='ml-2 text-primary-400 font-black'>(Đã chỉnh sửa)</span>}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center text-amber-500 gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm">
                                  {[1, 2, 3, 4, 5].map(s => <Star key={s} fill={s <= rev.ratingStar ? "currentColor" : "none"} size={14} />)}
                                </div>
                                {user && (String(user.id) == String(rev.userId) || rev.userFullName.includes(user.fullName) || user.fullName.includes(rev.userFullName)) && !rev.isEdited && (
                                   <button 
                                    onClick={() => setEditingReview({ ...rev })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm border border-primary-100"
                                   >
                                      <Edit2 size={12} />
                                      Chỉnh sửa
                                   </button>
                                )}
                            </div>
                          </div>

                          <div className="relative z-10 flex-1">
                            <p className="text-gray-600 leading-relaxed font-medium italic">"{rev.comment}"</p>
                            
                            {rev.adminReply && (
                              <div className="mt-6 ml-6 p-5 bg-primary-50 rounded-[1.5rem] border border-primary-100 relative">
                                <div className="absolute -left-3 top-6 w-3 h-px bg-primary-200"></div>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={14} className="text-primary-500" />
                                    <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Phản hồi từ Glowzy</span>
                                </div>
                                <p className="text-gray-600 text-sm font-semibold italic leading-relaxed">"{rev.adminReply}"</p>
                              </div>
                            )}
                          </div>

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

        {/* Edit Review Modal */}
        <AnimatePresence>
            {editingReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditingReview(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-10 md:p-12">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Cập nhật đánh giá</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Sản phẩm: {product.name}</p>
                                </div>
                                <button onClick={() => setEditingReview(null)} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                                    <Plus className="rotate-45 text-gray-400" size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateReview} className="space-y-8">
                                <div className="flex flex-col gap-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Chọn số sao đánh giá:</span>
                                    <div className="flex items-center gap-4">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button 
                                              key={s} 
                                              type="button" 
                                              onClick={() => setEditingReview({ ...editingReview, ratingStar: s })} 
                                              className="hover:scale-125 transition-transform active:scale-95"
                                            >
                                                <Star fill={s <= editingReview.ratingStar ? "#f59e0b" : "none"} stroke={s <= editingReview.ratingStar ? "#f59e0b" : "#cbd5e1"} size={40} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Nội dung đánh giá của bạn:</span>
                                    <textarea
                                        value={editingReview.comment}
                                        onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                                        className="glowzy-input min-h-[160px] resize-none p-6 text-base"
                                        placeholder="Nhập nội dung mới..."
                                    />
                                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
                                        <AlertCircle size={16} className="text-amber-500 shrink-0" />
                                        <p className="text-[11px] font-bold text-amber-600 italic">
                                            Lưu ý: Đánh giá này chỉ được phép chỉnh sửa <span className="underline decoration-2">01 lần duy nhất</span>.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setEditingReview(null)}
                                        className="glowzy-btn-secondary flex-1 py-4 uppercase tracking-widest text-xs"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        disabled={isUpdatingReview}
                                        className="glowzy-btn-primary flex-[2] py-4 shadow-xl shadow-primary-500/20"
                                    >
                                        {isUpdatingReview ? 'Đang cập nhật...' : 'Lưu thay đổi ngay'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-4 max-w-[1536px] mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-gray-100 pb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase italic flex items-center gap-4">
              <span className="w-2 h-10 bg-primary-500 rounded-sm"></span>
              Sản phẩm tương tự
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-3 uppercase tracking-widest opacity-70 italic">Có thể bạn cũng sẽ yêu thích những siêu phẩm này từ Glowzy.</p>
          </div>
        </div>

        {loadingRelated ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="text-primary-500 animate-spin" />
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {relatedProducts.map(p => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.currentPrice}
                originalPrice={p.originalPrice}
                image={p.imageUrl}
                categoryId={p.categoryId}
                brand={p.brand}
                views={p.viewCount}
                stockQuantity={p.stockQuantity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic">Chưa tìm thấy sản phẩm tương tự phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
