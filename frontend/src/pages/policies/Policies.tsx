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
    <h3>1. Thời hạn đổi trả</h3>
    <p>Guardian hỗ trợ đổi trả sản phẩm trong vòng 30 ngày kể từ ngày nhận hàng.</p>
    <h3>2. Điều kiện đổi trả</h3>
    <ul>
      <li>Sản phẩm còn nguyên tem, mác, niêm phong.</li>
      <li>Sản phẩm chưa qua sử dụng.</li>
      <li>Có hóa đơn mua hàng đi kèm.</li>
    </ul>
    <h3>3. Quy trình thực hiện</h3>
    <p>Quý khách có thể mang sản phẩm đến cửa hàng gần nhất hoặc liên hệ hotline 1900 xxxx để được hướng dẫn.</p>
  </PolicyLayout>
);

export const ShippingPolicy = () => (
  <PolicyLayout title="Chính sách vận chuyển">
    <h3>1. Khu vực giao hàng</h3>
    <p>Giao hàng toàn quốc thông qua các đối tác vận chuyển uy tín.</p>
    <h3>2. Phí vận chuyển</h3>
    <ul>
      <li>Miễn phí cho đơn hàng từ 300.000đ.</li>
      <li>Đơn hàng dưới 300.000đ: Phí đồng giá 25.000đ toàn quốc.</li>
    </ul>
    <h3>3. Thời gian nhận hàng</h3>
    <p>Nội thành: 1-2 ngày. Ngoại thành: 3-5 ngày.</p>
  </PolicyLayout>
);

export const WarrantyPolicy = () => (
  <PolicyLayout title="Chính sách bảo hành">
    <h3>1. Đối tượng bảo hành</h3>
    <p>Áp dụng cho các thiết bị điện tử, máy massage, máy rửa mặt chính hãng tại Guardian.</p>
    <h3>2. Thời gian bảo hành</h3>
    <p>Theo chính sách từ nhà sản xuất (thường từ 6 - 12 tháng).</p>
    <h3>3. Địa điểm bảo hành</h3>
    <p>Tại các trung tâm bảo hành ủy quyền của hãng hoặc thông qua Guardian.</p>
  </PolicyLayout>
);
