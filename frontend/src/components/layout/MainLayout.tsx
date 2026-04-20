import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { ScrollToTop } from '../ui/ScrollToTop';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default MainLayout;
