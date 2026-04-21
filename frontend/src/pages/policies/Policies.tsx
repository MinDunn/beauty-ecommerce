import React from 'react';

interface PolicyLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({ title, children }) => {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 border-b-4 border-primary-500 inline-block">
          {title}
        </h1>
        <div className="prose prose-lg max-w-none text-gray-600 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ReturnPolicy = () => (
  <PolicyLayout title="Chính sách đổi trả">
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">1. Thời hạn đổi trả</h3>
        <p>Glowzy hỗ trợ đổi trả sản phẩm trong vòng <strong>30 ngày</strong> kể từ ngày quý khách nhận được hàng thành công.</p>
      </section>
      
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">2. Điều kiện đổi trả</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Sản phẩm còn nguyên tem, mác, niêm phong và bao bì gốc.</li>
          <li>Sản phẩm chưa qua sử dụng, không bị dính bẩn hoặc biến dạng.</li>
          <li>Có hóa đơn mua hàng hoặc thông tin đơn hàng trên hệ thống Glowzy.</li>
          <li><strong>Đặc biệt:</strong> Hỗ trợ đổi trả đối với trường hợp bị kích ứng da trong vòng 7 ngày kể từ khi nhận hàng (cần cung cấp hình ảnh/video bằng chứng).</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">3. Phương thức hoàn tiền</h3>
        <p>Sau khi nhận được hàng đổi trả và kiểm tra điều kiện, Glowzy sẽ thực hiện hoàn tiền qua:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Chuyển khoản ngân hàng (3-5 ngày làm việc).</li>
          <li>Mã giảm giá (Voucher) có giá trị tương đương (nhận ngay lập tức).</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">4. Quy trình thực hiện</h3>
        <p>Quý khách vui lòng liên hệ Hotline <strong>1900 6336</strong> hoặc nhắn tin qua Fanpage Glowzy để được hướng dẫn quy trình đóng gói và gửi hàng chi tiết.</p>
      </section>
    </div>
  </PolicyLayout>
);

export const ShippingPolicy = () => (
  <PolicyLayout title="Chính sách vận chuyển">
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">1. Khu vực và Đối tác vận chuyển</h3>
        <p>Glowzy thực hiện giao hàng trên toàn quốc (63 tỉnh thành) thông qua các đối tác vận chuyển uy tín: <strong>Giao Hàng Nhanh (GHN), Viettel Post, GHTK.</strong></p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">2. Phí vận chuyển</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Miễn phí vận chuyển:</strong> Áp dụng cho mọi đơn hàng có giá trị từ 300.000đ trở lên.</li>
          <li><strong>Phí đồng giá:</strong> Đơn hàng dưới 300.000đ áp dụng phí vận chuyển 25.000đ trên toàn quốc.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">3. Thời gian nhận hàng</h3>
        <ul className="list-disc pl-5 mt-2">
          <li>Khu vực nội thành (Hà Nội, TP.HCM): 1 - 2 ngày làm việc.</li>
          <li>Khu vực ngoại thành và các tỉnh/thành khác: 3 - 5 ngày làm việc.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">4. Chính sách kiểm hàng</h3>
        <p>Glowzy khuyến khích quý khách <strong>kiểm tra ngoại quan sản phẩm</strong> (số lượng, tình trạng bao bì) trước khi thanh toán và nhận hàng từ nhân viên giao vận để đảm bảo quyền lợi tốt nhất.</p>
      </section>
    </div>
  </PolicyLayout>
);

export const WarrantyPolicy = () => (
  <PolicyLayout title="Chính sách bảo hành">
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">1. Đối với thiết bị làm đẹp</h3>
        <p>Áp dụng cho các sản phẩm máy rửa mặt, máy massage, máy đẩy tinh chất...</p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li><strong>Bảo hành chính hãng:</strong> 12 tháng kể từ ngày mua.</li>
          <li><strong>Chính sách 1 đổi 1:</strong> Trong vòng 30 ngày đầu tiên nếu phát hiện lỗi kỹ thuật từ nhà sản xuất.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">2. Đối với sản phẩm mỹ phẩm</h3>
        <p>Glowzy cam kết 100% sản phẩm là hàng chính hãng, có nguồn gốc xuất xứ rõ ràng. Chúng tôi sẵn sàng <strong>bồi thường 200% giá trị</strong> nếu khách hàng phát hiện hàng giả, hàng nhái từ hệ thống của chúng tôi.</p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">3. Nơi nhận bảo hành</h3>
        <p>Quý khách có thể mang trực tiếp qua hệ thống cửa hàng Glowzy trên toàn quốc hoặc gửi về trung tâm bảo hành tại:</p>
        <p className="mt-2 text-gray-800 font-medium italic">Số 123 Đường Sắc Đẹp, Quận Cầu Giấy, TP. Hà Nội.</p>
      </section>
    </div>
  </PolicyLayout>
);
