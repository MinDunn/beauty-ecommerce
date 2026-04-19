import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  ShoppingBag, 
  Home, 
  Copy, 
  Smartphone, 
  AlertCircle,
  QrCode
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import { orderService } from '../api/orderService';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    dispatch(clearCart());
    
    // Lấy thông tin từ state (truyền từ Checkout) hoặc URL (MoMo redirect cũ)
    const state = location.state || {};
    const params = new URLSearchParams(location.search);
    
    const id = state.orderId || params.get('orderId') || '000';
    setOrderId(id.toString());

    const fetchOrderDetails = async (idToFetch: string) => {
      try {
        const resp = await orderService.lookupOrder(idToFetch);
        // Kiểm tra cấu trúc phản hồi: nếu là response.data.data hoặc response.data
        const orderData = resp.data || resp; 
        setPaymentMethod(orderData.paymentMethod?.toLowerCase() || 'cod');
        setTotalAmount(orderData.totalPrice || 0);
      } catch (error) {
        console.error("Failed to fetch order details for success page", error);
      }
    };

    if (id !== '000') {
      if (state.paymentMethod && state.totalAmount) {
        setPaymentMethod(state.paymentMethod.toLowerCase());
        setTotalAmount(state.totalAmount);
      } else {
        fetchOrderDetails(id.toString());
      }
    }
  }, [dispatch, location]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const isMomo = paymentMethod === 'momo';

  return (
    <div className="bg-white min-h-screen py-24 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto w-full text-center relative z-10 transition-all duration-1000 animate-in fade-in zoom-in-95">
        <div className="mb-10 inline-flex items-center justify-center w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] shadow-xl shadow-green-500/10 border border-green-100">
           <CheckCircle size={48} strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4 italic">Đặt hàng <span className="text-primary-500">thành công!</span></h1>
        
        <p className="text-gray-500 text-base md:text-lg font-medium mb-10 leading-relaxed max-w-xl mx-auto">
          Cảm ơn bạn đã lựa chọn Glowzy. Đơn hàng <span className="text-slate-900 font-bold">#{orderId}</span> của bạn đang được xử lý.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12">
          {/* Main Success Card */}
          <div className="bg-gray-50 rounded-[3rem] p-8 md:p-10 border border-gray-100 shadow-inner">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Mã đơn hàng của bạn</p>
             <h3 className="text-3xl font-black text-slate-900 tracking-widest mb-6">{orderId}</h3>
             <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full" />
             
             {isMomo && (
               <div className="mt-10 pt-10 border-t border-dashed border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="bg-pink-50 text-pink-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                       <Smartphone size={14} />
                       Thanh toán MoMo thủ công
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-10 w-full">
                       {/* QR Code Section */}
                       <div className="flex-1 w-full max-w-[240px]">
                          <div className="bg-white p-4 rounded-[2rem] shadow-2xl shadow-pink-500/10 border border-pink-100 relative group">
                             <img 
                               src={`https://img.vietqr.io/image/momo-0372518472-compact2.png?amount=${totalAmount}&addInfo=GLOWZY%20${orderId}&accountName=NGUYEN%20DUC%20ANH`} 
                               alt="MoMo QR Code" 
                               className="w-full aspect-square object-contain"
                             />
                             <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]">
                                <QrCode size={40} className="text-pink-500" />
                             </div>
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase tracking-widest">Quét mã để thanh toán nhanh</p>
                       </div>

                       {/* Details Section */}
                       <div className="flex-[1.5] w-full text-left space-y-4">
                          <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-pink-200 transition-colors group">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Số điện thoại MoMo</p>
                             <div className="flex justify-between items-center">
                                <span className="text-lg font-black text-slate-900">0372518472</span>
                                <button onClick={() => handleCopy('0372518472', 'Số điện thoại')} className="p-2 hover:bg-pink-50 text-gray-400 hover:text-pink-500 rounded-lg transition-all">
                                   <Copy size={16} />
                                </button>
                             </div>
                          </div>

                          <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-pink-200 transition-colors">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Chủ tài khoản</p>
                             <p className="text-lg font-black text-slate-900 uppercase">Nguyễn Đức Anh</p>
                          </div>

                          <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-pink-200 transition-colors">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nội dung chuyển khoản</p>
                             <div className="flex justify-between items-center">
                                <span className="text-lg font-black text-primary-500 uppercase tracking-tight">GLOWZY {orderId}</span>
                                <button onClick={() => handleCopy(`GLOWZY ${orderId}`, 'Nội dung')} className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-500 rounded-lg transition-all">
                                   <Copy size={16} />
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="mt-8 flex items-start gap-3 text-left bg-blue-50/50 p-4 rounded-2xl border border-blue-100 w-full">
                       <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-blue-700 font-medium leading-relaxed italic">
                         Vui lòng thanh toán đúng <span className="font-bold underline">số tiền</span> và <span className="font-bold underline">nội dung</span> để đơn hàng được duyệt tự động nhanh nhất. Admin sẽ xác nhận trong vòng 5-15 phút.
                       </p>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <Link 
            to="/" 
            className="glowzy-btn-secondary py-5 px-10 flex items-center justify-center gap-3"
           >
              <Home size={20} />
              <span>Quay lại trang chủ</span>
           </Link>
           <Link 
            to="/profile" 
            className="glowzy-btn-primary py-5 px-12 flex items-center justify-center gap-3"
           >
              <span>Xem đơn hàng</span>
              <ArrowRight size={20} />
           </Link>
        </div>

        <div className="mt-16 flex items-center justify-center gap-10 text-gray-300">
           <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                <ShoppingBag size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">Glowzy Choice</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
