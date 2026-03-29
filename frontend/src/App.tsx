import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ReturnPolicy, ShippingPolicy, WarrantyPolicy } from './pages/policies/Policies';
import Contact from './pages/Contact';

// Home Page Simple Version
const Home = () => (
  <div className="container mx-auto px-4 py-20 text-center">
    <div className="inline-block px-4 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
      Beauty & Health
    </div>
    <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter">
      KHÁM PHÁ THẾ GIỚI <br />
      <span className="text-guardian-green">LÀM ĐẸP</span> TẠI <span className="text-guardian-orange">GUARDIAN</span>
    </h1>
    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
      Trải nghiệm mua sắm mỹ phẩm chính hãng với hàng ngàn ưu đãi hấp dẫn mỗi ngày.
      Chúng tôi cam kết chất lượng và sự hài lòng tuyệt đối.
    </p>
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <button className="px-8 py-4 bg-primary-500 text-white font-black rounded-xl hover:bg-primary-600 transition-all uppercase tracking-widest w-full sm:w-auto">
        Mua sắm ngay
      </button>
      <button className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 font-black rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest w-full sm:w-auto">
        Xem khuyến mãi
      </button>
    </div>

    {/* Dashboard Kiểm duyệt cho người dùng */}
    <div className="mt-24 p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 inline-block text-left max-w-4xl w-full">
      <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
        <span className="w-2 h-8 bg-primary-500 mr-3"></span>
        DASHBOARD KIỂM DUYỆT (Dành cho Danh)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/login" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all group">
          <h4 className="font-bold text-primary-600 group-hover:text-primary-500">Trang Đăng nhập →</h4>
          <p className="text-xs text-gray-500 mt-1">Kiểm tra Form & Validation</p>
        </Link>
        <Link to="/register" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all group">
          <h4 className="font-bold text-primary-600 group-hover:text-primary-500">Trang Đăng ký →</h4>
          <p className="text-xs text-gray-500 mt-1">Kiểm tra Form đăng ký mới</p>
        </Link>
        <Link to="/contact" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all group">
          <h4 className="font-bold text-primary-600 group-hover:text-primary-500">Trang Liên hệ →</h4>
          <p className="text-xs text-gray-500 mt-1">Kiểm tra Form & Google Maps</p>
        </Link>
        <Link to="/policy/return" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all group">
          <h4 className="font-bold text-primary-600 group-hover:text-primary-500">Chính sách Đổi trả →</h4>
          <p className="text-xs text-gray-500 mt-1">Giao diện văn bản tĩnh</p>
        </Link>
        <Link to="/policy/shipping" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all group">
          <h4 className="font-bold text-primary-600 group-hover:text-primary-500">C.Sách Vận chuyển →</h4>
          <p className="text-xs text-gray-500 mt-1">Giao diện văn bản tĩnh</p>
        </Link>
        <Link to="/policy/warranty" className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all group">
          <h4 className="font-bold text-primary-600 group-hover:text-primary-500">C.Sách Bảo hành →</h4>
          <p className="text-xs text-gray-500 mt-1">Giao diện văn bản tĩnh</p>
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Policy Routes */}
          <Route path="/policy/return" element={<ReturnPolicy />} />
          <Route path="/policy/shipping" element={<ShippingPolicy />} />
          <Route path="/policy/warranty" element={<WarrantyPolicy />} />

          {/* Contact Route */}
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
