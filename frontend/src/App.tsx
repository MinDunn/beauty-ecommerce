import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

import Home from './pages/Home';

function App() {
  return (
    <Router>
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
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
