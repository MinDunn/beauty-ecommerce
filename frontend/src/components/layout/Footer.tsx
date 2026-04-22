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
        <div className="md:col-span-2">
          <div className="text-3xl font-black text-slate-900 mb-6">GLOWZY<span className="text-primary-500">.</span></div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
            Glowzy là chuỗi cửa hàng chăm sóc sức khỏe và sắc đẹp hiện đại. Chúng tôi cam kết mang đến những sản phẩm chất lượng nhất.
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
            <li><Link to="/about" className="hover:text-primary-500">Giới thiệu về Glowzy</Link></li>
            <li><Link to="/stores" className="hover:text-primary-500">Hệ thống cửa hàng</Link></li>
            <li><Link to="/careers" className="hover:text-primary-500">Tuyển dụng</Link></li>
            <li><Link to="/contact" className="hover:text-primary-500">Góp ý</Link></li>
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
            <li><Link to="/policy/terms" className="hover:text-primary-500">Điều khoản dịch vụ</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright & Legal */}
      <div className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="space-y-4 max-w-md">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Thông tin doanh nghiệp</h4>
              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Công ty TNHH Glowzy Beauty Việt Nam</p>
              <div className="space-y-2 text-xs text-gray-500 font-medium leading-relaxed">
                <p>Mã số thuế: 0123456789 - Cấp ngày 01/01/2026 tại Sở KH&ĐT TP.HCM</p>
                <p>Địa chỉ: 123 Đường ABC, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                <p>Hotline: <span className="text-primary-600 font-black">1900 1234</span> (8:00 - 22:00)</p>
                <p>Email: <span className="text-primary-600 font-black">contact@glowzy.com</span></p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <a 
                href="http://online.gov.vn/Home/WebDetails/12345" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/images/bo-cong-thuong.png.png" 
                  alt="Đã thông báo Bộ Công Thương" 
                  className="h-12 w-auto"
                />
              </a>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">© 2026 Glowzy Beauty</p>
                <div className="flex space-x-6 justify-end text-xs font-bold text-gray-500 uppercase tracking-tighter">
                  <Link to="/policy/terms" className="hover:text-primary-600 transition-colors">Điều khoản</Link>
                  <Link to="/policy/privacy" className="hover:text-primary-600 transition-colors">Bảo mật</Link>
                  <span className="hover:text-primary-600 cursor-pointer">Sơ đồ trang web</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
