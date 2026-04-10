import { ShieldCheck, Lock, Eye, Bell } from 'lucide-react';

const Privacy = () => {
  const lastUpdated = '10 tháng 04, 2026';

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
           <div className="flex items-center gap-3 text-primary-600 font-bold uppercase tracking-widest text-xs mb-4">
             <ShieldCheck size={16} />
             <span>Trung tâm bảo mật</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">
             Chính sách <span className="text-primary-500">Bảo mật</span>
           </h1>
           <p className="text-gray-500 font-medium italic">Cập nhật lần cuối: {lastUpdated}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-16">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
           <div className="p-8 md:p-12 space-y-12">
              
              <section className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-900 mb-4">
                   <div className="p-2 bg-primary-50 text-primary-500 rounded-lg">
                     <Eye size={20} />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">1. Thu thập thông tin</h2>
                 </div>
                 <div className="text-gray-600 font-medium leading-relaxed space-y-4">
                   <p>Tại Glowzy, chúng tôi thu nộp các loại thông tin sau để cung cấp dịch vụ tốt nhất cho bạn:</p>
                   <ul className="list-disc pl-6 space-y-2">
                     <li>Thông tin định danh cá nhân: Tên, địa chỉ email, số điện thoại, địa chỉ giao hàng.</li>
                     <li>Thông tin tài khoản: Tên đăng nhập, mật khẩu được mã hóa.</li>
                     <li>Thông tin giao dịch: Chi tiết đơn hàng, lịch sử mua sắm và phương thức thanh toán.</li>
                     <li>Thông tin thiết bị: Địa chỉ IP, loại trình duyệt để đảm bảo an ninh hệ thống.</li>
                   </ul>
                 </div>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-900 mb-4">
                   <div className="p-2 bg-primary-50 text-primary-500 rounded-lg">
                     <Lock size={20} />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">2. Mục đích sử dụng</h2>
                 </div>
                 <p className="text-gray-600 font-medium leading-relaxed">
                   Chúng tôi sử dụng thông tin của bạn để xử lý đơn hàng, gửi thông báo cập nhật vận chuyển, cung cấp các ưu đãi cá nhân hóa và cải thiện trải nghiệm mua sắm tại Glowzy. Thông tin của bạn sẽ KHÔNG bao giờ được bán cho bên thứ ba.
                 </p>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-900 mb-4">
                   <div className="p-2 bg-primary-50 text-primary-500 rounded-lg">
                     <ShieldCheck size={20} />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">3. Bảo mật dữ liệu</h2>
                 </div>
                 <p className="text-gray-600 font-medium leading-relaxed">
                   Chúng tôi áp dụng các công nghệ mã hóa SSL 256-bit và các quy trình kiểm soát truy cập nghiêm ngặt để bảo vệ dữ liệu của bạn khỏi các hành vi truy cập trái phép.
                 </p>
              </section>

              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Bell size={120} />
                 </div>
                 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-lg font-black mb-1">Cần hỗ trợ về quyền riêng tư?</h4>
                      <p className="text-slate-400 text-sm font-medium">Chúng tôi luôn sẵn sàng giải đáp thắc mắc của bạn 24/7.</p>
                    </div>
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                       Gửi yêu cầu hỗ trợ
                    </button>
                 </div>
              </div>

           </div>
        </div>

        <div className="mt-12 text-center text-gray-400 font-medium text-sm">
           <p>Bằng việc sử dụng website Glowzy, bạn đồng ý với các điều khoản bảo mật này.</p>
           <div className="flex justify-center gap-8 mt-4 uppercase tracking-widest text-[10px] font-black">
              <span className="hover:text-primary-500 cursor-pointer">Điều khoản sử dụng</span>
              <span className="hover:text-primary-500 cursor-pointer">Cookie Policy</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
