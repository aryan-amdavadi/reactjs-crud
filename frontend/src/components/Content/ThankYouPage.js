import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Styles/ThankYouPage.css";
import AppNavbar from "./Navbar";
import axios from "axios";

export default function ThankYouPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state.orderData || [];
  const breakDown = location.state.breakdown || [];
  const [productData, setProductData] = useState([]);
  const [giftCardData, setGiftCardData] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:8081/products")
      .then((res) => setProductData(res.data))
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:8081/giftcard")
      .then((res) => setGiftCardData(res.data))
      .catch((err) => console.log(err));
  }, []);
  return (
    <>
      <AppNavbar />

      {/* Particle Background */}
      <div id="particles-background"></div>

      {/* Main Content */}
      <div className="thankyou-bg">
        <div className="thankyou-card">
          <h1 className="title-thankyou">Thank You</h1>
          <p className="subtitle">
            We appreciate your order with <strong>Tabster</strong>!<br />
            <span>You're amazing — here's what's next:</span>
          </p>
          <p className="delivery">
            Your order will arrive by <strong>Sunday, 27th of July</strong>
          </p>

          <button
            className="action-button"
            onClick={() => navigate("/history")}
          >
            View My Order
          </button>

          {/* Ultra Modern Order Layout */}
          <div className="ultra-order-container">
            <div className="ultra-order-card products-side">
              <h2 className="ultra-heading">🛍️ Your Items</h2>
              {orderData.map((item) => (
                <div className="ultra-item">
                  <div className="ultra-item-left">
                    <div className="ultra-title-row">
                      <span className="ultra-title">
                        {productData.find((data) => data.id === item.product_id)
                          ?.title ||
                          giftCardData.find(
                            (data) => data.id === item.giftcard_id
                          )?.code}
                      </span>
                      <span className="quantity-thankyou">
                        × {item.quantity}
                      </span>
                    </div>
                    <div className="ultra-sub">
                      <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                      {productData.find((data) => data.id === item.product_id)
                        ?.price ||
                        giftCardData.find(
                          (data) => data.id === item.giftcard_id
                        )?.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ultra-order-card breakdown-side">
              <h2 className="ultra-heading">📦 Summary</h2>
              <div className="ultra-row">
                <span>Subtotal</span>
                <span>₹ {breakDown.subTotal}</span>
              </div>
              <div className="ultra-row">
                <span>Discount</span>
                <span>- ₹{breakDown.discountAmount}</span>
              </div>
              <div className="ultra-row">
                <span>Shipping</span>
                <span>₹ {breakDown.shippingCost}</span>
              </div>
              <div className="ultra-row total">
                <span>Total</span>
                <span>₹ {breakDown.amountPaid}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
