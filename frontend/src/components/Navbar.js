import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import CartPanel from "./Cart";

function AppNavbar({ loadData, setLoadData }) {
  const [logeedIn, setLoggedIn] = useState(
    localStorage.getItem("user_id") !== null
  );
  const [profiledata, setProfileData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);
  useEffect(() => {
    const dataObject = {
      user_id: localStorage.getItem("user_id"),
    };
    axios
      .post("http://localhost:8081/postowner", dataObject)
      .then((res) => {
        setProfileData(res.data);
      })
      .catch((err) => {
        // console.log(err);
      });
  }, []);
  return (
    <>
      <CartPanel
        open={showCart}
        onClose={() => setShowCart(false)}
        onCartChange={() => {
          setLoadData((prev) => prev + 1);
        }}
      />
      <nav className="navbar" style={{ zIndex: showCart ? -1 : 1 }}>
        <Link className="logo" to="/" style={{ textDecoration: "none" }}>
          Tabster
        </Link>
        <div
          style={{
            display: localStorage.getItem("role") === "admin" ? "flex" : "none",
          }}
        >
          <Link className="btn btn-light mx-2" to="/">
            Home
          </Link>
          <Link className="btn btn-light mx-2" to="/menu">
            Shopping
          </Link>
          <Link className="btn btn-light mx-2" to="/users">
            Users
          </Link>
          <Link className="btn btn-light mx-2" to="/products">
            Products
          </Link>
          <Link className="btn btn-light mx-2" to="/posts">
            Post
          </Link>
        </div>
        <div className="nav-actions">
          <button
            className="nav-btn"
            onClick={() => {
              setShowCart(true);
            }}
          >
            🛒 Cart
          </button>
          <Link
            className="nav-btn"
            to="/login-signup"
            style={{ display: logeedIn ? "none" : "block" }}
          >
            Sign In
          </Link>
          <div
            style={{ display: logeedIn ? "block" : "none" }}
            className="nav-btn profile-dropdown-wrapper"
            onClick={toggleDropdown}
            onMouseLeave={closeDropdown}
          >
            <i className="fa-solid fa-user"></i> Profile
            <div className={`profile-dropdown ${dropdownOpen ? "show" : ""}`}>
              <div className="profile-info">
                <strong>
                  {profiledata.First_Name + profiledata.Last_Name || "..."}
                </strong>
                <small>{profiledata.Email || "..."}</small>
                <small>{profiledata.Phone_No || "..."}</small>
              </div>
              <hr />
              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  setLoggedIn(false);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default AppNavbar;
