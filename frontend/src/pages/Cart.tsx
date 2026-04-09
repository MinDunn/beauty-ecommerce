import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeItem, updateQuantity } from '../store/slices/cartSlice';
import type { RootState } from '../store';

const Cart = () => {
  const dispatch = useDispatch();
  const { items: cartItems, totalAmount: subTotal } = useSelector((state: RootState) => state.cart);

  const handleUpdateQuantity = (id: string, delta: number) => {
    dispatch(updateQuantity({ id, delta }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
  };

  const discount = subTotal > 1000000 ? 50000 : 0; // Simple conditional discount
  const total = subTotal > 0 ? (subTotal - discount) : 0;

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
               <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                     <span className="text-5xl">🛍️</span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Giỏ hàng rỗng</h3>
                  <p className="text-gray-500 font-medium mb-8">Hãy dạo một vòng và tậu ngay vài món mỹ phẩm xịn nhé.</p>
                  <Link to="/" className="px-8 py-4 bg-primary-500 text-white font-black rounded-2xl uppercase tracking-widest hover:bg-primary-600 transition-colors">
                     Tiếp tục mua sắm
                  </Link>
               </div>
             ) : (
                <>
                  <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-black text-gray-400 uppercase tracking-widest px-6 pb-2">
                     <div className="col-span-6">Sản phẩm</div>
                     <div className="col-span-3 text-center">Đơn giá</div>
                     <div className="col-span-2 text-center">Số lượng</div>
                     <div className="col-span-1 text-right">Tuỳ chọn</div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                    {cartItems.map((item, index) => (
                      <div key={item.id} className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                         {/* Product Image & Info */}
                         <div className="col-span-1 md:col-span-6 flex items-start gap-5">
                            <div className="w-28 h-28 bg-gray-50 rounded-2xl flex-shrink-0 p-3 overflow-hidden border border-gray-100/50">
                               <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex flex-col pt-2 block overflow-hidden">
                               <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1.5">{item.brand}</span>
                               <Link to={`/product/${item.id}`} className="font-bold text-gray-800 text-sm md:text-base leading-snug line-clamp-2 hover:text-primary-600 transition-colors">
                                  {item.name}
                               </Link>
                            </div>
                         </div>
  
                         {/* Price (Desktop) */}
                         <div className="hidden md:block col-span-3 text-center">
                            <span className="font-black text-gray-900 text-lg">{item.price.toLocaleString('vi-VN')} đ</span>
                         </div>
  
                         {/* Controls (Mobile + Desktop combo) */}
                         <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                           <div className="md:hidden font-black text-primary-600 text-xl">{item.price.toLocaleString('vi-VN')} đ</div>
                           <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                              <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-white hover:text-primary-600 transition-colors">
                                <Minus size={14} />
                              </button>
                              <div className="w-10 h-9 flex items-center justify-center font-black text-gray-900 text-sm bg-white border-x-2 border-gray-100">
                                {item.quantity}
                              </div>
                              <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-white hover:text-primary-600 transition-colors">
                                <Plus size={14} />
                              </button>
                           </div>
                         </div>
  
                         {/* Delete Button */}
                         <div className="col-span-1 text-right flex justify-end">
                            <button onClick={() => handleRemoveItem(item.id)} className="w-12 h-12 bg-red-50/50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                               <Trash2 size={20} />
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                </>
             )}
          </div>

          {/* Right Column: Summary Sticky */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
             <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
               <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6 pb-4 border-b-2 border-gray-900 flex items-center">
                 Tóm Tắt Đơn 
               </h3>
               
               <div className="space-y-4 mb-6">
                 <div className="flex justify-between items-center text-gray-600 font-medium text-sm">
                    <span>Tạm tính</span>
                    <span className="text-gray-900 font-bold">{subTotal.toLocaleString('vi-VN')} đ</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-600 font-medium text-sm">
                    <span>Mã giảm giá/Voucher</span>
                    <span className="text-primary-500 font-bold bg-primary-50 px-2 py-0.5 rounded-md">- {discount.toLocaleString('vi-VN')} đ</span>
                 </div>
                 <div className="flex justify-between items-center text-gray-600 font-medium text-sm">
                    <span>Phí vận chuyển</span>
                    <span className="text-gray-500 italic">Tính ở bước sau</span>
                 </div>
               </div>

               <div className="pt-6 border-t border-gray-100 mb-8">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase text-gray-500 tracking-widest">Tổng Thanh Toán</span>
                    <div className="flex flex-col items-end">
                       <span className="text-4xl font-black text-primary-600 tracking-tighter">{total.toLocaleString('vi-VN')} đ</span>
                       <span className="text-[10px] text-gray-400 font-medium mt-1 uppercase">(Đã bao gồm VAT)</span>
                    </div>
                 </div>
               </div>

               <Link 
                to="/checkout"
                className={`w-full flex items-center justify-center gap-3 py-5 bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all hover:-translate-y-1 uppercase tracking-widest group ${cartItems.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
               >
                 <span>Thanh toán ngay</span>
                 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
