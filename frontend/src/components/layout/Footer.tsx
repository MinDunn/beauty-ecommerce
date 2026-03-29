import { 
  Facebook, 
  Instagram, 
  Youtube, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12">
      {/* Benefit Bar */}
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-gray-100 pb-12">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-50 p-3 rounded-full text-primary-500">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Giao hàng miễn phí</h4>
            <p className="text-xs text-gray-500">Đơn hàng từ 300k</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-primary-50 p-3 rounded-full text-primary-500">
            <RefreshCw size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm">30 Ngày đổi trả</h4>
            <p className="text-xs text-gray-500">Hỗ trợ đổi trả nhanh</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-primary-50 p-3 rounded-full text-primary-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Sản phẩm chính hãng</h4>
            <p className="text-xs text-gray-500">Cam kết 100%</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-primary-50 p-3 rounded-full text-primary-500">
            <CreditCard size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Thanh toán an toàn</h4>
            <p className="text-xs text-gray-500">Nhiều lựa chọn</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* About Column */}
        <div>
          <div className="text-2xl font-black text-guardian-green mb-6">GUARDIAN<span className="text-guardian-orange">.</span></div>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Guardian là chuỗi cửa hàng chăm sóc sức khỏe và sắc đẹp hàng đầu Việt Nam. Chúng tôi cam kết mang đến những sản phẩm chất lượng nhất.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary-500 hover:text-white transition-all">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary-500 hover:text-white transition-all">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary-500 hover:text-white transition-all">
              <Youtube size={18} />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Về chúng tôi</h4>
          <ul className="space-y-3 text-sm text-gray-600">
            <li><Link to="/about" className="hover:text-primary-500">Giới thiệu về Guardian</Link></li>
            <li><Link to="/stores" className="hover:text-primary-500">Hệ thống cửa hàng</Link></li>
            <li><Link to="/careers" className="hover:text-primary-500">Tuyển dụng</Link></li>
            <li><Link to="/contact" className="hover:text-primary-500">Liên hệ</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Chính sách</h4>
          <ul className="space-y-3 text-sm text-gray-600">
            <li><Link to="/policy/shipping" className="hover:text-primary-500">Chính sách vận chuyển</Link></li>
            <li><Link to="/policy/return" className="hover:text-primary-500">Chính sách đổi trả</Link></li>
            <li><Link to="/policy/warranty" className="hover:text-primary-500">Chính sách bảo hành</Link></li>
            <li><Link to="/policy/privacy" className="hover:text-primary-500">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Đăng ký nhận tin</h4>
          <p className="text-gray-600 text-sm mb-4">Nhận ưu đãi mới nhất và tin tức làm đẹp.</p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Email của bạn" 
              className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button className="bg-primary-500 text-white px-4 py-2 rounded-r-lg font-bold hover:bg-primary-600 transition-colors">
              Gửi
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-50 py-8 border-t border-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2024 Guardian Việt Nam. Tất cả quyền được bảo lưu.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <span className="hover:text-gray-800 cursor-pointer">Điều khoản sử dụng</span>
            <span className="hover:text-gray-800 cursor-pointer">Sơ đồ trang web</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
