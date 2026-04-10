import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  brand?: string;
}

export const ProductCard = ({ id, name, price, originalPrice, image, badge, brand = "Glowzy" }: ProductCardProps) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItem({
      id,
      name,
      price,
      image,
      brand,
      quantity: 1
    }));
  };

  return (
    <Link to={`/product/${id}`} className="block group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-white p-4 flex items-center justify-center">
        {badge && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg z-10 shadow-sm">
            {badge}
          </span>
        )}
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
        />
        {/* Quick Add Button overlay */}
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg text-primary-500 hover:bg-primary-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 z-20"
        >
          <ShoppingCart size={20} />
        </button>
      </div>
      <div className="p-4 pt-2">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 min-h-[40px] mb-2 group-hover:text-primary-500 transition-colors">
          {name}
        </h3>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-black text-primary-600 text-lg lg:text-xl tracking-tighter">
              {price.toLocaleString('vi-VN')} đ
            </div>
            {originalPrice && (
              <div className="text-xs text-gray-400 line-through font-medium">
                {originalPrice.toLocaleString('vi-VN')} đ
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
