import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  PhoneCall, 
  MapPin,
} from 'lucide-react';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { cn } from '../../utils/cn';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { name: 'Chăm sóc da', href: '/category/skincare' },
    { name: 'Trang điểm', href: '/category/makeup' },
    { name: 'Chăm sóc tóc', href: '/category/haircare' },
    { name: 'Chăm sóc cơ thể', href: '/category/bodycare' },
    { name: 'Thực phẩm chức năng', href: '/category/supplements' },
  ];

  return (
    <header className="w-full bg-white">
      {/* Top Bar */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center hover:text-primary-500 cursor-pointer">
              <PhoneCall size={14} className="mr-1" /> Tra cứu đơn hàng
            </span>
            <span className="flex items-center hover:text-primary-500 cursor-pointer">
              <MapPin size={14} className="mr-1" /> Hệ thống cửa hàng
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-primary-500 cursor-pointer">Cẩm nang mua sắm</span>
            <span className="hover:text-primary-500 cursor-pointer">Khuyến mãi</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="text-2xl md:text-3xl font-black text-guardian-green tracking-tighter flex items-center">
            GUARDIAN<span className="text-guardian-orange">.</span>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm, thương hiệu..." 
            className="w-full pl-4 pr-12 py-2.5 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm"
          />
          <button className="absolute right-1 top-1 bottom-1 px-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
            <Search size={18} />
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="hidden md:flex flex-col items-center group cursor-pointer">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                 <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold uppercase">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-500 uppercase font-bold">Xin chào</span>
                   <span className="text-xs font-semibold">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Thoát</button>
              </div>
            ) : (
              <Link to="/login" className="flex flex-col items-center group">
                <User size={24} className="text-gray-700 group-hover:text-primary-500 transition-colors" />
                <span className="text-[10px] mt-1 font-bold text-gray-500 uppercase tracking-widest group-hover:text-primary-500">Đăng nhập</span>
              </Link>
            )}
          </div>

          <Link to="/cart" className="relative flex flex-col items-center group">
            <div className="relative">
              <ShoppingCart size={24} className="text-gray-700 group-hover:text-primary-500 transition-colors" />
              <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </div>
            <span className="hidden md:block text-[10px] mt-1 font-bold text-gray-500 uppercase tracking-widest group-hover:text-primary-500">Giỏ hàng</span>
          </Link>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <button className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 font-bold text-sm uppercase tracking-wider">
              <Menu size={18} />
              <span>Danh mục sản phẩm</span>
            </button>
            <div className="flex items-center space-x-8 ml-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-sm font-bold text-gray-700 hover:text-primary-500 uppercase tracking-wide transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-50 bg-white transform transition-transform duration-300 lg:hidden",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex justify-between items-center border-b">
          <div className="text-2xl font-black text-guardian-green">GUARDIAN<span className="text-guardian-orange">.</span></div>
          <button onClick={() => setIsMenuOpen(false)}><X size={28} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative mb-6">
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-lg focus:ring-0 outline-none"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {!isAuthenticated && (
            <Link 
              to="/login" 
              className="block w-full text-center py-3 bg-primary-500 text-white font-bold rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
