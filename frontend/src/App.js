import React from "react";
import NewsLayout from "./components/NewsLayout";
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';
import PostLayout from "./components/PostLayout";
import Demo from "./components/login-signup/login";

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Demo />}></Route>
        <Route path="/users" element={<NewsLayout />}></Route>
        <Route path="/posts" element={<PostLayout />}></Route>
      </Routes>
    </Router>
    </>
  );
}
export default App;
