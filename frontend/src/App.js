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
import OrderHistoryPage from "./components/Content/OrderHistory";
import DiscountLayout from "./components/Admin/DiscountLayout"
import DiscountAdd from "./components/Admin/DiscountAdd"
import EditOrderPage from "./components/Content/EditOrder";
import GiftLayout from "./components/Admin/GiftLayout";
import BuyGiftCardPage from "./components/Content/GiftCard";
import ThankYouPage from "./components/Content/ThankYouPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/login-signup" element={<AuthForm />} />
          <Route path="/menu" element={<Products />} />
          <Route path="/users" element={<NewsLayout />} />
          <Route path="/posts" element={<PostLayout />} />
          <Route path="/products" element={<ProductLayout />} />
          <Route path="/gift-card" element={<GiftLayout />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/shipping" element={<ShippingLayout />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/history" element={<OrderHistoryPage />}/>
          <Route path="/discount" element={<DiscountLayout />}/>
          <Route path="/adddiscount" element={<DiscountAdd />}/>
          <Route path="/giftCards" element={<BuyGiftCardPage />}/>
          <Route path="/editorder" element={<EditOrderPage />}/>
        </Routes>
      </Router>
    </>
  );
}
export default App;
