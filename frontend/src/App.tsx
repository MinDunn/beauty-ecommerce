import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

import { Sidebar } from './components/admin/Sidebar';
import { Header } from './components/admin/Header';
import { Products } from './pages/Product';
import { Orders } from './pages/Orders';
import { FeedbackPage } from './pages/Feedback';
import { useAuth } from './hooks/useAuth';

function AdminLayout({ logout }: { logout: () => void }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header logout={logout} />
        <div className="p-4">
          <Routes>
            <Route path="" element={<div>Bảng điều khiển</div>} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="feedback" element={<FeedbackPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAdmin, logout } = useAuth();

  return (
    <Router>
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
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Policy Routes */}
                <Route path="/policy/return" element={<ReturnPolicy />} />
                <Route path="/policy/shipping" element={<ShippingPolicy />} />
                <Route path="/policy/warranty" element={<WarrantyPolicy />} />

                {/* Contact Route */}
                <Route path="/contact" element={<Contact />} />

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
    </Router>
  );
}

export default App;