import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Home, Sparkles, Heart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';

const OrderSuccess = () => {
  const dispatch = useDispatch();
  
  const orderId = useMemo(() => `#GLZ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`, []);

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="bg-white min-h-screen flex items-center justify-center py-24 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary-100/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-pink-100/30 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        
        {/* Success Icon Animation */}
        <div className="relative inline-block mb-12">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping scale-150 duration-2000 opacity-20"></div>
          <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping scale-200 duration-3000 opacity-10"></div>
          <div className="relative z-10 w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center shadow-[0_20px_50px_rgba(34,197,94,0.15)] border-2 border-green-50">
             <div className="w-24 h-24 bg-green-500 text-white rounded-[2rem] flex items-center justify-center animate-in zoom-in-50 duration-500 delay-200">
                <CheckCircle size={48} strokeWidth={3} />
             </div>
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-3 bg-white rounded-2xl shadow-lg animate-bounce text-primary-500">
                <Sparkles size={24} />
             </div>
          </div>
        </div>

        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
             Tuyệt <span className="text-primary-500">Vời!</span><br />
             <span className="text-3xl md:text-4xl text-slate-400 not-italic tracking-normal lowercase font-bold">Thanh toán hoàn tất</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-lg mx-auto italic">
             Cảm ơn bạn đã lựa chọn <span className="text-primary-500 font-black not-italic">Glowzy</span>. Đơn hàng của bạn đang được xử lý "siêu tốc" để sớm về tay bạn!
          </p>
        </div>

        {/* Premium Order Details Card */}
        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] text-left relative group overflow-hidden border border-slate-800">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/20 transition-all duration-500" />
           
           <div className="flex items-center justify-between pb-8 border-b border-white/10 mb-8">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mã định danh đơn hàng</p>
                 <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-white tracking-widest uppercase">{orderId}</p>
                    <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-black uppercase tracking-tighter">Đã xác nhận</div>
                 </div>
              </div>
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-primary-500 border border-white/5">
                 <Package size={32} />
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Giao hàng dự kiến</p>
                 <p className="font-black text-white text-base">Trong 2 - 3 ngày tới</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trạng thái</p>
                 <p className="font-black text-white text-base">Đang đóng gói</p>
              </div>
              <div className="space-y-2 md:text-right">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tổng đầu tư nhan sắc</p>
                 <p className="text-2xl font-black text-primary-400 tracking-tighter tabular-nums">1.210.000đ</p>
              </div>
           </div>

           <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 Hỗ trợ 24/7
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <Heart size={14} className="text-pink-500" />
                 Đặc quyền Glowzy Member
              </div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center pt-12">
          <Link to="/" className="w-full sm:w-auto px-12 py-5 bg-primary-500 text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary-500/30 hover:bg-black transition-all hover:-translate-y-2 uppercase tracking-widest flex items-center justify-center gap-3 group active:scale-95">
            <Home size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Tiếp tục mua sắm</span>
          </Link>
          <Link to="/profile" className="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 border-2 border-slate-900 font-black rounded-[1.5rem] hover:bg-slate-900 hover:text-white transition-all hover:-translate-y-2 uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 shadow-xl">
            <span>Theo dõi đơn hàng</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        <p className="mt-12 text-xs text-slate-400 font-medium italic max-w-sm mx-auto leading-relaxed">
           Chúng mình vừa gửi hoá đơn chi tiết và hướng dẫn chăm sóc da tới Email của bạn. Đừng quên kiểm tra nhé!
        </p>

      </div>
    </div>
  );
};

export default OrderSuccess;
