import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CheckoutPanel from "./CheckoutPanel";
// import { useNavigate } from "react-router-dom";
import CheckoutPage from "./SampleCheckOut";

function CartPanel({ open, onClose, onCartChange }) {
  // const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const [cartData, setCartData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const panelRef = useRef();
  useEffect(() => {
    if (userId) {
      const userObject = {
        user_id: userId,
      };
      axios
        .post("http://localhost:8081/carts", userObject)
        .then((res) => {
          setCartData(res.data);
        })
        .catch((err) => console.log(err));
    } else {
      const localCart = JSON.parse(localStorage.getItem("cart")) || {};
      setCartData(Object.values(localCart));
    }

    axios
      .get("http://localhost:8081/products")
      .then((res) => setProductData(res.data))
      .catch((err) => console.log(err));
  }, [open, userId]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, onClose]);

  const handleQuantity = (product_id, quantity) => {
    if (!userId) {
      let localCart = JSON.parse(localStorage.getItem("cart")) || {};
      if (localCart[product_id]) {
        localCart[product_id].quantity += quantity;
        if (localCart[product_id].quantity <= 0) {
          delete localCart[product_id];
        }
      }
      localStorage.setItem("cart", JSON.stringify(localCart));
      setCartData(Object.values(localCart));
      if (onCartChange) onCartChange();
      return;
    }
    const dataObject = {
      product_id: product_id,
      quantity: quantity,
      user_id: localStorage.getItem("user_id"),
    };
    axios
      .post("http://localhost:8081/api/quantity", dataObject)
      .then((responce) => {
        console.log("Responce :", responce.data);
        if (onCartChange) onCartChange();
      })
      .catch((error) => {
        console.log(error);
      });
    const userObject = {
      user_id: userId,
    };
    setTimeout(() => {
      axios
        .post("http://localhost:8081/carts", userObject)
        .then((res) => {
          setCartData(res.data);
        })
        .catch((err) => console.log(err));
    }, 1);
  };
  const totalPrice = cartData.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  const handleClearCart = () => {
    if (!userId) {
      // Guest user
      localStorage.removeItem("cart");
      setCartData([]);
      if (onCartChange) onCartChange();
    } else {
      // Logged-in user
      axios
        .delete("http://localhost:8081/api/clearcart", {
          data: { user_id: Number(userId) },
        })
        .then(() => {
          setCartData([]);
          if (onCartChange) onCartChange();
        })
        .catch((err) => console.log(err));
    }
  };
  const handleApplyCoupon = () => {
    const trimmedCode = couponCode.trim().toUpperCase();

    // Example: hardcoded coupon validation
    if (trimmedCode === "TAB10") {
      setDiscountPercent(10); // 10% discount
      setCouponError("");
    } else if (trimmedCode === "TAB20") {
      setDiscountPercent(20); // 20% discount
      setCouponError("");
    } else {
      setDiscountPercent(0);
      setCouponError("Invalid coupon code.");
    }
  };
  const discountedTotal = totalPrice - (totalPrice * discountPercent) / 100;

  return (
    <>
      {/* {
        <CheckoutPanel
          isOpen={checkOutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            onClose();
          }}
          cartItems={cartData}
          total={totalPrice}
        />
      } */}
      {checkOutOpen && <CheckoutPage
    cartItems={cartData}
    total={totalPrice}
    onBack={() => setCheckOutOpen(false)}
  />}
      {open && <div className="cart-overlay" />}
      <div
        className={`cart-panel ${open ? "open" : ""}`}
        style={{ display: open ? "flex" : "none" }}
        ref={panelRef}
      >
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="clear-cart-btn" onClick={handleClearCart}>
            🗑️ Clear Cart
          </button>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cart-body">
          {cartData.map((item) => (
            <div className="cart-item" key={item.product_id || item.id}>
              <div className="item-info">
                <h4>
                  {productData.find((data) => data.id === item.product_id)
                    ?.title || "Unknown Product"}
                </h4>
                <p>₹{item.price}</p>
              </div>
              <div className="quantity-controls">
                <button onClick={() => handleQuantity(item.product_id, -1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantity(item.product_id, 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="card-body" style={{ flex: "none" }}>
          {" "}
          <div
            className="coupon-section d-flex"
            style={{ flexDirection: "row" }}
          >
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              style={{ width: "100%" }}
              onChange={(e) => setCouponCode(e.target.value)}
              className="coupon-input"
            />
            <button className="apply-coupon-btn" onClick={handleApplyCoupon}>
              Apply
            </button>
          </div>
          {couponError && (
            <div className="coupon-error" style={{ marginLeft: "25px" }}>
              {couponError}
            </div>
          )}
          {discountPercent > 0 && (
            <div className="coupon-success" style={{marginLeft: "25px"}}>
              🎉 {discountPercent}% discount applied!
            </div>
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            {/* <strong>₹{totalPrice.toFixed(2)}</strong> */}
            {discountPercent > 0 ? (
              <>
                <span style={{ textDecoration: "line-through", color: "#999" }}>
                  ₹{totalPrice.toFixed(2)}
                </span>{" "}
                <strong style={{ color: "green" }}>
                  ₹{discountedTotal.toFixed(2)}
                </strong>
              </>
            ) : (
              <strong>₹{totalPrice.toFixed(2)}</strong>
            )}
          </div>
          <button
            className="checkout-btn"
            onClick={() => {
                setCheckOutOpen(true);
                onClose();
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default CartPanel;
