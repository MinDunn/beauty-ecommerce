import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  CreditCard, 
  Wallet, 
  Banknote, 
  ChevronRight, 
  Check,
  ChevronLeft,
  Truck
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { cn } from '../utils/cn';

const STAGES = [
  { id: 1, name: 'Vận chuyển', icon: Truck },
  { id: 2, name: 'Thanh toán', icon: CreditCard },
  { id: 3, name: 'Xác nhận', icon: Check },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items: cartItems, totalAmount: subTotal } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Summary Calculations
  const discount = useMemo(() => subTotal > 1000000 ? 50000 : 0, [subTotal]);
  const shippingFee = useMemo(() => subTotal > 500000 ? 0 : 25000, [subTotal]);
  const total = useMemo(() => subTotal > 0 ? (subTotal - discount + shippingFee) : 0, [subTotal, discount, shippingFee]);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate real order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    navigate('/order-success');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
          <Truck size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-8">Vui lòng chọn sản phẩm trước khi thanh toán.</p>
        <Link to="/" className="bg-primary-500 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Checkout Header / Progress */}
      <div className="bg-slate-900 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
           <div className="flex justify-between items-center mb-12">
             {STAGES.map((stage, i) => (
                <div key={stage.id} className="flex flex-col items-center flex-1 relative">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10",
                     currentStep >= stage.id 
                      ? "bg-primary-500 text-white shadow-xl shadow-primary-500/30" 
                      : "bg-slate-800 text-slate-500"
                   )}>
                      <stage.icon size={20} />
                   </div>
                   <span className={cn(
                     "text-[10px] font-black uppercase tracking-widest mt-4",
                     currentStep >= stage.id ? "text-white" : "text-slate-600"
                   )}>{stage.name}</span>
                   
                   {i < STAGES.length - 1 && (
                     <div className={cn(
                       "absolute top-6 left-1/2 w-full h-[2px] -z-0",
                       currentStep > stage.id ? "bg-primary-500" : "bg-slate-800"
                     )} />
                   )}
                </div>
             ))}
           </div>
           
           <div className="text-center">
             <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Thanh <span className="text-primary-500">Toán</span></h1>
             <p className="text-slate-400 mt-4 font-medium italic">Glowzy cam kết bảo mật thông tin khách hàng tuyệt đối.</p>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="w-full lg:w-2/3 space-y-8">
             {/* Step 1: Shipping */}
             {currentStep === 1 && (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4">
                   <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase flex items-center gap-3">
                     <MapPin className="text-primary-500" size={24} /> 1. Thông tin giao hàng
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                        <input type="text" defaultValue={user?.name} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold" placeholder="Tên của bạn..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                        <input type="tel" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold" placeholder="09xxx..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ cụ thể</label>
                        <input type="text" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold" placeholder="Số nhà, tên đường, phường/xã..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú</label>
                        <textarea rows={3} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold resize-none" placeholder="Lời nhắn cho shipper..." />
                      </div>
                   </div>
                   <button onClick={handleNext} className="mt-10 w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-500 transition-all shadow-xl active:scale-95">
                      <span>Tiếp tục thanh toán</span>
                      <ArrowRight size={18} />
                   </button>
                </div>
             )}

             {/* Step 2: Payment */}
             {currentStep === 2 && (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4">
                   <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase flex items-center gap-3">
                     <CreditCard className="text-primary-500" size={24} /> 2. Phương thức thanh toán
                   </h2>
                   <div className="space-y-4">
                     {[
                       { id: 'cod', name: 'Thanh toán COD', desc: 'Trả tiền mặt khi nhận hàng', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                       { id: 'transfer', name: 'Chuyển khoản / Ví', desc: 'MoMo, VNPAY, Ngân hàng', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50' }
                     ].map((method) => (
                       <label key={method.id} className={cn(
                         "flex items-center p-6 rounded-[2rem] border-2 cursor-pointer transition-all",
                         paymentMethod === method.id ? "border-primary-500 bg-primary-50/20" : "border-gray-50 hover:border-gray-200"
                       )}>
                          <input type="radio" name="pay" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="w-6 h-6 text-primary-500" />
                          <div className="ml-6 flex-1">
                             <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-xl", method.bg, method.color)}>
                                  <method.icon size={20} />
                                </div>
                                <span className="font-black text-slate-900">{method.name}</span>
                             </div>
                             <p className="text-gray-400 text-xs font-bold mt-1 ml-11">{method.desc}</p>
                          </div>
                          {paymentMethod === method.id && <Check className="text-primary-500" size={24} />}
                       </label>
                     ))}
                   </div>
                   
                   <div className="mt-12 flex gap-4">
                      <button onClick={handleBack} className="flex-1 py-5 bg-gray-100 text-slate-600 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                        <ChevronLeft size={18} />
                        <span>Quay lại</span>
                      </button>
                      <button onClick={handleNext} className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-500 transition-all shadow-xl">
                        <span>Xác nhận đơn hàng</span>
                        <ChevronRight size={18} />
                      </button>
                   </div>
                </div>
             )}

             {/* Step 3: Final Confirm */}
             {currentStep === 3 && (
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4">
                   <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase flex items-center gap-3">
                     <Check className="text-primary-500" size={24} /> 3. Xác nhận cuối cùng
                   </h2>
                   
                   <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 space-y-6">
                      <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Giao tới</p>
                            <p className="font-black text-slate-900">Nguyễn Văn Admin</p>
                            <p className="text-sm text-gray-500 font-medium">123 Đường Glowzy, P. Đẹp, Quận 1, TP. HCM</p>
                         </div>
                         <button onClick={() => setCurrentStep(1)} className="text-primary-500 font-black text-xs uppercase tracking-widest hover:underline">Thay đổi</button>
                      </div>
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Thanh toán</p>
                            <p className="font-black text-slate-900 uppercase">{paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}</p>
                         </div>
                         <button onClick={() => setCurrentStep(2)} className="text-primary-500 font-black text-xs uppercase tracking-widest hover:underline">Thay đổi</button>
                      </div>
                   </div>

                   <p className="mt-8 text-center text-sm text-gray-400 font-medium leading-relaxed italic">
                     Bằng việc nhấn đặt hàng, bạn đồng ý với các Điều khoản & Chính sách của Glowzy về việc mua bán hàng hóa.
                   </p>

                   <div className="mt-12 flex gap-4">
                      <button onClick={handleBack} className="flex-1 py-5 bg-gray-100 text-slate-600 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                        <ChevronLeft size={18} />
                        <span>Quay lại</span>
                      </button>
                      <button 
                        onClick={handlePlaceOrder} 
                        disabled={isProcessing}
                        className="flex-[2] py-5 bg-primary-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/30 disabled:opacity-70"
                      >
                         {isProcessing ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                           <>
                              <span>Đặt hàng ngay</span>
                              <Check size={18} />
                           </>
                         )}
                      </button>
                   </div>
                </div>
             )}
          </div>

          {/* Right Column: Mini Summary */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
             <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8 pb-4 border-b border-white/10">
                  Tóm tắt đơn hàng
                </h3>
                
                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                         <div className="w-14 h-14 rounded-xl bg-white/5 p-2 flex-shrink-0 border border-white/5">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-bold text-slate-300 line-clamp-1 uppercase tracking-tight">{item.name}</h4>
                            <div className="flex justify-between items-center mt-1">
                               <span className="text-[10px] text-slate-500 font-black">X{item.quantity}</span>
                               <span className="text-xs font-black text-primary-400">{item.price.toLocaleString()}đ</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="space-y-4 py-8 border-t border-white/10">
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Tạm tính</span>
                      <span className="text-white">{subTotal.toLocaleString()}đ</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Giảm giá</span>
                      <span className="text-primary-500">-{discount.toLocaleString()}đ</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Vận chuyển</span>
                      <span className="text-white">{shippingFee === 0 ? 'MIỄN PHÍ' : `${shippingFee.toLocaleString()}đ`}</span>
                   </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                   <div className="flex justify-between items-end mb-6">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tổng cộng</span>
                      <div className="text-right">
                         <p className="text-3xl font-black text-white tracking-widest">{total.toLocaleString()}đ</p>
                         <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-widest italic">Giá đã bao gồm VAT</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <ShieldCheck size={14} className="text-primary-500" />
                      <span>Thanh toán an toàn 100%</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
