import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  PhoneCall,
  MapPin,
  User,
  Heart,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import type { RootState } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { OrderLookupModal } from '../modals/OrderLookupModal';
import { categoryService } from '../../api/categoryService';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalQuantity } = useSelector((state: RootState) => state.cart);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const mainNavLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Hàng mới về', href: '/category?sort=latest' },
    { name: 'Bán chạy', href: '/category?sort=trending' },
    { name: 'HOT deal', href: '/category?onSale=true' },
  ];

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Group subcategories under parents
  const menuStructure = categories
    .filter(cat => !cat.parentId || cat.parentId === 0 || cat.parentId === "0") // Strictly top-level
    .map(parent => ({
      ...parent,
      children: categories.filter(child => String(child.parentId) === String(parent.id)),
      href: `/category/${parent.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`
    }));

  const toggleCategory = (id: number) => {
    setExpandedCategoryId(expandedCategoryId === id ? null : id);
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm md:shadow-md transition-shadow">
      {/* Main Header Section - Darker solid shade */}
      <div className="w-full bg-primary-200 border-b border-primary-300/30">
        <div className="container mx-auto px-4 py-2 md:py-3.5 flex items-center justify-between gap-4 max-w-[1536px]">
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Logo Section - Consolidated Single Layer */}
          <div className="relative -ml-4 flex-shrink-0 group z-10">
            {/* Unified Background & Shadow Layer - Extra bottom overlap to ensure flush fit */}
            <div className="absolute left-[-100vw] right-0 top-0 bottom-0 bg-primary-400 -mt-2 md:-mt-3.5 -mb-[18px] md:-mb-[24px] rounded-r-full shadow-2xl transition-all"></div>
            
            <Link 
              to="/" 
              className="relative z-10 flex items-center text-white pl-6 pr-12 py-4 md:py-6 -mt-2 md:-mt-3.5 -mb-[18px] md:-mb-[24px]"
            >
              <div className="text-2xl md:text-3xl font-black tracking-tighter flex items-center relative">
                GLOWZY<span className="text-white/80 transition-colors">.</span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full pl-4 pr-12 py-2 bg-white border border-primary-100 rounded-full focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm"
              />
              <button type="submit" className="absolute right-1 top-1 bottom-1 px-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* User Actions & Utility Links */}
          <div className="flex flex-col items-end gap-3">
            {/* Utility Links - Moved from Top Bar */}
            <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <span
                onClick={() => setIsOrderLookupOpen(true)}
                className="flex items-center hover:text-primary-500 cursor-pointer transition-colors"
              >
                <PhoneCall size={12} className="mr-1.5" /> Tra cứu đơn hàng
              </span>
              <Link to="/stores" className="flex items-center hover:text-primary-500 transition-colors">
                <MapPin size={12} className="mr-1.5" /> Hệ thống cửa hàng
              </Link>
              <Link to="/beauty-guide" className="flex items-center hover:text-primary-500 transition-colors">
                <BookOpen size={12} className="mr-1.5" /> Cẩm nang mua sắm
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center gap-6">
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="flex items-center group" title="Trang quản trị">
                    <span className="px-3 py-1.5 rounded-xl border border-slate-300 text-[11px] font-black uppercase tracking-widest text-slate-700 group-hover:text-primary-500 group-hover:border-primary-500 transition-colors">
                      Quản trị
                    </span>
                  </Link>
                )}

                {!isAuthenticated ? (
                  <Link to="/login" className="flex items-center gap-3 group transition-all bg-white/80 backdrop-blur-sm border border-slate-100 p-1 pr-5 rounded-full hover:bg-white hover:shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-50 shadow-sm flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <User size={16} className="text-slate-700 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-primary-500 transition-colors leading-none mb-1">Đăng nhập</span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Tài khoản</span>
                    </div>
                  </Link>
                ) : (
                  <div className="relative group/user py-1 cursor-pointer">
                    <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-slate-100 p-1 pr-5 rounded-full hover:bg-white hover:shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold uppercase border border-white shadow-sm text-xs">
                        {user?.fullName?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 leading-none mb-1">{user?.fullName?.split(' ').pop()}</span>
                        <span className="text-[9px] text-gray-400 uppercase font-bold">Thành viên</span>
                      </div>
                    </div>
                    {/* Logout menu remains the same or slightly adjusted */}
                    <div className="absolute right-0 top-full w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 z-50 overflow-hidden transform translate-y-2 group-hover/user:translate-y-0">
                      <div className="p-2">
                        <Link to="/profile" className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-colors">
                          Hồ sơ cá nhân
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <Link to="/profile?tab=wishlist" className="flex items-center gap-3 group transition-all bg-white/80 backdrop-blur-sm border border-slate-100 p-1 pr-5 rounded-full hover:bg-white hover:shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-primary-50 shadow-sm flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Heart size={16} className="text-slate-700 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-primary-500 transition-colors leading-none mb-1">Bộ sưu tập</span>
                    <span className="text-[9px] text-gray-400 uppercase font-bold">Yêu thích</span>
                  </div>
                </Link>

                <Link to="/cart" className="relative flex items-center gap-3 group transition-all bg-white/80 backdrop-blur-sm border border-slate-100 p-1 pr-5 rounded-full hover:bg-white hover:shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-primary-50 shadow-sm flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <ShoppingCart size={16} className="text-slate-700 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-primary-500 transition-colors leading-none mb-1">Giỏ hàng</span>
                    <span className="text-[9px] text-gray-400 uppercase font-bold">{totalQuantity} sản phẩm</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Lighter solid shade */}
      <nav className="hidden lg:block bg-primary-100 border-t border-primary-200/20">
        <div className="container mx-auto px-4 max-w-[1536px]">
          <div className="flex items-center">
            {/* Mega Menu Category Trigger */}
            <div className="relative group/cat">
              <Link
                to="/category"
                className="flex items-center space-x-2 bg-primary-100 text-slate-900 px-8 py-2.5 font-bold text-sm uppercase tracking-wider rounded-t-xl hover:bg-primary-200 transition-all duration-300"
              >
                <Menu size={18} />
                <span>Danh mục sản phẩm</span>
                <ChevronDown size={14} className="ml-1 group-hover/cat:rotate-180 transition-transform duration-300" />
              </Link>

              {/* Dropdown Menu (Fly-out for Desktop) */}
              <div className="absolute top-full left-0 w-64 bg-white border border-gray-100 shadow-2xl rounded-b-2xl opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-300 z-[100] transform translate-y-2 group-hover/cat:translate-y-0 p-2 overflow-visible">
                <div className="py-2 space-y-1">
                  {menuStructure.length > 0 ? (
                    menuStructure.map((parent) => (
                      <div
                        key={parent.id}
                        className="relative"
                        onMouseEnter={() => window.innerWidth >= 1024 && setExpandedCategoryId(parent.id)}
                        onMouseLeave={() => window.innerWidth >= 1024 && setExpandedCategoryId(null)}
                      >
                        <div className={cn(
                          "flex items-center group/item rounded-xl transition-all border-l-4 border-transparent hover:border-primary-500",
                          expandedCategoryId === parent.id && window.innerWidth >= 1024 ? "bg-primary-50 border-primary-500" : "hover:bg-primary-50"
                        )}>
                          {/* Name Link - Triggers Navigation */}
                          <Link
                            to={parent.href}
                            className={cn(
                              "flex-1 px-4 py-3 text-sm font-bold transition-colors select-none",
                              expandedCategoryId === parent.id && window.innerWidth >= 1024 ? "text-primary-600" : "text-gray-700 group-hover/item:text-primary-600"
                            )}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {parent.name}
                          </Link>

                          {/* Chevron Icon - Indicator */}
                          {parent.children.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleCategory(parent.id);
                              }}
                              className={cn(
                                "p-2 mr-1 transition-all lg:block hidden",
                                expandedCategoryId === parent.id ? "rotate-[-90deg] text-primary-500" : "text-gray-400"
                              )}
                            >
                              <ChevronDown size={16} />
                            </button>
                          )}

                          {/* Mobile Toggle Button */}
                          {parent.children.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleCategory(parent.id);
                              }}
                              className={cn(
                                "p-2 mr-1 text-gray-400 lg:hidden",
                                expandedCategoryId === parent.id ? "rotate-180 text-primary-500" : ""
                              )}
                            >
                              <ChevronDown size={16} />
                            </button>
                          )}
                        </div>

                        {/* Fly-out Children (Desktop Only) */}
                        {parent.children.length > 0 && expandedCategoryId === parent.id && window.innerWidth >= 1024 && (
                          <div className="absolute left-[calc(100%+8px)] top-0 w-72 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 z-[110] animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className="px-4 py-2 mb-2 border-b border-gray-50">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">Khám phá {parent.name}</span>
                            </div>
                            <div className="space-y-1">
                              {parent.children.map((child: any) => (
                                <Link
                                  key={child.id}
                                  to={`/category/${child.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`}
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary-200"></span>
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                            {/* Invisible bridge to prevent menu from closing when moving mouse */}
                            <div className="absolute top-0 -left-4 w-4 h-full"></div>
                          </div>
                        )}

                        {/* Accordion Children (Mobile Only) */}
                        {parent.children.length > 0 && expandedCategoryId === parent.id && window.innerWidth < 1024 && (
                          <div className="mx-2 mb-2 py-1 bg-gray-50/50 rounded-xl border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                            {parent.children.map((child: any) => (
                              <Link
                                key={child.id}
                                to={`/category/${child.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`}
                                className="block px-8 py-2.5 text-xs font-bold text-gray-500 hover:text-primary-500 transition-all"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-sm text-gray-400 italic font-medium">Đang tải danh mục...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-12 ml-12">
              {mainNavLinks.map((link) => {
                const isActive = location.pathname + location.search === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={cn(
                      "text-sm font-bold uppercase tracking-widest transition-all relative py-2 group",
                      isActive ? "text-primary-500" : "text-gray-700 hover:text-primary-500"
                    )}
                  >
                    {link.name}
                    {/* Active Underline Effect */}
                    <span className={cn(
                      "absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transition-all transform origin-left",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}></span>
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
        <div className="p-4 space-y-4 h-full overflow-y-auto pb-20">
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
            {mainNavLinks.map((link) => {
              const isActive = location.pathname + location.search === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "text-lg font-bold border-b border-gray-100 pb-2 transition-colors",
                    isActive ? "text-primary-500 border-primary-100" : "text-gray-800"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-4 pb-2 text-xs font-black uppercase text-gray-400 tracking-widest border-t border-gray-100 mt-4">Danh mục sản phẩm</div>
            {menuStructure.map((parent) => (
              <div key={parent.id} className="space-y-1">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <Link
                    to={parent.href}
                    className="text-base font-bold text-gray-800 pl-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {parent.name}
                  </Link>
                  {parent.children.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleCategory(parent.id);
                      }}
                      className={cn(
                        "p-2 rounded-lg bg-gray-50 text-gray-400 transition-all",
                        expandedCategoryId === parent.id ? "bg-primary-50 text-primary-500 rotate-180" : ""
                      )}
                    >
                      <ChevronDown size={18} />
                    </button>
                  )}
                </div>

                {parent.children.length > 0 && expandedCategoryId === parent.id && (
                  <div className="bg-gray-50/50 rounded-xl py-1 mt-1">
                    {parent.children.map((child: any) => (
                      <Link
                        key={child.id}
                        to={`/category/${child.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`}
                        className="text-sm font-medium text-gray-600 py-3 pl-8 flex items-center gap-2 hover:text-primary-500 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-300"></span>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8 space-y-3">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsOrderLookupOpen(true);
              }}
              className="w-full py-4 bg-primary-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20"
            >
              <PhoneCall size={16} />
              <span>Tra cứu đơn hàng</span>
            </button>
            
            <Link
              to="/admin"
              className="block w-full text-center py-4 bg-slate-900 shadow-xl text-white font-black rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Giao diện Quản trị</span>
            </Link>
          </div>
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
