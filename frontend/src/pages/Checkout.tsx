import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
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
  Ticket,
  Minus,
  Plus,
  Trash2
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import couponService from '../api/couponService';
import type { CouponData } from '../api/couponService';
import { clearSelectedItems, updateQuantity, removeItem } from '../store/slices/cartSlice';
import { orderService } from '../api/orderService';
import authService from '../api/authService';
import { updateUser } from '../store/slices/authSlice';
import { cartService } from '../api/cartService';
import { VoucherDrawer } from '../components/checkout/VoucherDrawer';

const STAGES = [
  { id: 1, name: 'Vận chuyển', icon: Truck },
  { id: 2, name: 'Thanh toán', icon: CreditCard },
  { id: 3, name: 'Xác nhận', icon: Check },
];

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: allCartItems } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  const selectedItems = useMemo(() => allCartItems.filter(item => item.selected), [allCartItems]);
  const subTotal = useMemo(() => selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), [selectedItems]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    receiverName: user?.fullName || '',
    receiverPhone: user?.phone || '',
    shippingAddress: user?.address || '',
    note: ''
  });

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (user) {
        try {
          const resp = await authService.getProfile();
          const profileData = resp.data.data;
          
          // Pre-fill if current fields are empty
          setShippingInfo(prev => ({
            ...prev,
            receiverName: prev.receiverName || profileData.fullName || '',
            receiverPhone: prev.receiverPhone || profileData.phone || '',
            shippingAddress: prev.shippingAddress || profileData.address || ''
          }));

          // Sync with Redux store for future use
          dispatch(updateUser({
            fullName: profileData.fullName,
            phone: profileData.phone,
            address: profileData.address
          }));
        } catch (error) {
          console.error('Error fetching latest profile for checkout', error);
        }
      }
    };
    fetchLatestProfile();
  }, [user, dispatch]);

  const handleUpdateQuantity = async (id: string, variantName: string | null | undefined, delta: number, name: string) => {
    const item = selectedItems.find(i => i.id === id && i.variantName === variantName);
    if (!item) return;

    if (delta > 0) {
      if (item.quantity + delta > (item.stockQuantity || 0)) {
        toast.error(`Xin lỗi, chỉ còn ${item.stockQuantity} sản phẩm trong kho`);
        return;
      }
      toast.success(`Đã tăng số lượng ${name}`);
    } else {
      toast.success(`Đã giảm số lượng ${name}`);
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
    toast.success(`Đã xóa ${name}`);
  };
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<(CouponData & { discountAmount?: number }) | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false);


  const handleSelectVoucher = (code: string) => {
    setCouponCode(code);
    setIsVoucherDrawerOpen(false);
    // Auto apply
    setTimeout(() => {
       const btn = document.getElementById('apply-coupon-btn');
       if (btn) btn.click();
    }, 100);
  };

  // Summary Calculations
  const shippingFee = useMemo(() => subTotal > 500000 ? 0 : 25000, [subTotal]);
  
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    
    // Use Server-calculated discountAmount if available, otherwise fallback to local calculation
    if (appliedCoupon.discountAmount !== undefined) {
      return appliedCoupon.discountAmount;
    }

    let calcDiscount = 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      calcDiscount = (subTotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount && calcDiscount > appliedCoupon.maxDiscountAmount) {
        calcDiscount = appliedCoupon.maxDiscountAmount;
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
      const categoryIds = selectedItems.map(item => item.categoryId).filter(id => id !== undefined) as number[];
      const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
      const resp = await couponService.validate(couponCode, subTotal, categoryIds, totalQuantity);
      
      // The API now returns the calculated discountAmount which accounts for maxDiscountAmount
      const couponData = resp.data.data;
      setAppliedCoupon(couponData);
      
      toast.success('Áp dụng mã giảm giá thành công!', { id: loadingToast });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errMsg = axiosError.response?.data?.message || 'Không thể áp dụng mã này';
      toast.error(errMsg, { id: loadingToast });
      setAppliedCoupon(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!shippingInfo.receiverName || !shippingInfo.receiverPhone || !shippingInfo.shippingAddress) {
        toast.error('Vui lòng điền đầy đủ thông tin vận chuyển');
        return;
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Đang xử lý đơn hàng của bạn...');
    try {
      const orderData = {
        receiverName: shippingInfo.receiverName,
        receiverPhone: shippingInfo.receiverPhone,
        shippingAddress: shippingInfo.shippingAddress,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
        checkoutItems: selectedItems.map(item => ({
          productId: Number(item.id),
          variantName: item.variantName || null
        }))
      };

      const response = await orderService.placeOrder(orderData);
      
      // Bỏ qua thanh toán tự động, chuyển thẳng tới trang thành công với thông tin đơn hàng
      toast.success('Đặt hàng thành công! Cảm ơn bạn đã tin dùng Glowzy.', { id: loadingToast });
      dispatch(clearSelectedItems());
      
      // Chuyển hướng tới trang thành công, truyền orderId và thông tin thanh toán
      navigate('/order-success', { 
        state: { 
          orderId: response.id,
          paymentMethod: paymentMethod,
          totalAmount: total
        } 
      });
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Có lỗi xảy ra khi xử lý đặt hàng';
      toast.error(errMsg, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedItems.length === 0) {
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
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên người nhận</label>
                         <input 
                           type="text" 
                           value={shippingInfo.receiverName} 
                           onChange={(e) => setShippingInfo({...shippingInfo, receiverName: e.target.value})}
                           className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold" 
                           placeholder="Tên người nhận..." 
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                         <input 
                           type="tel" 
                           value={shippingInfo.receiverPhone}
                           onChange={(e) => setShippingInfo({...shippingInfo, receiverPhone: e.target.value})}
                           className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold" 
                           placeholder="09xxx..." 
                         />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ nhận hàng cụ thể</label>
                         <input 
                           type="text" 
                           value={shippingInfo.shippingAddress}
                           onChange={(e) => setShippingInfo({...shippingInfo, shippingAddress: e.target.value})}
                           className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold" 
                           placeholder="Số nhà, tên đường, phường/xã..." 
                         />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú (Không bắt buộc)</label>
                         <textarea 
                           rows={3} 
                           value={shippingInfo.note}
                           onChange={(e) => setShippingInfo({...shippingInfo, note: e.target.value})}
                           className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-bold resize-none" 
                           placeholder="Lời nhắn cho shipper..." 
                         />
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
                         { id: 'momo', name: 'Thanh toán MOMO', desc: 'Nhanh chóng & Bảo mật qua ứng dụng MoMo', icon: Wallet, color: 'text-pink-500', bg: 'bg-pink-50' }
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
                             <p className="font-black text-slate-900 uppercase tracking-tight">{shippingInfo.receiverName}</p>
                             <p className="text-sm text-gray-500 font-medium">{shippingInfo.shippingAddress}</p>
                             <p className="text-xs text-slate-400 font-bold mt-1 uppercase italic">SĐT: {shippingInfo.receiverPhone}</p>
                          </div>
                          <button onClick={() => setCurrentStep(1)} className="text-primary-500 font-black text-xs uppercase tracking-widest hover:underline">Thay đổi</button>
                       </div>
                       <div className="flex justify-between items-center">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Thanh toán</p>
                             <p className="font-black text-slate-900 uppercase">{paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'MoMo'}</p>
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
                
                <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedItems.map((item) => (
                       <div key={`${item.id}-${item.variantName || 'none'}`} className="flex gap-4 group">
                          <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 flex-shrink-0 border border-white/5 transition-all group-hover:border-primary-500/50 shadow-inner">
                             <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-screen" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start gap-2">
                                <h4 className="text-[10px] font-black text-slate-100 line-clamp-1 uppercase tracking-tight group-hover:text-primary-400 transition-colors">
                                   {item.name}
                                </h4>
                                <button 
                                  onClick={() => handleRemoveItem(item.id, item.variantName, item.name)}
                                  className="text-slate-600 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                             </div>
                             {item.variantName && (
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5 italic">Loại: {item.variantName}</p>
                             )}
                             <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                                   <button 
                                      onClick={() => handleUpdateQuantity(item.id, item.variantName, -1, item.name)}
                                      className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-primary-500 transition-colors"
                                   >
                                      <Minus size={10} strokeWidth={3} />
                                   </button>
                                   <span className="w-8 text-[10px] text-center font-black text-slate-200 bg-white/5">{item.quantity}</span>
                                   <button 
                                      onClick={() => handleUpdateQuantity(item.id, item.variantName, 1, item.name)}
                                      className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-primary-500 transition-colors"
                                   >
                                      <Plus size={10} strokeWidth={3} />
                                   </button>
                                </div>
                                <span className="text-xs font-black text-primary-400 tracking-tighter">{(item.price * item.quantity).toLocaleString()}đ</span>
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
                       id="apply-coupon-btn"
                       onClick={handleApplyCoupon}
                       disabled={isApplying || !couponCode}
                       className="px-6 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-primary-500 transition-all border border-transparent hover:border-primary-500 disabled:opacity-50"
                      >
                         {isApplying ? '...' : 'Áp dụng'}
                      </button>
                   </div>

                    <button 
                      onClick={() => setIsVoucherDrawerOpen(true)}
                      className="mt-4 flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors group"
                    >
                      <Ticket size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest group-hover:underline">Chọn hoặc nhập mã giảm giá</span>
                      <ChevronRight size={10} strokeWidth={3} />
                    </button>

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

      {/* Voucher Selection Drawer */}
      <VoucherDrawer 
        isOpen={isVoucherDrawerOpen} 
        onClose={() => setIsVoucherDrawerOpen(false)} 
        onSelect={handleSelectVoucher}
        subTotal={subTotal}
        categoryIds={selectedItems.map(item => item.categoryId).filter(id => id !== undefined) as number[]}
        totalQuantity={selectedItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
    </div>
  );
};

export default Checkout;
