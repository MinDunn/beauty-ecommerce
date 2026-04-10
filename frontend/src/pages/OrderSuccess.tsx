import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Home } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';

const OrderSuccess = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);
  return (
    <div className="bg-white min-h-[90vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-xl w-full text-center space-y-10">
        
        {/* Animated Celebration Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
          <div className="relative z-10 w-32 h-32 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-inner">
             <CheckCircle size={64} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
             Thanh Toán <span className="text-green-600 italic">Thành Công!</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed px-8">
             Cảm ơn bạn đã tin tưởng Glowzy. Đơn hàng của bạn đang được chúng tôi chuẩn bị và sẽ sớm giao đến bạn.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 text-left space-y-6">
           <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn hàng</p>
                 <p className="text-xl font-black text-gray-900">#GD99824</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-500 shadow-sm border border-gray-100">
                 <Package size={28} />
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-8 text-sm">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian giao dự kiến</p>
                <p className="font-bold text-gray-800">12/04/2026 - 15/04/2026</p>
             </div>
             <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng thanh toán</p>
                <p className="text-xl font-black text-primary-600">1.210.000đ</p>
             </div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6">
          <Link to="/" className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all hover:-translate-y-1 uppercase tracking-widest flex items-center justify-center gap-3 group">
            <Home size={20} />
            <span>Về trang chủ</span>
          </Link>
          <Link to="/profile" className="w-full sm:w-auto px-10 py-5 bg-primary-100 text-primary-600 font-black rounded-2xl hover:bg-primary-200 transition-all uppercase tracking-widest flex items-center justify-center gap-3">
            <span>Kiểm tra đơn hàng</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        <p className="text-xs text-gray-400 font-medium">
           Một email xác nhận đã được gửi tới hòm thư của bạn. Vui lòng kiểm tra để xem chi tiết đơn hàng.
        </p>

      </div>
    </div>
  );
};

export default OrderSuccess;
