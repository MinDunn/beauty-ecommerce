import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary-600">BeautyStore</div>
        <nav className="hidden md:flex space-x-8">
          <a href="/" className="text-gray-700 hover:text-primary-600">Trang chủ</a>
          <a href="/products" className="text-gray-700 hover:text-primary-600">Sản phẩm</a>
          <a href="/about" className="text-gray-700 hover:text-primary-600">Giới thiệu</a>
        </nav>
        <div className="flex z-10 space-x-4">
            <button className="text-gray-600 hover:text-primary-600">Đăng nhập</button>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Giỏ hàng</button>

        </div>
      </div>
    </header>
  );
};

export default Header;
