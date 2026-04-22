import { FileText, Gavel, Scale, AlertTriangle, HelpCircle, Receipt } from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = '22 tháng 04, 2026';

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
           <div className="flex items-center gap-3 text-primary-600 font-bold uppercase tracking-widest text-xs mb-4">
             <FileText size={16} />
             <span>Trung tâm pháp lý</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">
             Điều khoản <span className="text-primary-500">Dịch vụ</span>
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
                     <HelpCircle size={20} />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">1. Chấp thuận điều khoản</h2>
                 </div>
                 <div className="text-gray-600 font-medium leading-relaxed">
                   <p>Chào mừng bạn đến với Glowzy Beauty. Bằng cách truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.</p>
                 </div>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-900 mb-4">
                   <div className="p-2 bg-primary-50 text-primary-500 rounded-lg">
                     <Scale size={20} />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">2. Quy tắc giao dịch</h2>
                 </div>
                 <div className="text-gray-600 font-medium leading-relaxed space-y-4">
                   <p>Mọi giao dịch trên website Glowzy đều phải tuân thủ các quy định pháp luật Việt Nam về thương mại điện tử:</p>
                   <ul className="list-disc pl-6 space-y-2">
                     <li><strong>Giá cả:</strong> Giá sản phẩm niêm yết là giá cuối cùng (đã bao gồm thuế GTGT nếu có).</li>
                     <li><strong>Xác nhận đơn hàng:</strong> Đơn hàng chỉ được coi là thành công khi bạn nhận được email xác nhận hoặc thông báo từ hệ thống của chúng tôi.</li>
                     <li><strong>Hủy đơn hàng:</strong> Bạn có quyền hủy đơn hàng trước khi sản phẩm được bàn giao cho đơn vị vận chuyển mà không chịu bất kỳ chi phí nào.</li>
                   </ul>
                 </div>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-900 mb-4">
                   <div className="p-2 bg-primary-50 text-primary-500 rounded-lg">
                     <AlertTriangle size={20} />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">3. Trách nhiệm của khách hàng</h2>
                 </div>
                 <div className="text-gray-600 font-medium leading-relaxed">
                   <p>Bạn cam kết cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản và đặt hàng. Bạn có trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Glowzy sẽ không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh từ việc bạn không tuân thủ quy định bảo mật này.</p>
                 </div>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-900 mb-4">
                   <div className="p-2 bg-primary-50 text-primary-500 rounded-lg">
                     <Gavel size={20} />
                   </div>
                   <h2 className="text-xl font-black uppercase tracking-tight">4. Giải quyết tranh chấp</h2>
                 </div>
                 <div className="text-gray-600 font-medium leading-relaxed">
                   <p>Mọi tranh chấp phát sinh từ hoặc liên quan đến việc sử dụng website sẽ được giải quyết trước hết thông qua thương lượng và hòa giải. Trong trường hợp không thể đạt được thỏa thuận chung, tranh chấp sẽ được đưa ra cơ quan có thẩm quyền tại Việt Nam giải quyết theo quy định của pháp luật.</p>
                 </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-slate-900 mb-4">
                  <div className="p-2 bg-primary-50 text-primary-500 rounded-lg">
                    <Receipt size={20} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">5. Hóa đơn điện tử (NĐ 123/2020/NĐ-CP)</h2>
                </div>
                <div className="text-gray-600 font-medium leading-relaxed space-y-4">
                  <p>Glowzy thực hiện xuất hóa đơn điện tử theo quy định của pháp luật:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Yêu cầu hóa đơn:</strong> Quý khách có nhu cầu xuất hóa đơn VAT cho doanh nghiệp vui lòng tích chọn và cung cấp thông tin (MST, Tên Công ty, Địa chỉ) ngay tại bước Thanh toán.</li>
                    <li><strong>Thời gian phát hành:</strong> Hóa đơn điện tử sẽ được phát hành và gửi qua email của Quý khách trong vòng 24h-48h sau khi đơn hàng được giao thành công.</li>
                    <li><strong>Tính pháp lý:</strong> Hóa đơn điện tử của Glowzy có đầy đủ giá trị pháp lý theo quy định hiện hành của Tổng cục Thuế.</li>
                  </ul>
                </div>
              </section>

              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <FileText size={120} />
                 </div>
                 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-lg font-black mb-1">Cần giải thích thêm?</h4>
                      <p className="text-slate-400 text-sm font-medium">Đội ngũ pháp lý của chúng tôi luôn sẵn sàng hỗ trợ: legal@glowzy.vn</p>
                    </div>
                    <button 
                      onClick={() => window.location.href = '/contact'}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                       Gửi câu hỏi
                    </button>
                 </div>
              </div>

           </div>
        </div>

        <div className="mt-12 text-center text-gray-400 font-medium text-sm">
           <p>© 2026 Glowzy Beauty. Chân thành cảm ơn sự tin tưởng của bạn.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
