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
  Truck,
  Ticket
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import couponService from '../api/couponService';
import type { CouponData } from '../api/couponService';

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
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Summary Calculations
  const shippingFee = useMemo(() => subTotal > 500000 ? 0 : 25000, [subTotal]);
  
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    
    let calcDiscount = 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      calcDiscount = (subTotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && calcDiscount > appliedCoupon.maxDiscount) {
        calcDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      calcDiscount = appliedCoupon.discountValue;
    }
    return calcDiscount;
  }, [subTotal, appliedCoupon]);

  const total = useMemo(() => Math.max(0, subTotal - discount + shippingFee), [subTotal, discount, shippingFee]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    const loadingToast = toast.loading('Đang kiểm tra mã...');
    try {
      const resp = await couponService.validate(couponCode, subTotal);
      setAppliedCoupon(resp.data.data);
      toast.success('Áp dụng mã giảm giá thành công!', { id: loadingToast });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Không thể áp dụng mã này';
      toast.error(errMsg, { id: loadingToast });
      setAppliedCoupon(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const loadingToast = toast.loading('Đang xử lý thanh toán...');
    // Simulate real order processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsProcessing(false);
    toast.success('Thanh toán thành công!', { id: loadingToast });
    navigate('/order-success');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
          <Truck size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Giỏ hàng của bạn đang <span className="text-primary-500">trống</span></h2>
        <p className="text-gray-500 mb-8 italic font-medium leading-relaxed">Vui lòng chọn sản phẩm trước khi thanh toán khách yêu nhé!</p>
        <Link to="/" className="bg-primary-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary-500/20 active:scale-95">Mua sắm ngay</Link>
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
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">Thanh <span className="text-primary-500">Toán</span></h1>
              <p className="text-slate-400 mt-4 font-bold tracking-widest uppercase text-[10px] opacity-80 italic">Glowzy cam kết bảo mật 100%</p>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="w-full lg:w-2/3 space-y-8">
             {/* Step 1: Shipping */}
             {currentStep === 1 && (
                 <div className="glowzy-card p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase flex items-center gap-3">
                      <MapPin className="text-primary-500" size={24} /> 1. Vận chuyển
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
                    <button onClick={handleNext} className="glowzy-btn-primary mt-10 w-full py-6 flex items-center justify-center gap-4">
                       <span>Tiếp tục thanh toán</span>
                       <ArrowRight size={20} />
                    </button>
                </div>
             )}

             {/* Step 2: Payment */}
             {currentStep === 2 && (
                 <div className="glowzy-card p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase flex items-center gap-3">
                      <CreditCard className="text-primary-500" size={24} /> 2. Thanh toán
                    </h2>
                    <div className="space-y-4">
                      {[
                        { id: 'cod', name: 'Thanh toán COD', desc: 'Nhận hàng rồi mới trả tiền mặt', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                        { id: 'transfer', name: 'Chuyển khoản / Ví', desc: 'Nhanh chóng & Bảo mật qua MoMo, VNPAY', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50' }
                      ].map((method) => (
                        <label key={method.id} className={cn(
                          "flex items-center p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300",
                          paymentMethod === method.id 
                            ? "border-primary-500 bg-primary-50/10 shadow-lg shadow-primary-500/5 -translate-y-1" 
                            : "border-gray-50 hover:border-gray-200"
                        )}>
                           <input type="radio" name="pay" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="w-5 h-5 text-primary-500 focus:ring-primary-500" />
                           <div className="ml-6 flex-1">
                              <div className="flex items-center gap-3">
                                 <div className={cn("p-2.5 rounded-xl transition-colors", method.bg, method.color)}>
                                   <method.icon size={22} />
                                 </div>
                                 <span className="font-black text-gray-900 tracking-tight">{method.name}</span>
                              </div>
                              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5 ml-12 opacity-70">{method.desc}</p>
                           </div>
                           {paymentMethod === method.id && <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white scale-110"><Check size={14} strokeWidth={4} /></div>}
                        </label>
                      ))}
                    </div>
                                      <div className="mt-12 flex gap-4">
                       <button onClick={handleBack} className="glowzy-btn-secondary flex-1 py-5 flex items-center justify-center gap-3">
                         <ChevronLeft size={20} />
                         <span>Quay lại</span>
                       </button>
                       <button onClick={handleNext} className="glowzy-btn-primary flex-[2] py-5 flex items-center justify-center gap-3">
                         <span>Xác nhận đơn hàng</span>
                         <ChevronRight size={20} />
                       </button>
                    </div>
                </div>
             )}

             {/* Step 3: Final Confirm */}
             {currentStep === 3 && (
                 <div className="glowzy-card p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase flex items-center gap-3">
                      <Check className="text-primary-500" size={24} /> 3. Xác nhận đơn
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
                       <button onClick={handleBack} className="glowzy-btn-secondary flex-1 py-5 flex items-center justify-center gap-3">
                         <ChevronLeft size={20} />
                         <span>Quay lại</span>
                       </button>
                       <button 
                         onClick={handlePlaceOrder} 
                         disabled={isProcessing}
                         className="glowzy-btn-primary flex-[2] py-5 flex items-center justify-center gap-4"
                       >
                          {isProcessing ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                               <span>Hoàn tất đặt hàng</span>
                               <Check size={20} strokeWidth={3} />
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
                      <div key={item.id} className="flex gap-4 group">
                         <div className="w-14 h-14 rounded-xl bg-white/5 p-2 flex-shrink-0 border border-white/5 transition-all group-hover:border-primary-500/50">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-bold text-slate-300 line-clamp-1 uppercase tracking-tight group-hover:text-primary-400 transition-colors">{item.name}</h4>
                            <div className="flex justify-between items-center mt-1">
                               <span className="text-[10px] text-slate-500 font-black">X{item.quantity}</span>
                               <span className="text-xs font-black text-primary-400">{item.price.toLocaleString()}đ</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Ticket size={14} className="text-primary-500" />
                      Mã giảm giá
                   </p>
                   <div className="flex gap-2">
                      <input 
                       type="text" 
                       value={couponCode}
                       onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                       placeholder="NHẬP MÃ..." 
                       className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-white font-black text-xs outline-none focus:ring-1 focus:ring-primary-500 transition-all uppercase placeholder:text-slate-600"
                      />
                      <button 
                       onClick={handleApplyCoupon}
                       disabled={isApplying || !couponCode}
                       className="px-6 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-primary-500 transition-all border border-transparent hover:border-primary-500 disabled:opacity-50"
                      >
                         {isApplying ? '...' : 'Áp dụng'}
                      </button>
                   </div>
                   {appliedCoupon && (
                      <div className="mt-3 flex items-center justify-between px-3 py-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
                         <span className="text-[10px] font-black text-primary-500 uppercase tracking-tight italic">Đã áp dụng: {appliedCoupon.code}</span>
                         <button onClick={() => setAppliedCoupon(null)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase transition-colors">Gỡ bỏ</button>
                      </div>
                   )}
                </div>

                <div className="space-y-4 py-8 border-t border-white/10">
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Tạm tính</span>
                      <span className="text-white">{subTotal.toLocaleString()}đ</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Giảm giá</span>
                      <span className={cn("transition-all font-black", discount > 0 ? "text-primary-500" : "text-slate-600")}>
                         -{discount.toLocaleString()}đ
                      </span>
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
                         <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-widest italic font-medium">Giá đã bao gồm VAT & Phí bảo hiểm</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <ShieldCheck size={14} className="text-primary-500" />
                      <span className="italic">Thanh toán an toàn 100% bởi Glowzy Security</span>
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
