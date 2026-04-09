import { Link } from "react-router-dom";

export const Sidebar = () => (
  <div className="w-64 h-screen bg-pink-50 p-4 hidden md:block">
    <h2 className="text-xl font-bold mb-6">Quản trị Beauty</h2>
    <nav className="space-y-4">
      <Link to="/" className="block">Bảng điều khiển</Link>
      <Link to="/products" className="block">Sản phẩm</Link>
      <Link to="/orders" className="block">Đơn hàng</Link>
      <Link to="/feedback" className="block">Phản hồi</Link>
    </nav>
  </div>
);