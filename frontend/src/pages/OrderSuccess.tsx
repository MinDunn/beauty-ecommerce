import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag, Home } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';

const OrderSuccess = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    dispatch(clearCart());
    
    // Lấy orderId từ URL (MoMo redirect) hoặc state (COD)
    const params = new URLSearchParams(location.search);
    const momoOrderId = params.get('orderId');
    const stateOrderId = location.state?.orderId;
    
    setOrderId(momoOrderId || stateOrderId?.toString() || '000');
  }, [dispatch, location]);

  return (
    <div className="bg-white min-h-screen flex items-center justify-center py-24 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10 transition-all duration-1000 animate-in fade-in zoom-in-95">
        <div className="mb-12 inline-flex items-center justify-center w-32 h-32 bg-green-50 text-green-500 rounded-[2.5rem] shadow-xl shadow-green-500/10 border border-green-100">
           <CheckCircle size={64} strokeWidth={1.5} />
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase mb-6 italic">Thanh toán <span className="text-primary-500">thành công!</span></h1>
        
        <p className="text-gray-500 text-lg md:text-xl font-medium mb-12 leading-relaxed">
          Cảm ơn bạn đã lựa chọn Glowzy. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
        </p>

        <div className="bg-gray-50 rounded-[3rem] p-10 mb-12 border border-gray-100 shadow-inner">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Mã đơn hàng của bạn</p>
           <h3 className="text-3xl font-black text-slate-900 tracking-widest">{orderId}</h3>
           <div className="w-12 h-1 bg-primary-500 mx-auto mt-6 rounded-full" />
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
