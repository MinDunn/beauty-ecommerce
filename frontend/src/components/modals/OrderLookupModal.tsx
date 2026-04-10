import { useState } from 'react';
import { X, Package, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../api/orderService';
import { toast } from 'react-hot-toast';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderLookupModal = ({ isOpen, onClose }: OrderLookupModalProps) => {
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setIsSearching(true);
    setResult(null);
    try {
      const data = await orderService.lookupOrder(orderId);
      // Format response slightly for UI if needed
      setResult({
        id: data.id,
        status: data.status,
        date: new Date(data.orderDate).toLocaleDateString('vi-VN'),
        items: data.items.length,
        total: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalPrice)
      });
      toast.success('Đã tìm thấy đơn hàng!');
    } catch (error) {
      console.error('Lỗi khi tra cứu đơn hàng:', error);
      setResult('NOT_FOUND');
      toast.error('Không tìm thấy đơn hàng!');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Tra cứu đơn hàng</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleLookup} className="space-y-4">
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Nhập mã đơn hàng (VD: GLW123...)"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-primary-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-70"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Kiểm tra ngay</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-gray-100 pt-6">
                {result === 'NOT_FOUND' && (
                  <div className="text-center py-4">
                    <p className="text-rose-500 font-bold">Không tìm thấy đơn hàng!</p>
                    <p className="text-gray-500 text-sm">Vui lòng kiểm tra lại mã đơn hàng của bạn.</p>
                  </div>
                )}

                {result && result !== 'NOT_FOUND' && (
                  <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-primary-600 tracking-wider">Trạng thái</p>
                        <p className="font-bold text-slate-900">{result.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ngày đặt</p>
                        <p className="font-bold text-slate-900 text-sm">{result.date}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Số lượng mục:</span>
                        <span className="font-bold">{result.items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Tổng thanh toán:</span>
                        <span className="font-bold text-primary-600">{result.total}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!result && !isSearching && (
                  <p className="text-center text-gray-400 text-sm italic">
                    Nhập mã đơn hàng bạn nhận được qua email để theo dõi hành trình vận chuyển.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
