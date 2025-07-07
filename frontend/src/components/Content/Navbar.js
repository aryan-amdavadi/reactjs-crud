import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import CartPanel from "./Cart";

function AppNavbar({ loadData, setLoadData,color}) {
  const userId = localStorage.getItem("user_id");
  const [quantity, setQuantity] = useState([]);
  const navigate = useNavigate();
  const [logeedIn, setLoggedIn] = useState(userId !== null);
  useEffect(() => {
    if (userId) {
      const userObject = {
        user_id: userId,
      };
      axios
        .post("http://localhost:8081/carts", userObject)
        .then((res) => {
          const totalQuantity = Object.values(res.data).reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          setQuantity(totalQuantity);
        })
        .catch((err) => console.log(err));
    } else {
      const localCart = JSON.parse(localStorage.getItem("cart")) || {};
      const totalQuantity = Object.values(Object.values(localCart)).reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setQuantity(totalQuantity);
    }
  }, [userId, loadData]);
  const [profiledata, setProfileData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);
  useEffect(() => {
    if (userId !== null) {
      const dataObject = {
        user_id: userId,
      };
      axios
        .post("http://localhost:8081/postowner", dataObject)
        .then((res) => {
          setProfileData(res.data);
        })
        .catch((err) => {
          // console.log(err);
        });
    }
  }, [userId,loadData]);
  return (
    <>
      <CartPanel
        open={showCart}
        onClose={() => setShowCart(false)}
        onCartChange={() => {
          setLoadData((prev) => prev + 1);
        }}
      />
      <nav className="navbar" style={{ zIndex: showCart ? -1 : 1 , background:color}}>
        <Link className="logo" to="/" style={{ textDecoration: "none", color:color?"#296b2a":""}}>
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
          <Link className="btn btn-light mx-2" to="/shipping">
            Shipping
          </Link>
          <Link className="btn btn-light mx-2" to="/discount">
            Discounts
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
          {quantity > 0 && <span className="cart-badge themed">{quantity}</span>}
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
                <strong>{profiledata.Email || "..."}</strong>
                <strong>{profiledata.Phone_No || "..."}</strong>
              </div>
              <hr />
              <button
                className="logout-btn"
                onClick={() => {
                  navigate("/history");
                }}
              >
                Orders
              </button>
              <button
                className="logout-btn"
                onClick={() => {
                  navigate("/profile");
                }}
              >
                Profile
              </button>
              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  setLoggedIn(false);
                  navigate("/");
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
