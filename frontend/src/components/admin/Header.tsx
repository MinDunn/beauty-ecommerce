import { useState, useEffect, useRef } from "react";
import { LogOut, Bell, Search, X, Loader2, ChevronDown, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../api/adminService";
import { orderService } from "../../api/orderService";
import { feedbackService } from "../../api/feedbackService";
import { productService } from "../../api/productService";
import { reviewService } from "../../api/reviewService";

type AdminNotification = {
  id: string;
  title: string;
  type: "ĐƠN MỚI" | "FEEDBACK" | "TỒN KHO" | "NHẬP KHO" | "ĐÁNH GIÁ" | "HẾT HẠN";
  time: string;
  read: boolean;
  route: string;
};

export const Header = ({ logout, onToggleMenu }: { logout: () => void, onToggleMenu?: () => void }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [orders, feedbacks, productsPage, receipts, reviewRes] = await Promise.all([
        orderService.adminGetAllOrders(),
        feedbackService.getAllFeedbacks(),
        productService.searchProducts({ size: 200 }),
        adminService.getInventoryReceipts(),
        reviewService.getAllReviews()
      ]);

      const reviews = reviewRes.data.data;

      const now = new Date();
      const within48Hours = (dateString?: string) => {
        if (!dateString) return false;
        const diff = now.getTime() - new Date(dateString).getTime();
        // Allow for 10 minutes of clock skew (future dates)
        return diff >= -600000 && diff <= 48 * 60 * 60 * 1000;
      };

      const newOrders = (orders || []).filter((order: any) => within48Hours(order.orderDate));
      const newFeedbacks = (feedbacks || []).filter((feedback: any) => within48Hours(feedback.createdAt));
      const newReviews = (reviews || []).filter((review: any) => within48Hours(review.createdAt));
      const lowStockProducts = (productsPage?.content || []).filter((product: any) => Number(product.stockQuantity) > 0 && Number(product.stockQuantity) < 10);
      const expiringProducts = (productsPage?.content || []).filter((product: any) => {
        if (!product.expiryDate) return false;
        const expiry = new Date(product.expiryDate).getTime();
        const diff = expiry - now.getTime();
        return diff > 0 && diff < 180 * 24 * 60 * 60 * 1000; // Under 6 months
      });
      const recentReceipts = (receipts || []).filter((receipt: any) => within48Hours(receipt.receivedAt));

      const generated: AdminNotification[] = [];

      if (newOrders.length > 0) {
        const latestOrder = [...newOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0];
        generated.push({
          id: `order-${latestOrder.id}`,
          title: `Có ${newOrders.length} đơn hàng mới cần xử lý`,
          type: "ĐƠN MỚI",
          time: formatRelativeTime(latestOrder.orderDate),
          read: false,
          route: "/admin/orders"
        });
      }

      if (newFeedbacks.length > 0) {
        const latestFeedback = [...newFeedbacks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        generated.push({
          id: `feedback-${latestFeedback.id}`,
          title: `Có ${newFeedbacks.length} phản hồi mới từ khách hàng`,
          type: "FEEDBACK",
          time: formatRelativeTime(latestFeedback.createdAt),
          read: false,
          route: "/admin/feedback"
        });
      }

      if (newReviews.length > 0) {
        const latestReview = [...newReviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        generated.push({
          id: `review-${latestReview.id}`,
          title: `Có ${newReviews.length} nhận xét mới về sản phẩm`,
          type: "ĐÁNH GIÁ",
          time: formatRelativeTime(latestReview.createdAt),
          read: false,
          route: "/admin/feedback?tab=reviews"
        });
      }

      if (lowStockProducts.length > 0) {
        generated.push({
          id: "low-stock-alert",
          title: `${lowStockProducts.length} sản phẩm sắp hết hàng (dưới 10 đơn vị)`,
          type: "TỒN KHO",
          time: "Cập nhật gần nhất",
          read: false,
          route: "/admin/products"
        });
      }

      if (expiringProducts.length > 0) {
        generated.push({
          id: "expiring-alert",
          title: `Có ${expiringProducts.length} sản phẩm sắp hết hạn trong 6 tháng tới`,
          type: "HẾT HẠN",
          time: "Cần kiểm tra",
          read: false,
          route: "/admin/products"
        });
      }

      if (recentReceipts.length > 0) {
        const latestReceipt = [...recentReceipts].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())[0];
        generated.push({
          id: `receipt-${latestReceipt.id}`,
          title: `Có ${recentReceipts.length} phiếu nhập kho mới trong 48 giờ qua`,
          type: "NHẬP KHO",
          time: formatRelativeTime(latestReceipt.receivedAt),
          read: false,
          route: "/admin/inventory-receipts"
        });
      }

      const formatted = generated.slice(0, 10);
      setNotifications(formatted);
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleOpenNotification = (notification: AdminNotification) => {
    setShowNotifications(false);
    navigate(notification.route);
  };

  return (
    <header className="h-20 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMenu}
          className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg md:hidden transition-colors"
          title="Mở menu"
        >
          <Menu size={24} />
        </button>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm đơn hàng, khách hàng..." 
            className="bg-slate-800/50 border border-slate-700 text-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-[#0f172a]"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
              >
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Thông báo</h3>
                  <button onClick={() => setShowNotifications(false)}><X size={14} className="text-slate-500" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center gap-2">
                       <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đang cập nhật...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-xs text-slate-500 italic">Không có thông báo mới</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleOpenNotification(n)}
                        className="w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-xs font-bold line-clamp-2 pr-3 ${n.read ? "text-slate-400" : "text-white"}`}>{n.title}</p>
                          {!n.read && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1 shrink-0"></div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 uppercase tracking-tighter group-hover:bg-primary-500/20 group-hover:text-primary-500 transition-colors">{n.type}</span>
                          <p className="text-[10px] text-slate-500 font-medium">{n.time}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-3 text-center bg-slate-800/30">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/admin/activities");
                    }}
                    className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-400"
                  >
                    Xem tất cả
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-px bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-4" ref={userMenuRef}>
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-white uppercase tracking-tight">Glowzy Admin</span>
            <span className="text-[10px] text-primary-500 font-black uppercase tracking-widest">Quản trị viên</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl transition-all duration-200 border border-slate-700"
              title="Tài khoản quản trị"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 font-bold shadow-inner">
                GA
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50"
                >
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};