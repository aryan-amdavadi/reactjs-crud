import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function CartPanel({ open, onClose, onCartChange }) {
  const userId = localStorage.getItem("user_id");
  const [cartData, setCartData] = useState([]);
  const [productData, setProductData] = useState([]);
  const panelRef = useRef();
  useEffect(() => {
    if (userId) {
      axios
        .get("http://localhost:8081/carts")
        .then((res) => setCartData(res.data))
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
    axios
      .get("http://localhost:8081/carts")
      .then((res) => {
        setCartData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const totalPrice = cartData.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  return (
    <>
      {open && <div className="cart-overlay" />}
      <div className={`cart-panel ${open ? "open" : ""}`} ref={panelRef}>
        <div className="cart-header">
          <h2>Your Cart</h2>
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
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <strong>₹{totalPrice.toFixed(2)}</strong>
          </div>
          <button className="checkout-btn">
            {userId ? "Proceed to Checkout" : "Login to Checkout"}
          </button>
        </div>
      </div>
    </>
  );
}

export default CartPanel;
