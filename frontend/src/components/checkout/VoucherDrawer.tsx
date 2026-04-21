import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Ticket, Zap, Calendar, Star, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { couponService, type CouponData } from "../../api/couponService";
import { VoucherCard } from "./VoucherCard";

interface VoucherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (code: string) => void;
  subTotal?: number;
  categoryIds?: number[];
  totalQuantity?: number;
}

type TabType = "all" | "percentage" | "fixed" | "comingSoon" | "expiringSoon";

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: "all", label: "Tất cả", icon: Gift },
  { id: "percentage", label: "Giảm theo %", icon: Star },
  { id: "fixed", label: "Giảm tiền mặt", icon: Ticket },
  { id: "comingSoon", label: "Sắp mở", icon: Calendar },
  { id: "expiringSoon", label: "Sắp hết hạn", icon: Zap },
];

export const VoucherDrawer = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  subTotal = 0, 
  categoryIds = [], 
  totalQuantity = 0 
}: VoucherDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [rawVouchers, setRawVouchers] = useState<Record<string, CouponData[]>>({});
  const [loading, setLoading] = useState(true);

  const displayVouchers = useMemo(() => {
    const vouchersMap: Record<string, any[]> = {};
    
    Object.entries(rawVouchers).forEach(([tab, list]) => {
      vouchersMap[tab] = list.map(v => {
        let isEligible = true;
        let reason = '';
        let potentialDiscount = 0;

        // Eligibility is only calculated when in "Selection" mode (Checkout)
        const checkEligibility = !!onSelect;

        // Eligibility Checks
        if (checkEligibility) {
          if (v.minOrderAmount && subTotal < v.minOrderAmount) {
            isEligible = false;
            reason = `Mua thêm ${(v.minOrderAmount - subTotal).toLocaleString()}đ`;
          }
          
          if (v.minQuantity && totalQuantity < v.minQuantity) {
            isEligible = false;
            reason = `Cần ít nhất ${v.minQuantity} sản phẩm`;
          }

          if (v.categoryId && !categoryIds.includes(v.categoryId)) {
            isEligible = false;
            reason = `Chỉ áp dụng cho danh mục nhất định`;
          }
        }

        // Calculate potential discount for sorting
        if (v.discountType === 'PERCENTAGE') {
          potentialDiscount = (subTotal * v.discountValue) / 100;
          if (v.maxDiscountAmount && potentialDiscount > v.maxDiscountAmount) {
            potentialDiscount = v.maxDiscountAmount;
          }
        } else {
          potentialDiscount = v.discountValue;
        }

        return { ...v, isEligible, reason, potentialDiscount };
      }).sort((a, b) => {
        // Sort: Eligible first, then by potential discount amount descending
        if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
        return b.potentialDiscount - a.potentialDiscount;
      });
    });

    return vouchersMap;
  }, [rawVouchers, subTotal, categoryIds, totalQuantity]);

  const handleSelect = (code: string) => {
    if (onSelect) {
      onSelect(code);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      const fetchVouchers = async () => {
        setLoading(true);
        try {
          const data = await couponService.getPublicVouchers();
          setRawVouchers(data);
        } catch (error) {
          console.error("Failed to fetch vouchers", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVouchers();
    }
  }, [isOpen]);

  const currentVouchers = displayVouchers[activeTab] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[1000] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary-500 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                   <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Kho Ưu Đãi Glowzy</h2>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Tiết kiệm ngay cùng chúng tôi</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-slate-100 bg-white overflow-x-auto no-scrollbar scroll-smooth">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex-shrink-0 px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative",
                      isActive ? "text-primary-500" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeVoucherTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang cập nhật ưu đãi...</p>
                </div>
              ) : currentVouchers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                   <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6">
                      <Ticket size={40} />
                   </div>
                   <h3 className="text-lg font-black text-slate-800 uppercase italic">Chưa có mã hữu hiệu</h3>
                   <p className="text-xs text-slate-500 font-medium mt-2">Đang có hàng loạt deal HOT đang chờ mở. Hãy quay lại sau nhé!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentVouchers.map((coupon) => (
                    <VoucherCard 
                      key={coupon.id} 
                      coupon={coupon} 
                      isComingSoon={activeTab === 'comingSoon'}
                      isExpiringSoon={activeTab === 'expiringSoon'}
                      onSelect={onSelect ? handleSelect : undefined}
                      isEligible={coupon.isEligible}
                      reason={coupon.reason}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-slate-100">
               <div className="p-4 bg-slate-900 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                     <Star className="text-white w-6 h-6" />
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mb-0.5">Mẹo tiết kiệm</p>
                     <p className="text-xs text-slate-100 font-medium leading-tight">Áp dụng mã tại bước thanh toán để nhận ưu đãi ngay!</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
