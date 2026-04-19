import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  PhoneCall, 
  MapPin,
  User,
  Heart
} from 'lucide-react';
import type { RootState } from '../../store';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { cn } from '../../utils/cn';
import { OrderLookupModal } from '../modals/OrderLookupModal';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { totalQuantity } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
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
            <span 
              onClick={() => setIsOrderLookupOpen(true)}
              className="flex items-center hover:text-primary-500 cursor-pointer transition-colors"
            >
              <PhoneCall size={14} className="mr-1" /> Tra cứu đơn hàng
            </span>
            <Link to="/stores" className="flex items-center hover:text-primary-500 cursor-pointer transition-colors">
              <MapPin size={14} className="mr-1" /> Hệ thống cửa hàng
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/beauty-guide" className="hover:text-primary-500 transition-colors">Cẩm nang mua sắm</Link>
            <span className="hover:text-primary-500 cursor-pointer transition-colors">Khuyến mãi</span>
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
          <div className="text-3xl font-black tracking-tighter text-slate-900">GLOWZY<span className="text-primary-500">.</span></div>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
          <form onSubmit={handleSearch} className="w-full relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm, thương hiệu..." 
              className="w-full pl-4 pr-12 py-2.5 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm"
            />
            <button type="submit" className="absolute right-1 top-1 bottom-1 px-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2 md:space-x-6">
          <div className="hidden md:flex items-center gap-6">
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="flex items-center group" title="Trang quản trị">
                <span className="px-3 py-1.5 rounded-xl border border-slate-300 text-[11px] font-black uppercase tracking-widest text-slate-700 group-hover:text-primary-500 group-hover:border-primary-500 transition-colors">
                  Trang quản trị
                </span>
              </Link>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="flex items-center gap-2 text-slate-700 hover:text-primary-500 transition-colors">
                <User size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Đăng nhập</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative group/user py-2 cursor-pointer">
                <div className="flex items-center space-x-2">
                   <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold uppercase">
                    {user?.fullName?.[0] || 'U'}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 uppercase font-bold">Xin chào</span>
                     <span className="text-xs font-semibold">{user?.fullName}</span>
                  </div>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 z-50 overflow-hidden transform translate-y-2 group-hover/user:translate-y-0">
                   <div className="p-2">
                      {user?.role === 'ADMIN' && (
                        <>
                          <Link to="/admin" className="block px-4 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
                             Trang quản trị
                          </Link>
                          <Link to="/admin/inventory-receipts" className="block px-4 py-3 text-sm font-bold text-slate-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-colors">
                             HĐ nhập hàng
                          </Link>
                        </>
                      )}
                     <Link to="/profile" className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-colors">
                        Hồ sơ cá nhân
                     </Link>
                     <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        Đăng xuất
                     </button>
                   </div>
                </div>
              </div>
            ) : null}
          </div>

          <Link to="/profile?tab=wishlist" className="hidden md:flex flex-col items-center group">
            <div className="relative">
              <Heart size={24} className="text-gray-700 group-hover:text-primary-500 transition-colors" />
            </div>
            <span className="text-[10px] mt-1 font-bold text-gray-500 uppercase tracking-widest group-hover:text-primary-500">Yêu thích</span>
          </Link>

          <Link to="/cart" className="relative flex flex-col items-center group">
            <div className="relative">
              <ShoppingCart size={24} className="text-gray-700 group-hover:text-primary-500 transition-colors" />
              <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalQuantity}
              </span>
            </div>
            <span className="hidden md:block text-[10px] mt-1 font-bold text-gray-500 uppercase tracking-widest group-hover:text-primary-500">Giỏ hàng</span>
          </Link>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <Link to="/category" className="relative group/cat">
              <button 
                className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 font-bold text-sm uppercase tracking-wider rounded-t-xl hover:bg-primary-600 transition-colors"
              >
                <Menu size={18} />
                <span>Danh mục sản phẩm</span>
              </button>
            </Link>
            <div className="flex items-center space-x-8 ml-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    className={cn(
                      "text-sm font-bold uppercase tracking-wide transition-colors",
                      isActive ? "text-primary-500" : "text-gray-700 hover:text-primary-500"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
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
          <div className="text-2xl font-black text-slate-900">GLOWZY<span className="text-primary-500">.</span></div>
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
              to="/admin" 
              className="block w-full text-center py-3 bg-slate-900 border border-slate-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Giao diện Quản trị</span>
            </Link>
          )}
        </div>
      </div>
      {/* Order Lookup Modal */}
      <OrderLookupModal 
        isOpen={isOrderLookupOpen} 
        onClose={() => setIsOrderLookupOpen(false)} 
      />
    </header>
  );
};

export default Header;
