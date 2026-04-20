import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Lock, Phone, MapPin, Package, Settings, ChevronRight, Camera, LogOut, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '../store';
import { logout as logoutAction, updateUser } from '../store/slices/authSlice';
import { cn } from '../utils/cn';
import authService from '../api/authService';
import type { UserProfile } from '../api/authService';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import wishlistService from '../api/wishlistService';
import orderService from '../api/orderService';
import type { Order } from '../types';
import { ProductCard } from '../components/ui/ProductCard';
import { addItem, selectOnlyItems } from '../store/slices/cartSlice';
import { getFullTimeline } from '../utils/orderUtils';

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('info');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Handle tab from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['info', 'orders', 'wishlist', 'security', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const resp = await authService.getProfile();
      setProfile(resp.data.data);
      setFormData({
        fullName: resp.data.data.fullName || '',
        phone: resp.data.data.phone || '',
        address: resp.data.data.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile', error);
      toast.error('Không thể tải thông tin cá nhân');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const resp = await authService.updateProfile(formData);
      setProfile(resp.data.data);
      dispatch(updateUser({ fullName: resp.data.data.fullName }));
      toast.success('Cập nhật thông tin thành công!');
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? (error as any).response?.data?.message || error.message : 'Cập nhật thất bại';
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., < 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh quá lớn (tối đa 2MB)');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Đang tải ảnh lên...');
    try {
      const resp = await authService.uploadAvatar(file);
      const newAvatarUrl = resp.data.data;
      setProfile(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
      if (dispatch) {
          (dispatch as any)(updateUser({ avatarUrl: newAvatarUrl }));
      }
      toast.success('Cập nhật ảnh đại diện thành công!', { id: loadingToast });
    } catch {
      toast.error('Tải ảnh thất bại', { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    const loadingToast = toast.loading('Đang xử lý...');
    try {
      await authService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Đổi mật khẩu thành công!', { id: loadingToast });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? (error as any).response?.data?.message || error.message : 'Đổi mật khẩu thất bại';
      toast.error(errMsg, { id: loadingToast });
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Still logout on client side even if server fails
      console.error('Server logout failed', error);
    }
    dispatch(logoutAction());
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  const WishlistTab = () => {
    const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const loadWishlist = async () => {
        try {
          const resp = await wishlistService.getWishlist();
          setWishlistProducts(resp.data.data);
        } catch (error) {
          console.error('Error loading wishlist', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadWishlist();
    }, []);

    const handleRemove = async (productId: string) => {
      try {
        await wishlistService.removeFromWishlist(Number(productId));
        setWishlistProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } catch {
        toast.error('Không thể xóa sản phẩm');
      }
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-2">Sản phẩm yêu thích</h2>
            <p className="text-gray-500 font-medium">Danh sách các sản phẩm bạn đã lưu để mua sau.</p>
          </div>
          <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black">
            {wishlistProducts.length} sản phẩm
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Đang tải danh sách...</p>
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard 
                  id={String(product.id)}
                  name={product.name}
                  price={product.currentPrice}
                  originalPrice={product.originalPrice}
                  image={product.imageUrl || ''}
                  views={product.viewCount || 0}
                />
                <button 
                  onClick={(e) => { e.preventDefault(); handleRemove(String(product.id)); }}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-30 border border-red-100"
                  title="Xóa khỏi yêu thích"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-300">
            <Sparkles size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-black text-gray-900 uppercase">Chưa có sản phẩm nào</h3>
            <p className="text-gray-400 text-sm mt-1 italic">Hãy thả tim sản phẩm bạn yêu thích để lưu tại đây nhé!</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-8 py-3 bg-primary-500 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary-600 transition-all"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const OrdersTab = () => {
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Cancellation Modal state
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [customReason, setCustomReason] = useState<string>("");
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    const cancelReasons = [
      "Sai địa chỉ nhận hàng",
      "Muốn thay đổi sản phẩm trong đơn hàng",
      "Tìm thấy sản phẩm khác rẻ hơn",
      "Đổi ý, không muốn mua nữa",
      "Khác"
    ];

    useEffect(() => {
      const loadOrders = async () => {
        try {
          const data = await orderService.getOrderHistory();
          setOrderHistory(data);
        } catch (error) {
          console.error('Error loading orders', error);
          toast.error('Không thể tải lịch sử đơn hàng');
        } finally {
          setIsLoading(false);
        }
      };
      loadOrders();
    }, []);

    const handleCancelOrder = (orderId: number) => {
      setOrderToCancel(orderId);
      setIsCancelModalOpen(true);
      setSelectedReason("");
      setCustomReason("");
    };

    const handleBuyAgain = async (order: Order) => {
      const itemsToSelect: { id: string; variantName: string | null }[] = [];
      
      for (const item of order.items) {
        dispatch(addItem({
          id: String(item.productId),
          name: item.productName,
          price: item.price,
          image: item.productImageUrl || '',
          quantity: item.quantity,
          variantName: (item as any).variantName || null
        }));
        
        itemsToSelect.push({
          id: String(item.productId),
          variantName: (item as any).variantName || null
        });
      }
      
      dispatch(selectOnlyItems(itemsToSelect));
      toast.success('Đã chuẩn bị đơn hàng để thanh toán lại!');
      navigate('/checkout');
    };

    const confirmCancel = async () => {
      if (!orderToCancel) return;
      if (!selectedReason) {
        toast.error("Vui lòng chọn lý do hủy đơn");
        return;
      }
      
      const reason = selectedReason === "Khác" ? customReason : selectedReason;
      if (selectedReason === "Khác" && !customReason.trim()) {
        toast.error("Vui lòng nhập lý do cụ thể");
        return;
      }

      const loadingToast = toast.loading('Đang xử lý hủy đơn...');
      try {
        await orderService.cancelOrder(orderToCancel, reason);
        toast.success('Hủy đơn hàng thành công!', { id: loadingToast });
        setIsCancelModalOpen(false);
        const data = await orderService.getOrderHistory();
        if (Array.isArray(data)) {
          setOrderHistory(data);
        } else {
          console.error("Order history data is not an array:", data);
          setOrderHistory([]);
        }
      } catch (error: any) {
        toast.error(error.response?.data || 'Không thể hủy đơn hàng lúc này', { id: loadingToast });
      }
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase mb-2">Đơn hàng của tôi</h2>
            <p className="text-gray-500 font-medium">Theo dõi lịch sử và tình trạng đơn hàng.</p>
          </div>
          <span className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-xs font-black">
            {Array.isArray(orderHistory) ? orderHistory.length : 0} Đơn hàng
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Đang tải lịch sử...</p>
          </div>
        ) : (Array.isArray(orderHistory) && orderHistory.length > 0) ? (
          <div className="space-y-4">
            {orderHistory.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-3xl p-6 hover:border-primary-200 transition-colors bg-gray-50/20">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-slate-400">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mã đơn hàng</p>
                      <p className="font-black text-sm text-slate-900 tracking-tight">#GLW{order.id}</p>
                    </div>
                  </div>

                  <div className="flex-1 max-w-sm px-4"></div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                    <p className="text-[9px] text-gray-400 font-bold">{new Date(order.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                
                {/* Order Summary / Items Preview */}
                <div className="space-y-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-white p-2 overflow-hidden border border-gray-100 flex-shrink-0">
                        <img 
                          src={item.productImageUrl || 'https://placehold.co/100x100?text=Product'} 
                          className="w-full h-full object-contain mix-blend-multiply" 
                          alt={item.productName}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-xs translate-y-[-1px] line-clamp-1">{item.productName}</h4>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">Số lượng: {String(item.quantity).padStart(2, '0')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-gray-600 tracking-tighter">{(item.price * item.quantity).toLocaleString()}đ</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100/50 flex flex-wrap justify-between items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", order.status === 'DELIVERED' ? "bg-green-500" : "bg-primary-500")} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Thanh toán: {order.paymentMethod === 'MOMO' ? 'Ví MoMo' : 'COD'}
                      </span>
                   </div>
                   
                   <div className="flex flex-wrap items-center justify-end gap-3 flex-1">
                      <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                      >
                        {expandedOrderId === order.id ? 'Đóng chi tiết' : 'Chi tiết hành trình'}
                      </button>

                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2.5 bg-white text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                        >
                          Hủy đơn
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleBuyAgain(order)}
                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 transition-all shadow-xl shadow-slate-900/10"
                      >
                        Mua lại
                      </button>

                      <div className="pl-4 border-l border-gray-100">
                        <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest mb-0.5">Tổng thanh toán</p>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">{(order.totalPrice || 0).toLocaleString()}đ</p>
                      </div>
                   </div>
                </div>

                {/* Timeline Expansion */}
                <AnimatePresence>
                  {expandedOrderId === order.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-8 pb-4">
                        <div className="bg-white rounded-[2rem] p-8 border border-primary-100 shadow-inner ring-4 ring-primary-50/50">
                          <h5 className="text-[10px] font-black uppercase text-primary-600 tracking-[0.2em] mb-8 flex items-center gap-2">
                             <Sparkles size={14} /> Chi tiết hành trình đơn hàng
                          </h5>
                          <div className="space-y-8 relative">
                            <div className="absolute left-[13px] top-2 bottom-2 w-[2px] bg-slate-100" />
                            {getFullTimeline(order).reverse().map((step, idx) => {
                              const StepIcon = step.icon;
                              const isCurrent = step.isActive;
                              const isPast = step.isCompleted;
                              
                              return (
                                <div key={idx} className={cn(
                                  "flex gap-6 relative transition-all duration-500",
                                  !isPast && !isCurrent ? "opacity-40 grayscale-[0.5]" : "opacity-100"
                                )}>
                                  <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-500",
                                    isPast ? "bg-primary-500 border-primary-500 text-white" : 
                                    isCurrent ? "bg-white border-primary-500 text-primary-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : 
                                    "bg-white border-slate-200 text-slate-300"
                                  )}>
                                    {isCurrent && (
                                      <motion.div 
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-primary-500/20 rounded-full"
                                      />
                                    )}
                                    <StepIcon size={12} className={isCurrent ? "animate-pulse" : ""} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                      <p className={cn(
                                        "text-xs font-black uppercase tracking-tight",
                                        isCurrent ? "text-primary-600" : isPast ? "text-slate-900" : "text-slate-400"
                                      )}>
                                        {step.label}
                                        {isCurrent && <span className="ml-2 text-[8px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">Hiện tại</span>}
                                      </p>
                                      {(isPast || isCurrent) && (
                                        <div className="text-right">
                                          <p className="text-[10px] font-bold text-slate-900">{step.time}</p>
                                          <p className="text-[8px] text-gray-400 font-bold">{step.date}</p>
                                        </div>
                                      )}
                                    </div>
                                    {isCurrent && (
                                       <p className="text-[10px] text-primary-500 font-medium italic">Sản phẩm đang nằm trong bước này</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-300">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-black text-gray-900 uppercase">Chưa có đơn hàng nào</h3>
            <p className="text-gray-400 text-sm mt-1 italic">Hãy thực hiện đơn hàng đầu tiên để theo dõi tại đây!</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-8 py-3 bg-primary-500 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary-600 transition-all"
            >
              Mua sắm ngay
            </button>
          </div>
        )}

        {/* Cancellation Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCancelModalOpen(false)}></div>
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase">Xác nhận hủy đơn</h3>
                    <p className="text-sm text-gray-500 font-medium italic">Vui lòng cho Glowzy biết lý do bạn muốn hủy đơn hàng này nhé!</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {cancelReasons.map((reason) => (
                    <label key={reason} className="flex items-center p-4 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/10 cursor-pointer transition-all group">
                      <input 
                        type="radio" 
                        name="cancelReason" 
                        value={reason} 
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-5 h-5 border-2 border-gray-300 text-primary-500 focus:ring-primary-500 checked:border-primary-500 transition-all"
                      />
                      <span className={`ml-4 text-sm font-bold transition-colors ${selectedReason === reason ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                        {reason}
                      </span>
                    </label>
                  ))}

                  {selectedReason === "Khác" && (
                    <textarea 
                      className="w-full mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all placeholder:text-gray-400"
                      placeholder="Nhập lý do cụ thể của bạn..."
                      rows={3}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    ></textarea>
                  )}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsCancelModalOpen(false)}
                    className="flex-1 py-4 bg-gray-50 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                  >
                    Quay lại
                  </button>
                  <button 
                    onClick={confirmCancel}
                    className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all uppercase tracking-widest text-xs"
                  >
                    Xác nhận hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      {/* <SEO title="Hồ sơ cá nhân" description="Quản lý thông tin tài khoản, đơn hàng và danh sách yêu thích của bạn tại Glowzy." /> */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-1/4 space-y-4">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-black border-4 border-white shadow-md overflow-hidden bg-cover bg-center" style={{ backgroundImage: profile?.avatarUrl ? `url(${profile.avatarUrl})` : 'none' }}>
                    {profile?.avatarUrl ? '' : (profile?.fullName?.[0] || user?.fullName?.[0] || 'U')}
                </div>
                <button 
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-primary-500 transition-colors disabled:opacity-50"
                >
                   <Camera size={16} className={isUploading ? 'animate-pulse' : ''} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              <h3 className="text-xl font-black text-gray-900 line-clamp-1">{profile?.fullName || user?.fullName}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-4">{profile?.email || user?.email}</p>
              
              <button 
                onClick={handleLogout}
                className="glowzy-btn-secondary w-full py-3 bg-red-50 text-red-600 border-red-100/50 hover:bg-red-600 hover:text-white"
              >
                 <LogOut size={14} className="inline-block mr-2 translate-y-[-1px]" />
                 <span>Đăng xuất</span>
              </button>
            </div>

            <nav className="glowzy-card overflow-hidden p-2">
              {[
                { id: 'info', label: 'Thông tin cá nhân', icon: User },
                { id: 'orders', label: 'Đơn hàng của tôi', icon: Package },
                { id: 'wishlist', label: 'Sản phẩm yêu thích', icon: Heart },
                { id: 'security', label: 'Bảo mật', icon: Lock },
                { id: 'settings', label: 'Thiết lập', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm",
                    activeTab === item.id 
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30 -translate-y-0.5" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === item.id ? "opacity-100" : "opacity-0"} />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="glowzy-card p-8 md:p-12 min-h-[600px]">
              
              {activeTab === 'info' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase mb-2">Hồ sơ cá nhân</h2>
                    <p className="text-gray-500 font-medium">Cập nhật thông tin của bạn để có trải nghiệm mua sắm tốt nhất.</p>
                  </div>

                  <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="glowzy-input pl-12" 
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                       <div className="relative">
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Chưa cập nhật" 
                          className="glowzy-input pl-12" 
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                       </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Không thể thay đổi)</label>
                       <div className="relative">
                        <input type="email" readOnly value={profile?.email || user?.email || ''} className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-transparent rounded-2xl text-gray-500 cursor-not-allowed font-bold" />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                       </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ giao hàng mặc định</label>
                       <div className="relative">
                        <textarea 
                          rows={2} 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder="Vui lòng điền địa chỉ để nhận hàng" 
                          className="glowzy-input pl-12 resize-none" 
                        />
                        <MapPin className="absolute left-4 top-6 text-gray-400" size={20} />
                       </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="glowzy-btn-primary px-12"
                      >
                        {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ ngay'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <OrdersTab />
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase mb-2">Bảo mật tài khoản</h2>
                    <p className="text-gray-500 font-medium">Bảo vệ quyền truy cập và dữ liệu của bạn.</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                      <input 
                        type="password" 
                        required
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        placeholder="••••••••" 
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="••••••••" 
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                       <input 
                        type="password" 
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="••••••••" 
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-bold" 
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all hover:scale-[1.02] uppercase tracking-widest shadow-xl">
                       Đổi mật khẩu ngay
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <WishlistTab />
              )}

              {activeTab === 'settings' && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-dashed border-gray-300">
                      <Settings size={40} />
                   </div>
                   <h3 className="text-xl font-black text-gray-800 mb-2">Đang xây dựng</h3>
                   <p className="text-gray-500 text-sm italic">Tính năng thiết lập tào khoản sẽ sớm ra mắt khách yêu nhé!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
