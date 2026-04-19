import { useState, useEffect } from "react";
import type { Order } from "../types";
import { Table } from "../components/admin/Table";
import { Modal } from "../components/admin/Modal";
import { orderService } from "../api/orderService";
import { toast } from "react-hot-toast";
import { 
  Eye, ShoppingCart, User, Phone, MapPin, CreditCard, CheckCircle2, 
  Search, Package, Truck, CheckCircle, XCircle, Clock, Trash2,
  Filter
} from "lucide-react";

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
  
  // New States
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await orderService.adminUpdateOrderStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedIds.length === 0) return;
    
    setIsBulkProcessing(true);
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
  };

  const handleConfirmPayment = async (id: number) => {
    const loadingToast = toast.loading("Đang xác nhận...");
    try {
      await orderService.adminConfirmPayment(id);
      toast.success("Đã xác nhận thanh toán & trừ tồn kho", { id: loadingToast });
      fetchOrders();
    } catch (error) {
      toast.error("Lỗi khi xác nhận thanh toán", { id: loadingToast });
    }
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
      <select 
        value={order.status}
        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-800 border-none focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer ${
          order.status === 'DELIVERED' ? 'text-emerald-500' : 
          order.status === 'CANCELLED' ? 'text-rose-500' : 
          order.status === 'SHIPPING' ? 'text-blue-500' : 
          order.status === 'CANCELLATION_REQUESTED' ? 'text-pink-500' :
          order.status === 'CONFIRMED' ? 'text-purple-500' : 'text-amber-500'
        }`}
      >
        <option value="PENDING">Chờ duyệt</option>
        <option value="CANCELLATION_REQUESTED">Yêu cầu hủy</option>
        <option value="CONFIRMED">Đang chuẩn bị hàng</option>
        <option value="SHIPPING">Đang giao</option>
        <option value="DELIVERED">Hoàn thành</option>
        <option value="CANCELLED">Đã hủy</option>
      </select>
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
                Duyệt & Chuẩn bị
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

            <button 
              onClick={() => setShowDetails(false)}
              className="w-full py-4 rounded-2xl bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
            >
              Đóng lại
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};