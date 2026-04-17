import { useState, useEffect } from "react";
import type { Order } from "../types";
import { Table } from "../components/admin/Table";
import { Modal } from "../components/admin/Modal";
import { orderService } from "../api/orderService";
import { toast } from "react-hot-toast";
import { Eye, ShoppingCart, User, Phone, MapPin } from "lucide-react";

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await orderService.adminGetAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await orderService.adminUpdateOrderStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const tableData = orders.map(order => ({
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
      <div className="text-slate-500 text-xs font-medium italic">
        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
      </div>
    ),
    actions: (
      <div className="flex items-center gap-2">
        {order.status === 'CANCELLATION_REQUESTED' && (
          <>
            <button 
              onClick={async () => {
                try {
                  await orderService.adminApproveCancellation(order.id);
                  toast.success("Đã duyệt hủy đơn hàng");
                  fetchOrders();
                } catch (error) {
                  toast.error("Lỗi khi duyệt hủy");
                }
              }}
              className="px-2 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg text-[10px] font-black uppercase transition-all"
              title="Duyệt Hủy"
            >
              Duyệt
            </button>
            <button 
              onClick={async () => {
                try {
                  await orderService.adminRejectCancellation(order.id);
                  toast.success("Đã từ chối yêu cầu hủy");
                  fetchOrders();
                } catch (error) {
                  toast.error("Lỗi khi từ chối hủy");
                }
              }}
              className="px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[10px] font-black uppercase transition-all"
              title="Từ Chối Hủy"
            >
              Từ chối
            </button>
          </>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Quản lý đơn hàng</h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi và cập nhật trạng thái đơn hàng của khách hàng.</p>
      </div>

      <Table 
        columns={[
          { header: "Khách hàng", key: "customer" },
          { header: "Tổng tiền", key: "amount" },
          { header: "Trạng thái", key: "status" },
          { header: "Ngày", key: "date" },
          { header: "Chi tiết", key: "actions" }
        ]} 
        data={tableData} 
      />

      {showDetails && selectedOrder && (
        <Modal onClose={() => setShowDetails(false)} title={`Đơn hàng #${selectedOrder.id}`}>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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