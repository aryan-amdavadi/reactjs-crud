import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CartPanel({ open, onClose, onCartChange }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const [cartData, setCartData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [giftCardData, setGiftCardData] = useState([]);
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

    axios
      .get("http://localhost:8081/giftcard")
      .then((res) => setGiftCardData(res.data))
      .catch((err) => console.log(err));
  }, [open, userId]);
  // const handleRemoveCard = (item) => {
  //   axios
  //     .delete("http://localhost:8081/api/deletegiftcart", {
  //       data: { id: Number(item.id) },
  //     })
  //     .then(() => {
  //       if (onCartChange) onCartChange();
  //       axios
  //         .post("http://localhost:8081/carts", { user_id: userId })
  //         .then((res) => {
  //           setCartData(res.data);
  //         })
  //         .catch((err) => console.log(err));
  //     })
  //     .catch((err) => console.log(err));
  // };
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

  const handleQuantity = (product_id, card_id, quantity) => {
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
    if (product_id) {
      const dataObject = {
        product_id: product_id,
        quantity: quantity,
        user_id: userId,
      };
      axios
        .post("http://localhost:8081/api/productquantity", dataObject)
        .then((responce) => {
          console.log("Responce :", responce.data);
          if (onCartChange) onCartChange();
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if(card_id){
      const dataObject = {
        card_id: card_id,
        quantity: quantity,
        user_id: userId,
      };
      axios
        .post("http://localhost:8081/api/cardquantity", dataObject)
        .then((responce) => {
          console.log("Responce :", responce.data);
          if (onCartChange) onCartChange();
        })
        .catch((error) => {
          console.log(error);
        });
    }
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
  const totalPrice = cartData?.reduce((total, item) => {
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

  return (
    <>
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
          {cartData.map((item, i) => (
            <div className="cart-item" key={i}>
              <div className="item-info">
                <h4>
                  {productData.find((data) => data.id === item.product_id)
                    ?.title ||
                    giftCardData.find((data) => data.id === item.giftcard_id)
                      ?.code}
                </h4>
                <p>₹{item.price}</p>
              </div>
              <div className="quantity-controls">
                <button
                  onClick={() =>
                    handleQuantity(
                      item.product_id || null,
                      item.giftcard_id || null,
                      -1
                    )
                  }
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantity(
                      item.product_id || null,
                      item.giftcard_id || null,
                      1
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div
            className="cart-total"
            style={{ flexDirection: "column-reverse" }}
          >
            <strong>₹{totalPrice.toFixed(2)}</strong>
          </div>
          <button
            className="checkout-btn"
            onClick={() => {
              navigate("/checkout");
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
