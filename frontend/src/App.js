import React from "react";
import NewsLayout from "./components/NewsLayout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostLayout from "./components/PostLayout";
import Demo from "./components/login-signup/login";
import ResetPassword from "./components/login-signup/ResetPassword";
import ProductLayout from "./components/ProductLayout";
import Products from "./components/Products";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Demo />} />
          <Route path="/users" element={<NewsLayout />} />
          <Route path="/posts" element={<PostLayout />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/products" element={<ProductLayout />} />
          <Route path="/productsview" element={<Products />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;
