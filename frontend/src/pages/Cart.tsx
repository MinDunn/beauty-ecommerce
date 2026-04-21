import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeItem, updateQuantity, toggleItemSelection, toggleAllSelection } from '../store/slices/cartSlice';
import { cn } from '../utils/cn';
import type { RootState } from '../store';
import toast from 'react-hot-toast';

import { cartService } from '../api/cartService';

const Cart = () => {
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleUpdateQuantity = async (id: string, variantName: string | null | undefined, delta: number, name: string) => {
    const item = cartItems.find(i => i.id === id && i.variantName === variantName);
    if (!item) return;

    if (delta > 0) {
      if (item.quantity + delta > (item.stockQuantity || 0)) {
        toast.error(`Xin lỗi, chỉ còn ${item.stockQuantity} sản phẩm trong kho`);
        return;
      }
      toast.success(`Đã tăng số lượng ${name}${variantName ? ` (${variantName})` : ''}`);
    } else {
      toast.success(`Đã giảm số lượng ${name}${variantName ? ` (${variantName})` : ''}`);
    }
    
    dispatch(updateQuantity({ id, variantName, delta }));

    if (user) {
      try {
        await cartService.updateQuantity({
          productId: Number(id),
          quantity: item.quantity + delta,
          variantName: variantName || null
        });
      } catch (error) {
        console.error("Failed to sync quantity with backend", error);
      }
    }
  };

  const handleRemoveItem = async (id: string, variantName: string | null | undefined, name: string) => {
    dispatch(removeItem({ id, variantName }));

    if (user) {
      try {
        await cartService.removeFromCart(Number(id), variantName || null);
      } catch (error) {
        console.error("Failed to remove item from backend", error);
      }
    }

    toast.success(`Đã xóa ${name}${variantName ? ` (${variantName})` : ''} khỏi giỏ hàng`);
  };

  const handleToggleSelection = (id: string, variantName: string | null | undefined) => {
    dispatch(toggleItemSelection({ id, variantName }));
  };

  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(toggleAllSelection(e.target.checked));
  };

  const selectedItems = cartItems.filter(item => item.selected && (item.stockQuantity || 0) > 0);
  const isAllSelected = cartItems.length > 0 && cartItems.every(item => (item.stockQuantity || 0) <= 0 || item.selected);
  
  const selectedSubTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = selectedSubTotal > 1000000 ? 50000 : 0;
  const total = selectedSubTotal > 0 ? (selectedSubTotal - discount) : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-2">
          Giỏ Hàng <span className="text-primary-500 text-3xl font-bold ml-2">({cartItems.length})</span>
        </h1>
        <p className="text-gray-500 font-medium mb-10">Kiểm tra lại sản phẩm và tiến hành thanh toán đơn hàng.</p>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Cart Items list */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
             {cartItems.length === 0 ? (
               <div className="glowzy-card p-16 text-center flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                     <span className="text-5xl">🛍️</span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Giỏ hàng rỗng</h3>
                  <p className="text-gray-500 font-medium mb-8">Hãy dạo một vòng và tậu ngay vài món mỹ phẩm xịn nhé.</p>
                  <Link to="/" className="glowzy-btn-primary">
                     Tiếp tục mua sắm
                  </Link>
               </div>
             ) : (
                <>
                  <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-black text-gray-400 uppercase tracking-widest px-6 pb-4 border-b border-gray-100 mb-2">
                     <div className="col-span-1 flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={isAllSelected}
                          onChange={handleToggleAll}
                          className="w-5 h-5 rounded-lg border-2 border-gray-200 text-primary-500 focus:ring-primary-500 cursor-pointer transition-all"
                        />
                     </div>
                     <div className="col-span-5">Sản phẩm</div>
                     <div className="col-span-3 text-center">Đơn giá</div>
                     <div className="col-span-2 text-center">Số lượng</div>
                     <div className="col-span-1 text-right">Tuỳ chọn</div>
                  </div>

                  <div className="glowzy-card overflow-hidden">
                    {cartItems.map((item, index) => {
                       const isOutOfStock = (item.stockQuantity || 0) <= 0;
                       const isInsufficient = (item.stockQuantity || 0) < item.quantity;
                       
                       return (
                        <div key={`${item.id}-${item.variantName || 'none'}`} className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-8 group ${index !== cartItems.length - 1 ? 'border-b border-gray-100' : ''} ${item.selected ? 'bg-white' : 'bg-gray-50/30'} ${isOutOfStock ? 'opacity-70 grayscale' : ''}`}>
                           {/* Selector */}
                           <div className="col-span-1 flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                checked={!!item.selected && !isOutOfStock}
                                disabled={isOutOfStock}
                                onChange={() => handleToggleSelection(item.id, item.variantName)}
                                className={cn(
                                   "w-6 h-6 rounded-xl border-2 border-gray-200 text-primary-500 focus:ring-primary-400 transition-all hover:scale-110 checked:border-primary-500",
                                   isOutOfStock ? "cursor-not-allowed opacity-30" : "cursor-pointer"
                                )}
                              />
                           </div>

                          {/* Product Image & Info */}
                          <div className="col-span-1 md:col-span-5 flex items-start gap-6">
                             <div className="w-28 h-28 bg-gray-50 rounded-2xl flex-shrink-0 p-3 overflow-hidden border border-gray-100 transition-all group-hover:border-primary-200 shadow-sm">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                             </div>
                             <div className="flex flex-col pt-2 overflow-hidden">
                                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1.5 opacity-70 italic">{item.brand}</span>
                                <Link to={`/product/${item.id}`} className={cn(
                                   "font-black text-sm md:text-base leading-snug line-clamp-2 hover:text-primary-600 transition-colors",
                                   item.selected ? "text-gray-800" : "text-gray-400"
                                )}>
                                   {item.name}
                                </Link>
                                {item.variantName && (
                                   <div className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg w-fit italic border border-gray-100">
                                      Loại: {item.variantName}
                                   </div>
                                )}
                                 
                                 <div className="mt-2 flex flex-wrap gap-2">
                                    {isOutOfStock ? (
                                       <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-lg uppercase tracking-tighter border border-red-100">Hết hàng</span>
                                    ) : isInsufficient ? (
                                       <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg uppercase tracking-tighter border border-orange-100">Chỉ còn {item.stockQuantity} sp</span>
                                    ) : (
                                       <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-tighter border border-green-100 italic">Còn {item.stockQuantity} sản phẩm</span>
                                    )}
                                 </div>
                              </div>
                           </div>
  
                         {/* Price (Desktop) */}
                         <div className="hidden md:block col-span-3 text-center">
                            <span className="font-black text-gray-900 text-lg tracking-tight">{item.price.toLocaleString('vi-VN')} đ</span>
                         </div>
  
                          {/* Controls */}
                          <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                            <div className="md:hidden font-black text-primary-600 text-xl">{item.price.toLocaleString('vi-VN')} đ</div>
                             <div className="flex items-center border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, item.variantName, -1, item.name)} 
                                  disabled={isOutOfStock}
                                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-primary-600 transition-all disabled:opacity-30"
                                >
                                  <Minus size={14} />
                                </button>
                                <div className="w-12 h-10 flex items-center justify-center font-black text-gray-900 text-sm border-x-2 border-gray-100 bg-gray-50/20">
                                  {isOutOfStock ? 0 : item.quantity}
                                </div>
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, item.variantName, 1, item.name)}
                                  disabled={isOutOfStock || (item.stockQuantity || 0) <= item.quantity}
                                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-primary-600 transition-all disabled:opacity-30"
                                >
                                  <Plus size={14} />
                                </button>
                             </div>
                          </div>
   
                          {/* Delete Button */}
                          <div className="col-span-1 text-right flex justify-end">
                             <button onClick={() => handleRemoveItem(item.id, item.variantName, item.name)} className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white hover:rotate-12 transition-all shadow-sm">
                                <Trash2 size={20} />
                             </button>
                          </div>
                       </div>
                    )})}
                  </div>
                </>
             )}
          </div>

          {/* Right Column: Summary Sticky */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
             <div className="glowzy-card p-10">
               <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8 pb-4 border-b-2 border-gray-900">
                 Tóm Tắt Đơn 
               </h3>
               
               <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-gray-500 font-bold text-sm italic">
                    <span>Tạm tính ({selectedItems.length} món)</span>
                    <span className="text-gray-900">{selectedSubTotal.toLocaleString('vi-VN')} đ</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-500 font-bold text-sm italic">
                    <span>Voucher giảm giá</span>
                    <span className="text-primary-500 bg-primary-50 px-3 py-1 rounded-xl">- {discount.toLocaleString('vi-VN')} đ</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-400 font-bold text-xs uppercase tracking-widest pl-1 border-l-2 border-gray-100">
                    <span>Phí vận chuyển</span>
                    <span className="italic text-[10px]">Tính ở bước sau</span>
                 </div>
               </div>

               <div className="pt-8 border-t border-gray-100 mb-10">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Tổng cộng</span>
                    <div className="flex flex-col items-end">
                       <span className="text-4xl font-black text-primary-600 tracking-tighter drop-shadow-sm">{total.toLocaleString('vi-VN')} đ</span>
                       <span className="text-[9px] text-gray-300 font-black mt-1 uppercase italic">(Bao gồm VAT)</span>
                    </div>
                 </div>
               </div>

               <Link 
                to="/checkout"
                className={cn(
                  "glowzy-btn-primary w-full py-6 flex items-center justify-center gap-4 group transition-all",
                  selectedItems.length === 0 && "opacity-50 pointer-events-none grayscale"
                )}
               >
                 <span>Thanh toán đơn hàng</span>
                 <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-300" />
               </Link>

               <div className="mt-8 flex items-center justify-center gap-4 text-gray-400">
                  <div className="w-12 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                  <div className="w-12 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold">MASTER</div>
                  <div className="w-12 h-8 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold">MOMO</div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
