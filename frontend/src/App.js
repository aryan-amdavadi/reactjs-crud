import React from "react";
import NewsLayout from "./components/Admin/UserLayout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostLayout from "./components/Admin/PostLayout";
import AuthForm from "./components/login-signup/login";
import ResetPassword from "./components/login-signup/ResetPassword";
import ProductLayout from "./components/Admin/ProductLayout";
import Products from "./components/Content/Products";
import HomePage from "./components/Content/HomePage";
import CheckoutPage from "./components/Content/Checkout";
import ShippingLayout from "./components/Admin/ShippingLayout";
import ProfilePage from "./components/Content/Profile";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login-signup" element={<AuthForm />} />
          <Route path="/menu" element={<Products />} />
          <Route path="/users" element={<NewsLayout />} />
          <Route path="/posts" element={<PostLayout />} />
          <Route path="/products" element={<ProductLayout />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/shipping" element={<ShippingLayout />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;
