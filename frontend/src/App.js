import React from "react";
import NewsLayout from "./components/NewsLayout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PostLayout from "./components/PostLayout";
import AuthForm from "./components/login-signup/login";
import ResetPassword from "./components/login-signup/ResetPassword";
import ProductLayout from "./components/ProductLayout";
import Products from "./components/Products";
import HomePage from "./components/HomePage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login-signup" element={<AuthForm />} />
          <Route path="/users" element={<NewsLayout />} />
          <Route path="/posts" element={<PostLayout />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/products" element={<ProductLayout />} />
          <Route path="/menu" element={<Products />} />
          <Route path="/" element={<HomePage />}/>
        </Routes>
      </Router>
    </>
  );
}
export default App;
