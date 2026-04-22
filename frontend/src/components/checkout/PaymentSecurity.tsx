import { ShieldCheck, Lock, CreditCard, CheckCircle2 } from 'lucide-react';

const PaymentSecurity = () => {
  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white overflow-hidden relative group">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Cam kết bảo mật thanh toán</h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em] mt-1">An toàn tuyệt đối cho mọi giao dịch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary-400 font-black text-[10px] uppercase tracking-widest">
              <Lock size={14} /> Mã hóa SSL 256-bit
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Mọi dữ liệu thanh toán của bạn đều được mã hóa bằng công nghệ SSL tiên tiến nhất, đảm bảo tính bảo mật và toàn vẹn dữ liệu.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
              <CheckCircle2 size={14} /> Tuân thủ quy định
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Glowzy tuân thủ nghiêm ngặt các quy chuẩn về giao dịch thương mại điện tử theo Nghị định 52/2013/NĐ-CP và NĐ 85/2021/NĐ-CP.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-400 font-black text-[10px] uppercase tracking-widest">
              <CreditCard size={14} /> Đa dạng phương thức
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Chúng tôi chỉ hợp tác với các cổng thanh toán uy tín hàng đầu Việt Nam như MoMo, VNPAY để đảm bảo an toàn cho ví tiền của bạn.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-8 w-auto object-contain" />
            <img src="https://vnpay.vn/wp-content/uploads/2020/07/vnpay-logo.png" alt="VNPAY" className="h-6 w-auto object-contain" />
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
            Glowzy Beauty © Hệ thống thanh toán an toàn
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSecurity;
