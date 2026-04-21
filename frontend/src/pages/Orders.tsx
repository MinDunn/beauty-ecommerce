import { useState, useEffect } from "react";
import type { Order } from "../types";
import { Table } from "../components/admin/Table";
import { Modal } from "../components/admin/Modal";
import { orderService } from "../api/orderService";
import { toast } from "react-hot-toast";
import { 
  Eye, ShoppingCart, User, Phone, MapPin, CreditCard, CheckCircle2, 
  Search, Package, Truck, CheckCircle, XCircle, Clock, Trash2,
  Filter, Zap, ArrowRight
} from "lucide-react";
import { getFullTimeline } from "../utils/orderUtils";
import { cn } from "../utils/cn";

const TABS = [
  { id: 'ALL', label: 'Tất cả', icon: Filter },
  { id: 'PENDING', label: 'Chờ duyệt', icon: Clock },
  { id: 'CONFIRMED', label: 'Chuẩn bị hàng', icon: Package },
  { id: 'SHIPPING', label: 'Đang giao', icon: Truck },
  { id: 'DELIVERED', label: 'Hoàn thành', icon: CheckCircle },
  { id: 'CANCELLED', label: 'Đã hủy', icon: XCircle },
];

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel: string;
    confirmColor: 'primary' | 'rose' | 'emerald';
    icon: any;
  } | null>(null);

  const fetchOrders = async () => {
    try {
      const params = {
        search: searchQuery || undefined,
        status: activeTab === 'ALL' ? undefined : activeTab
      };
      const data = await orderService.adminGetAllOrders(params);
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery]);

  const executeStatusUpdate = async (id: number, status: string) => {
    try {
      await orderService.adminUpdateOrderStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
      setConfirmConfig(null);
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleStatusUpdate = (id: number, status: string) => {
    const labels: Record<string, string> = {
      'CONFIRMED': 'Chuẩn bị hàng',
      'SHIPPING': 'Đang giao',
      'DELIVERED': 'Hoàn thành',
      'CANCELLED': 'Hủy đơn hàng'
    };

    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận thay đổi',
      message: `Bạn có chắc chắn muốn chuyển đơn hàng #GLW${id} sang trạng thái "${labels[status]}" không?`,
      confirmLabel: status === 'CANCELLED' ? 'Xác nhận hủy' : 'Xác nhận',
      confirmColor: status === 'CANCELLED' ? 'rose' : status === 'DELIVERED' ? 'emerald' : 'primary',
      icon: status === 'CANCELLED' ? XCircle : status === 'DELIVERED' ? CheckCircle : Truck,
      onConfirm: () => executeStatusUpdate(id, status)
    });
  };

  const handleBulkUpdate = (status: string) => {
    if (selectedIds.length === 0) return;

    const labels: Record<string, string> = {
      'CONFIRMED': 'Chuẩn bị hàng',
      'SHIPPING': 'Đang giao',
      'DELIVERED': 'Hoàn thành',
      'CANCELLED': 'Hủy đơn hàng'
    };

    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận hàng loạt',
      message: `Bạn có chắc chắn muốn cập nhật trạng thái "${labels[status]}" cho ${selectedIds.length} đơn hàng đã chọn không?`,
      confirmLabel: 'Xác nhận xử lý',
      confirmColor: status === 'CANCELLED' ? 'rose' : 'primary',
      icon: Zap,
      onConfirm: async () => {
        setIsBulkProcessing(true);
        setConfirmConfig(null);
        const loadingToast = toast.loading(`Đang cập nhật ${selectedIds.length} đơn hàng...`);
        try {
          await orderService.adminBulkUpdateStatus(selectedIds, status);
          toast.success(`Đã cập nhật ${selectedIds.length} đơn hàng thành công`, { id: loadingToast });
          setSelectedIds([]);
          fetchOrders();
        } catch (error) {
          toast.error("Lỗi khi cập nhật hàng loạt", { id: loadingToast });
        } finally {
          setIsBulkProcessing(false);
        }
      }
    });
  };

  const handleConfirmPayment = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận thanh toán',
      message: `Bạn có chắc chắn đơn hàng #GLW${id} đã được thanh toán thành công? Hệ thống sẽ tự động trừ tồn kho.`,
      confirmLabel: 'Xác nhận đã nhận tiền',
      confirmColor: 'emerald',
      icon: CreditCard,
      onConfirm: async () => {
        setConfirmConfig(null);
        const loadingToast = toast.loading("Đang xác nhận...");
        try {
          await orderService.adminConfirmPayment(id);
          toast.success("Đã xác nhận thanh toán & trừ tồn kho", { id: loadingToast });
          fetchOrders();
        } catch (error) {
          toast.error("Lỗi khi xác nhận thanh toán", { id: loadingToast });
        }
      }
    });
  };

  const handleApproveCancel = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Phê duyệt hủy đơn',
      message: `Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu hủy đơn hàng #GLW${id} không? Tiền (nếu đã thanh toán) sẽ cần được hoàn trả thủ công nếu cần thiết.`,
      confirmLabel: 'Chấp nhận hủy',
      confirmColor: 'rose',
      icon: CheckCircle2,
      onConfirm: async () => {
        setConfirmConfig(null);
        const loadingToast = toast.loading("Đang xử lý...");
        try {
          await orderService.adminApproveCancellation(id);
          toast.success("Đã chấp nhận hủy đơn hàng", { id: loadingToast });
          fetchOrders();
        } catch (error) {
          toast.error("Lỗi khi phê duyệt yêu cầu", { id: loadingToast });
        }
      }
    });
  };

  const handleRejectCancel = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Từ chối hủy đơn',
      message: `Bạn có chắc chắn muốn TỪ CHỐI yêu cầu hủy đơn hàng #GLW${id} và tiếp tục xử lý đơn không?`,
      confirmLabel: 'Tiếp tục đơn hàng',
      confirmColor: 'primary',
      icon: XCircle,
      onConfirm: async () => {
        setConfirmConfig(null);
        const loadingToast = toast.loading("Đang xử lý...");
        try {
          await orderService.adminRejectCancellation(id);
          toast.success("Đã từ chối yêu cầu hủy", { id: loadingToast });
          fetchOrders();
        } catch (error) {
          toast.error("Lỗi khi từ chối yêu cầu", { id: loadingToast });
        }
      }
    });
  };

  const tableData = orders.map(order => ({
    id: order.id,
    customer: (
      <div>
        <p className="font-bold text-white">{order.receiverName}</p>
        <p className="text-[10px] text-slate-500 uppercase font-black">ID: #{order.id}</p>
      </div>
    ),
    amount: (
      <span className="font-black text-white">
        {order.totalPrice.toLocaleString()}đ
      </span>
    ),
    payment: (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
           <div className={`p-1 rounded-md ${order.paymentMethod === 'MOMO' ? 'bg-pink-500/10 text-pink-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <CreditCard size={10} />
           </div>
           <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter italic">{order.paymentMethod === 'MOMO' ? 'Ví MOMO' : 'COD'}</span>
        </div>
        <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${order.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
           {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </div>
      </div>
    ),
    status: (
      <div className="flex flex-col gap-2 min-w-[140px]">
        <div className={cn(
          "text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg w-fit flex items-center gap-1.5 border shadow-sm",
          order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
          order.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
          order.status === 'SHIPPING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
          order.status === 'CANCELLATION_REQUESTED' ? 'bg-pink-500/10 text-pink-500 border-pink-500/20' :
          order.status === 'CONFIRMED' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
          'bg-amber-500/10 text-amber-500 border-amber-500/20'
        )}>
           {order.status === 'PENDING' && <Clock size={10} className="animate-pulse" />}
           {order.status === 'CONFIRMED' && <Package size={10} />}
           {order.status === 'SHIPPING' && <Truck size={10} />}
           {order.status === 'DELIVERED' && <CheckCircle size={10} />}
           {order.status === 'CANCELLED' && <XCircle size={10} />}
           {order.status === 'PENDING' ? 'Chờ duyệt' : 
            order.status === 'CONFIRMED' ? 'Chuẩn bị hàng' :
            order.status === 'SHIPPING' ? 'Đang giao' :
            order.status === 'DELIVERED' ? 'Hoàn thành' : 
            order.status === 'CANCELLATION_REQUESTED' ? 'Yêu cầu hủy' : 'Đã hủy'}
        </div>

        {/* Next Step Suggestion */}
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'CANCELLATION_REQUESTED' && (
          <button
            onClick={() => {
              const nextStatus = 
                order.status === 'PENDING' ? 'CONFIRMED' :
                order.status === 'CONFIRMED' ? 'SHIPPING' : 'DELIVERED';
              handleStatusUpdate(order.id, nextStatus);
            }}
            className="group flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-colors w-fit"
          >
            <Zap size={10} className="group-hover:fill-primary-500" />
            {order.status === 'PENDING' ? 'Duyệt đơn' :
             order.status === 'CONFIRMED' ? 'Giao hàng' : 'Hoàn thành'}
             <ArrowRight size={8} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* Cancellation Actions */}
        {order.status === 'CANCELLATION_REQUESTED' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleApproveCancel(order.id)}
              className="text-[8px] font-black uppercase text-rose-500 hover:text-rose-400 flex items-center gap-1"
            >
              <CheckCircle size={10} /> Đồng ý hủy
            </button>
            <button
              onClick={() => handleRejectCancel(order.id)}
              className="text-[8px] font-black uppercase text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <XCircle size={10} /> Từ chối
            </button>
          </div>
        )}
      </div>
    ),
    date: (
      <div className="text-slate-500 text-xs font-medium italic text-right">
        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
      </div>
    ),
    actions: (
      <div className="flex items-center gap-2 justify-end">
        {order.paymentMethod === 'MOMO' && order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED' && (
           <button 
             onClick={() => handleConfirmPayment(order.id)}
             className="px-2.5 py-1.5 bg-emerald-500 text-white hover:bg-black hover:text-emerald-500 rounded-lg text-[8px] font-black uppercase transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-1 border border-transparent hover:border-emerald-500"
             title="Xác nhận đã nhận tiền"
           >
             <CheckCircle2 size={10} />
             Xác nhận tiền
           </button>
        )}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(order);
            setShowDetails(true);
          }}
          className="p-2 hover:bg-slate-800 rounded-xl text-primary-500 transition-colors"
        >
          <Eye size={18} />
        </button>
      </div>
    )
  }));

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">Quản lý <span className="text-primary-500">Đơn hàng</span></h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Công cụ tối ưu quản trị đơn hàng hàng loạt.</p>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-500 transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="Tìm mã đơn, tên khách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 w-full md:w-80 text-sm text-white font-bold outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 shadow-2xl transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
              activeTab === tab.id 
                ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <Table 
        selectable
        selectedIds={selectedIds}
        onSelectionChange={(id) => {
          setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }}
        onSelectAll={(ids) => setSelectedIds(ids)}
        columns={[
          { header: "Khách hàng", key: "customer" },
          { header: "Tổng tiền", key: "amount" },
          { header: "Thanh toán", key: "payment" },
          { header: "Trạng thái", key: "status" },
          { header: "Ngày", key: "date" },
          { header: "Chi tiết", key: "actions" }
        ]} 
        data={tableData} 
      />

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-primary-500/30 px-8 py-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-8 border-t-2">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Đã chọn</span>
               <span className="text-white font-black text-xl italic">{selectedIds.length} <span className="text-xs text-slate-500 font-bold not-italic">Đơn hàng</span></span>
            </div>
            
            <div className="h-10 w-[1px] bg-slate-800" />
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleBulkUpdate('CONFIRMED')}
                disabled={isBulkProcessing}
                className="px-5 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-emerald-500 transition-all shadow-lg shadow-emerald-500/10 border border-transparent hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Duyệt đơn
              </button>
              <button 
                onClick={() => handleBulkUpdate('SHIPPING')}
                disabled={isBulkProcessing}
                className="px-5 py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-blue-500 transition-all shadow-lg shadow-blue-500/10 border border-transparent hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Giao hàng
              </button>
              <button 
                onClick={() => handleBulkUpdate('DELIVERED')}
                disabled={isBulkProcessing}
                className="px-5 py-3 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-primary-500 transition-all shadow-lg shadow-primary-500/10 border border-transparent hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hoàn thành
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="p-3 text-slate-500 hover:text-rose-500 transition-colors"
                title="Hủy chọn"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedOrder && (
        <Modal onClose={() => setShowDetails(false)} title={`Đơn hàng #${selectedOrder.id}`}>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Customer Info */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <User size={12} /> Thông tin người nhận
                </p>
                <p className="text-white font-bold mb-1">{selectedOrder.receiverName}</p>
                <p className="text-slate-400 text-sm flex items-center gap-2 mb-1">
                  <Phone size={12} /> {selectedOrder.receiverPhone}
                </p>
                <p className="text-slate-400 text-sm flex items-start gap-2">
                  <MapPin size={12} className="mt-1 flex-shrink-0" /> {selectedOrder.shippingAddress}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart size={12} /> Danh sách sản phẩm
              </p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      {item.productImageUrl && <img src={item.productImageUrl} className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <p className="text-sm font-bold text-white line-clamp-1">{item.productName}</p>
                        <p className="text-[10px] text-slate-500">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-white">{(item.price * item.quantity).toLocaleString()}đ</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center bg-primary-500/10 p-4 rounded-2xl border border-primary-500/20">
                <p className="text-sm font-black text-primary-500 uppercase tracking-widest">Tổng cộng</p>
                <p className="text-xl font-black text-white">{selectedOrder.totalPrice.toLocaleString()}đ</p>
              </div>
            </div>

            {/* Journey Details */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700">
               <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-6">Hành trình chi tiết (Người dùng thấy)</p>
               <div className="space-y-4">
                  {getFullTimeline(selectedOrder).filter(s => s.isCompleted || s.isActive).reverse().slice(0, 3).map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2">
                         <div className={cn("w-1.5 h-1.5 rounded-full", step.isActive ? "bg-primary-500 animate-pulse" : "bg-slate-600")} />
                         <span className={cn("font-bold", step.isActive ? "text-white" : "text-slate-500")}>{step.label}</span>
                      </div>
                      <span className="text-slate-600 font-medium italic">{step.time}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Quick Actions */}
            {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
              <div className="bg-primary-500/5 rounded-3xl p-6 border border-primary-500/20">
                 <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-4">Thao tác nhanh cho Admin</p>
                 <div className="flex flex-wrap gap-3">
                    {selectedOrder.status === 'PENDING' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'CONFIRMED')}
                        className="px-6 py-3 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-primary-500/10"
                      >
                        <Package size={14} /> Duyệt đơn
                      </button>
                    )}
                    {selectedOrder.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'SHIPPING')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
                      >
                        <Truck size={14} /> Giao hàng
                      </button>
                    )}
                    {selectedOrder.status === 'SHIPPING' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'DELIVERED')}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10"
                      >
                        <CheckCircle size={14} /> Hoàn thành
                      </button>
                    )}
                    {selectedOrder.status === 'CANCELLATION_REQUESTED' && (
                      <>
                        <button 
                          onClick={() => handleApproveCancel(selectedOrder.id)}
                          className="px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-rose-500/10"
                        >
                          <CheckCircle size={14} /> Chấp nhận hủy đơn
                        </button>
                        <button 
                          onClick={() => handleRejectCancel(selectedOrder.id)}
                          className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 border border-slate-700"
                        >
                          <XCircle size={14} /> Từ chối hủy
                        </button>
                      </>
                    )}
                    {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLATION_REQUESTED' && (
                      <button 
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'CANCELLED')}
                        className="px-6 py-3 bg-slate-800 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 border border-rose-500/20 hover:border-rose-500"
                      >
                        <XCircle size={14} /> Hủy đơn hàng
                      </button>
                    )}
                 </div>
                 <p className="text-[9px] text-slate-500 mt-4 italic">* Thao tác này sẽ cập nhật hành trình thực tế cho khách hàng ngay lập tức.</p>
              </div>
            )}

            <button 
              onClick={() => setShowDetails(false)}
              className="w-full py-4 rounded-2xl bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
            >
              Đóng lại
            </button>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {confirmConfig && (
        <Modal onClose={() => setConfirmConfig(null)} title={confirmConfig.title}>
          <div className="text-center space-y-6">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              confirmConfig.confirmColor === 'rose' ? 'bg-rose-500/10 text-rose-500' :
              confirmConfig.confirmColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
              'bg-primary-500/10 text-primary-500'
            )}>
              <confirmConfig.icon size={32} />
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              {confirmConfig.message}
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setConfirmConfig(null)}
                className="flex-1 py-3 px-6 rounded-xl bg-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className={cn(
                  "flex-1 py-3 px-6 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg",
                  confirmConfig.confirmColor === 'rose' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                  confirmConfig.confirmColor === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                  'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20'
                )}
              >
                {confirmConfig.confirmLabel}
              </button>
            </div>
            
            <p className="text-[9px] text-slate-500 italic mt-4">
              * Hành động này sẽ cập nhật hành trình thực tế cho khách hàng ngay lập tức.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};