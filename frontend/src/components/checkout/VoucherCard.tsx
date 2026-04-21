import { Copy, Clock, Star, Info, Ticket, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import type { CouponData } from '../../api/couponService';

interface VoucherCardProps {
  coupon: CouponData;
  isComingSoon?: boolean;
  isExpiringSoon?: boolean;
  onSelect?: (code: string) => void;
  isEligible?: boolean;
  reason?: string;
}

export const VoucherCard = ({ coupon, isComingSoon, isExpiringSoon, onSelect, isEligible = true, reason }: VoucherCardProps) => {
  const handleAction = () => {
    if (onSelect) {
      onSelect(coupon.code);
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success(`Đã sao chép mã: ${coupon.code}`, {
      icon: '🎁',
      style: {
        borderRadius: '1rem',
        background: '#1e293b',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    });
  };

  const isPercentage = coupon.discountType === 'PERCENTAGE';
  const discountLabel = isPercentage ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()}đ`;

  return (
    <div className={clsx(
      "relative group overflow-hidden transition-all duration-500",
      !isEligible && "grayscale opacity-60"
    )}>
      {/* Background with ticket shape */}
      <div className={clsx(
        "flex bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-500 overflow-hidden min-h-[140px]",
        isEligible && "hover:shadow-xl hover:border-primary-100"
      )}>
        
        {/* Left Side: Discount Value */}
        <div className={clsx(
          "w-1/3 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500",
          !isEligible ? "bg-slate-200 text-slate-500" : isComingSoon ? "bg-slate-100 text-slate-400" : "bg-primary-500 text-white"
        )}>
          {/* Decorative Circles for Ticket Look */}
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full border border-slate-100" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full border border-slate-100" />
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-2xl font-black">{discountLabel}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">GIẢM GIÁ</span>
          </div>
          
          {/* Animated Background Element */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <Star className="absolute -top-2 -left-2 w-12 h-12" />
             <Star className="absolute -bottom-4 -right-4 w-20 h-20" />
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="flex-1 p-5 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{coupon.code}</span>
              {isExpiringSoon && isEligible && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-500 rounded-full text-[9px] font-black uppercase animate-pulse">
                  <Clock size={10} />
                  <span>Sắp hết hạn</span>
                </div>
              )}
              {isComingSoon && (
                 <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase">
                    <Clock size={10} />
                    <span>Sắp mở</span>
                 </div>
              )}
              {!isEligible && (
                 <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase">
                    <AlertCircle size={10} />
                    <span>Chưa đủ đ.kiện</span>
                 </div>
              )}
            </div>
            
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-1 line-clamp-2">
              {coupon.description || `Giảm ${discountLabel} cho đơn hàng từ ${coupon.minOrderAmount?.toLocaleString()}đ.`}
            </p>

            {!isEligible && reason && (
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-tight italic mb-2">
                * {reason}
              </p>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1">
               {coupon.minOrderAmount && (
                 <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                   <Info size={10} />
                   <span>Đơn tối thiểu {coupon.minOrderAmount.toLocaleString()}đ</span>
                 </div>
               )}
               {coupon.expiryDate && (
                 <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                    <Clock size={10} className="text-slate-300" />
                    <span>HSD: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}</span>
                 </div>
               )}
            </div>

            <button
              onClick={handleAction}
              disabled={isComingSoon || !isEligible}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                (isComingSoon || !isEligible)
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-slate-900 text-white hover:bg-primary-600 active:scale-90 shadow-lg shadow-slate-900/10"
              )}
            >
              {onSelect ? <Ticket size={12} /> : <Copy size={12} />}
              <span>{onSelect ? 'Dùng ngay' : 'Lưu mã'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Dashed Line separator */}
      <div className="absolute left-[33.333%] top-0 bottom-0 border-r-2 border-dashed border-slate-100 z-10" />
    </div>
  );
};
