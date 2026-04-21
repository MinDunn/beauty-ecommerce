import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import type { RootState } from '../../store';
import wishlistService from '../../api/wishlistService';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  brand?: string;
  reviewCount?: number;
  views?: number;
  categoryId?: number;
  stockQuantity?: number;
}

const resolveProductImage = (image?: string) => {
  if (!image) return 'https://placehold.co/600x600/f8fafc/64748b?text=Glowzy+Beauty';
  if (image.startsWith('/images/http')) return image.replace('/images/', '');
  if (image.startsWith('/images//uploads/')) return image.replace('/images/', '');
  if (image.startsWith('http') || image.startsWith('/uploads/') || image.startsWith('/images/')) return image;
  return `/images/${image.replace(/^\/+/, '')}`;
};

export const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  badge,
  brand = "Glowzy",
  reviewCount,
  views = 0,
  categoryId,
  stockQuantity = 100 // Default to in stock if not provided
}: ProductCardProps) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const resp = await wishlistService.checkWishlist(Number(id));
        setIsWishlisted(resp.data.data);
      } catch {
        // Ignore
      }
    };

    if (isAuthenticated && !isNaN(Number(id))) {
      checkStatus();
    }
  }, [id, user]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stockQuantity <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    dispatch(addItem({
      id,
      name,
      price,
      image,
      brand,
      quantity: 1,
      variantName: null,
      categoryId
    }));
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm');
      return;
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
      return;
    }

    const prev = isWishlisted;
    setIsWishlisted(!prev);
    try {
      if (prev) {
        await wishlistService.removeFromWishlist(numericId);
      } else {
        await wishlistService.addToWishlist(numericId);
      }
    } catch {
      setIsWishlisted(prev);
      toast.error('Lỗi khi cập nhật yêu thích');
    }
  };

  return (
    <Link 
      to={`/product/${id}`} 
      className="glowzy-card block group overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {/* View Count - Top Left (No Background) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-gray-400 font-black text-[11px] transition-colors group-hover:text-primary-500 drop-shadow-sm">
          <Eye size={14} strokeWidth={2.5} />
          <span>{(views || 0).toLocaleString()}</span>
        </div>

        {(badge || reviewCount === 0) && (
          <span className={cn(
            "absolute top-11 left-4 text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg z-10 shadow-lg transition-transform group-hover:scale-110",
            badge ? "bg-red-500 shadow-red-500/20" : "bg-primary-600 shadow-primary-600/20"
          )}>
            {badge || "MỚI"}
          </span>
        )}
        
        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition-all z-20 shadow-lg ${isWishlisted ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 border border-gray-100 hover:text-red-500 active:scale-90'}`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <img 
          src={resolveProductImage(image)} 
          alt={name} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f8fafc/64748b?text=Glowzy+Beauty';
          }}
          className={cn(
            "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700",
            stockQuantity <= 0 && "grayscale opacity-60"
          )}
        />
        {stockQuantity <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black/60 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/20">
              Đã hết hàng
            </div>
          </div>
        )}
        {/* Quick Add Button overlay */}
        <button 
          onClick={handleAddToCart}
          disabled={stockQuantity <= 0}
          className={cn(
            "absolute bottom-4 right-4 p-2.5 rounded-full shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-20 transition-all duration-300",
            stockQuantity <= 0 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-primary-500 text-white hover:scale-110 active:scale-95"
          )}
          title={stockQuantity <= 0 ? "Hết hàng" : "Thêm nhanh vào giỏ"}
        >
          <ShoppingCart size={16} />
        </button>
      </div>
      <div className="p-6 pt-2">
        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[40px] mb-3 group-hover:text-primary-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-x-2 gap-y-1 flex-wrap mt-2">
          <div className="font-black text-primary-600 text-xl tracking-tighter whitespace-nowrap">
            {price.toLocaleString('vi-VN')}đ
          </div>
          {originalPrice && originalPrice > price && (
            <>
              <span className="text-xs text-gray-400 line-through font-bold opacity-60">
                {originalPrice.toLocaleString('vi-VN')}đ
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
