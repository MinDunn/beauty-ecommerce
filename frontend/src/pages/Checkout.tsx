import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, MapPin, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, totalAmount: subTotal } = useSelector((state: RootState) => state.cart);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const discount = subTotal > 1000000 ? 50000 : 0;
  const shippingFee = subTotal > 500000 ? 0 : 25000;
  const total = subTotal > 0 ? (subTotal - discount + shippingFee) : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4">
            Thanh Toán
          </h1>
          <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-500 font-bold uppercase tracking-widest">
            <Link to="/cart" className="hover:text-primary-500 transition-colors">Giỏ hàng</Link>
            <span>/</span>
            <span className="text-gray-900 border-b-2 border-primary-500">Xác nhận thanh toán</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Form & Methods */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
             
             {/* Shipping Information Form */}
             <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 md:p-10">
               <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><MapPin size={20} /></div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Địa chỉ giao hàng</h2>
               </div>
               
               <form className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                       <input type="text" placeholder="Nhập họ tên đầy đủ" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all font-medium text-gray-900" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                       <input type="tel" placeholder="Ví dụ: 0901234..." className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all font-medium text-gray-900" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Địa chỉ cụ thể (Thôn xóm, Số nhà, Ngõ ngách) <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Ví dụ: Số 1, Ngõ 2, Phường 3..." className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all font-medium text-gray-900" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                    <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all font-medium text-gray-900 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-no-repeat bg-[position:right_1.5rem_center] bg-[length:1.2em]">
                       <option value="">-- Chọn Tỉnh / Thành phố --</option>
                       <option value="sg">Tp. Hồ Chí Minh</option>
                       <option value="hn">Hà Nội</option>
                       <option value="dn">Đà Nẵng</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea rows={3} placeholder="Ví dụ: Giao ngoài giờ hành chính..." className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all font-medium text-gray-900 resize-none"></textarea>
                 </div>
               </form>
             </div>

             {/* Payment Methods */}
             <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 md:p-10 mb-8 lg:mb-0">
               <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><CreditCard size={20} /></div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Phương thức thanh toán</h2>
               </div>
               
               <div className="space-y-4">
                 <label className={`flex items-start md:items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 mt-1 md:mt-0 text-primary-600 border-gray-300 focus:ring-primary-500" />
                    <div className="ml-4 flex-1">
                       <div className="font-bold text-gray-900 text-lg flex items-center gap-2"><Banknote size={20} className="text-green-600"/> Thanh toán khi nhận hàng (COD)</div>
                       <p className="text-sm text-gray-500 mt-1">Trả tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.</p>
                    </div>
                 </label>

                 <label className={`flex items-start md:items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'transfer' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-100 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="w-5 h-5 mt-1 md:mt-0 text-primary-600 border-gray-300 focus:ring-primary-500" />
                    <div className="ml-4 flex-1">
                       <div className="font-bold text-gray-900 text-lg flex items-center gap-2"><Wallet size={20} className="text-blue-600"/> Chuyển khoản ngân hàng / Momo</div>
                       <p className="text-sm text-gray-500 mt-1">Hệ thống sẽ hiển thị mã QR Code để bạn quét thanh toán ở bước phía sau.</p>
                    </div>
                 </label>
               </div>
             </div>

          </div>

          {/* Right Column: Order Summary Sticky */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
             <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
               <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6 pb-4 border-b-2 border-gray-900 flex items-center">
                 Chi Tiết Đơn Hàng
               </h3>
               
               {/* Mini items list */}
               <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto hide-scrollbar pr-2">
                 {cartItems.map((item) => (
                   <div key={item.id} className="flex items-center gap-4 border-b border-gray-50 pb-4">
                     <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 p-2 border border-gray-100/50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-2 hover:text-primary-500">{item.name}</h4>
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-bold text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-lg">SL: {item.quantity}</span>
                           <span className="text-sm font-black text-primary-600">{item.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>

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
                    <span className="text-gray-900 font-bold">{shippingFee.toLocaleString('vi-VN')} đ</span>
                 </div>
               </div>

               <div className="pt-6 border-t border-gray-200 mb-8 bg-gray-50 -mx-8 px-8 pb-6">
                 <div className="flex justify-between items-end mb-4 pt-4">
                    <span className="text-sm font-black uppercase text-gray-800 tracking-widest">Tổng Thanh Toán</span>
                    <div className="flex flex-col items-end">
                       <span className="text-4xl font-black text-primary-600 tracking-tighter">{total.toLocaleString('vi-VN')} đ</span>
                       <span className="text-[10px] text-gray-400 font-medium mt-1 uppercase">(Đã bao gồm VAT)</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-green-600 bg-green-100/50 p-3 rounded-xl border border-green-200">
                    <ShieldCheck size={16} /> <span>An toàn và bảo mật thông tin 100%</span>
                 </div>
               </div>

               <button 
                className="w-full flex items-center justify-center gap-3 py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all hover:-translate-y-1 uppercase tracking-widest group"
                onClick={() => navigate('/order-success')}
               >
                 <span>Đặt Hàng Ngay</span>
                 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </button>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
