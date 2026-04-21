import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ReturnPolicy, ShippingPolicy, WarrantyPolicy } from './pages/policies/Policies';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import OrderSuccess from './pages/OrderSuccess';
import SearchResultPage from './pages/Search';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import About from './pages/About';
import Stores from './pages/Stores';
import Careers from './pages/Careers';
import BeautyGuide from './pages/BeautyGuide';
import Privacy from './pages/policies/Privacy';

import { Sidebar } from './components/admin/Sidebar';
import { Header as AdminHeader } from './components/admin/Header';
import { Products } from './pages/Product';
import { Orders } from './pages/Orders';
import { FeedbackPage } from './pages/Feedback';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { Categories } from './pages/admin/Categories';
import { Coupons } from './pages/admin/Coupons';
import { InventoryReceiptsPage } from './pages/admin/InventoryReceiptsPage';
import { InventoryAdjustmentsPage } from './pages/admin/InventoryAdjustmentsPage';
import { Activities } from './pages/Activities';
import { useAuth } from './hooks/useAuth';
import { VoucherWidget } from './components/checkout/VoucherWidget';
import ChatWidget from './components/chat/ChatWidget';
import { useState } from 'react';

function AdminLayout({ logout }: { logout: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex bg-[#020617] min-h-screen font-sans selection:bg-primary-500/30 overflow-x-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 md:pl-72">
        <AdminHeader logout={logout} onToggleMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
          <Routes>
            <Route path="" element={<AdminDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="orders" element={<Orders />} />
            <Route path="inventory-receipts" element={<InventoryReceiptsPage />} />
            <Route path="inventory-adjustments" element={<InventoryAdjustmentsPage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="activities" element={<Activities />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const { isAdmin, logout } = useAuth();

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={isAdmin ? <AdminLayout logout={logout} /> : <Navigate to="/login" />}
        />

        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResultPage />} />
                <Route path="/category" element={<Category />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Policy Routes */}
                <Route path="/policy/return" element={<ReturnPolicy />} />
                <Route path="/policy/shipping" element={<ShippingPolicy />} />
                <Route path="/policy/warranty" element={<WarrantyPolicy />} />
                <Route path="/policy/privacy" element={<Privacy />} />

                {/* Contact Route */}
                <Route path="/contact" element={<Contact />} />

                {/* About, Stores, Careers */}
                <Route path="/about" element={<About />} />
                <Route path="/stores" element={<Stores />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/beauty-guide" element={<BeautyGuide />} />

                {/* User Account Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/order-success" element={<OrderSuccess />} />

                {/* Catch all for public routes - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
      {!isAdmin && <VoucherWidget />}
      {!isAdmin && <ChatWidget />}
    </Router>
  );
}

export default App;