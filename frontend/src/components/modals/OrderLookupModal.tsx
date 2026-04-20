import { useState, useEffect } from 'react';
import { X, Package, ArrowRight, History, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../api/orderService';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { getFullTimeline } from '../../utils/orderUtils';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderLookupModal = ({ isOpen, onClose }: OrderLookupModalProps) => {
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  useEffect(() => {
    const savedHistory = localStorage.getItem('order_lookup_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (id: string) => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return;
    
    const newHistory = [cleanId, ...history.filter(item => item !== cleanId)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('order_lookup_history', JSON.stringify(newHistory));
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setIsSearching(true);
    setResult(null);
    try {
      // Clean ID: Strip all non-digit characters (e.g. #GLW90002 -> 90002)
      const numericId = orderId.replace(/\D/g, '');
      if (!numericId) {
        toast.error('Mã đơn hàng không hợp lệ!');
        setIsSearching(false);
        return;
      }

      const data = await orderService.lookupOrder(numericId);
      saveToHistory(orderId);
      
      // We pass the raw data to result, keeping orderDate as ISO string for getFullTimeline
      setResult({
        ...data,
        formattedTotal: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalPrice)
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
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                      <PhoneCall size={20} />
                   </div>
                   <h3 className="text-xl font-black text-slate-900">Tra cứu đơn hàng</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleLookup} className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary-500/5 rounded-2xl group-focus-within:bg-primary-500/10 transition-colors pointer-events-none" />
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Nhập mã đơn hàng (VD: #GLW90001)..."
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-2 border-slate-100 focus:border-primary-500 rounded-2xl outline-none transition-all font-bold text-slate-700"
                  />
                </div>

                {history.length > 0 && !result && !isSearching && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <History size={12} />
                       Tìm kiếm gần đây
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {history.map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setOrderId(id)}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-primary-50 text-gray-500 hover:text-primary-600 rounded-xl text-[10px] font-black transition-all border border-gray-100 hover:border-primary-200"
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                  <div className="text-center py-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <p className="text-rose-500 font-bold">Không tìm thấy đơn hàng!</p>
                    <p className="text-slate-500 text-xs mt-1 italic">Vui lòng kiểm tra lại mã hoặc liên hệ hỗ trợ.</p>
                  </div>
                )}

                 {result && result !== 'NOT_FOUND' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
                       <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all" />
                       <div className="flex items-center justify-between mb-6">
                          <p className="text-[10px] font-black uppercase text-primary-400 tracking-[0.2em]">Hành trình đơn hàng</p>
                          <div className="px-2 py-1 bg-primary-500/10 border border-primary-500/20 rounded-lg text-[8px] font-black text-primary-400 uppercase tracking-widest">
                             Thời gian thực
                          </div>
                       </div>
                       
                       <div className="space-y-6 relative text-left">
                          <div className="absolute left-[13px] top-6 bottom-4 w-[1px] bg-white/10" />
                          {getFullTimeline(result as any).reverse().map((step, idx) => {
                             const Icon = step.icon;
                             const isCurrent = step.isActive;
                             const isPast = step.isCompleted;

                             return (
                               <div key={idx} className={cn(
                                 "flex gap-4 relative transition-all duration-500",
                                 !isPast && !isCurrent ? "opacity-20 grayscale" : "opacity-100"
                               )}>
                                  <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-500",
                                    isPast ? "bg-primary-500 border-primary-500 text-white" : 
                                    isCurrent ? "bg-white border-primary-500 text-primary-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]" : 
                                    "bg-slate-800 border-white/10 text-slate-500"
                                  )}>
                                    {isCurrent && (
                                      <motion.div 
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-primary-500/20 rounded-full"
                                      />
                                    )}
                                    <Icon size={12} className={isCurrent ? "animate-pulse" : ""} />
                                  </div>
                                  <div className="flex-1">
                                    <p className={cn(
                                      "text-xs font-bold uppercase tracking-tight",
                                      isCurrent ? "text-primary-400" : isPast ? "text-white" : "text-slate-500"
                                    )}>
                                      {step.label}
                                      {isCurrent && <span className="ml-2 text-[7px] bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded-full ring-1 ring-primary-500/30">Mới nhất</span>}
                                    </p>
                                    {(isPast || isCurrent) && (
                                       <p className="text-[10px] text-slate-500 font-medium">Cập nhật lúc {step.time} - {step.date}</p>
                                    )}
                                  </div>
                               </div>
                             );
                          })}
                       </div>

                       <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
                          <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mã đơn hàng</p>
                             <p className="font-black text-sm text-white">#GLW{result.id}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng cộng</p>
                             <p className="font-black text-sm text-primary-400">{result.formattedTotal}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="text-center">
                       <p className="text-[10px] text-gray-400 font-bold mb-4 italic">Cần trợ giúp? Liên hệ ngay Hotline: 1900 xxxx</p>
                       <button 
                        onClick={() => setResult(null)}
                        className="w-full py-3 rounded-xl border border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
                       >
                         Tra cứu mã khác
                       </button>
                    </div>
                  </div>
                )}

                {!result && !isSearching && (
                  <p className="text-center text-gray-400 text-sm italic">
                    Nhập mã đơn hàng bạn nhận được qua email hoặc tài khoản cá nhân để theo dõi hành trình vận chuyển.
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
