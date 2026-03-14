import React from 'react';
import Header from './components/layout/Header';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Chào mừng đến với</span>
              <span className="block text-primary-600">Beauty Store</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Nơi mang đến cho chụy em những sản phẩm làm đẹp tốt nhất từ khắp nơi trên thế giới.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a href="#products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10">
                  Mua sắm ngay
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white text-center py-6">
        <p>&copy; 2026 Beauty Store. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
