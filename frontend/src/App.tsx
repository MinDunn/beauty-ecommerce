import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Category from './pages/Category';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ReturnPolicy, ShippingPolicy, WarrantyPolicy } from './pages/policies/Policies';
import Contact from './pages/Contact';
import Home from './pages/Home';

import { Sidebar } from './components/admin/Sidebar';
import { Header } from './components/admin/Header';
import { Products } from './pages/Products';
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
        <Route
          path="/admin/*"
          element={isAdmin ? <AdminLayout logout={logout} /> : <Navigate to="/login" />}
        />

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

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/policy/return" element={<ReturnPolicy />} />
                <Route path="/policy/shipping" element={<ShippingPolicy />} />
                <Route path="/policy/warranty" element={<WarrantyPolicy />} />

                <Route path="/contact" element={<Contact />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;