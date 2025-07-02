import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import axios from "axios";

export default function CheckoutPage({ cartItems, total, onBack }) {
  const userId = localStorage.getItem("user_id");
  const [showToast, setShowToast] = useState(false);
  const [productData, setProductData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toggleAccordion = () => setIsOpen(!isOpen);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });
  useEffect(() => {
    axios
      .get("http://localhost:8081/products")
      .then((res) => {
        setProductData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send order data to backend here
    console.log("Order submitted:", form, cartItems);
    navigate("/thank-you");
  };

  return (
    <>
      {showToast && (
        <Toast
          message="Order placed successfully!"
          onClose={() => setShowToast(false)}
        />
      )}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="checkout-page"
      >
        <div className="checkout-container">
          {/* Left: Form */}
          <div className="form-section">
            {userId && (
              <>
                <div className="accordion-wrapper">
                  <div className="accordion-header" onClick={toggleAccordion}>
                    <h3>Login</h3>
                    <span
                      className={`accordion-icon ${isOpen ? "rotate" : ""}`}
                    >
                      &#9662;
                    </span>
                  </div>
                  <div className={`accordion-body ${isOpen ? "open" : ""}`}>
                    <div className="mb-3 ">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="title"
                      >
                        Email Address
                      </label>
                      <br />
                      <input
                        type="email"
                        className="input"
                        name="email"
                        style={{width:"100%"}}
                        placeholder="Email Address"
                        required
                      />
                    </div>
                    <div style={{ margin: "2px", height: "68px" }}>
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="title"
                      >
                        Password
                      </label>
                      <br />
                      <input
                        type="password"
                        className="input"
                        id="Password"
                        style={{width:"100%"}}
                        name="password"
                        placeholder="Password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <div style={{ display: "flex", justifyContent: "end" }}>
                        <button
                          type="button"
                          className="btn btn-outline-danger no-focus"
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "red",
                            marginTop:"15px"
                          }}
                          //   onClick={() => {
                          //     setForgotPassOpen(true);
                          //   }}
                        >
                          Forgot Password!
                        </button>
                      </div>
                      <button type="submit" className="auth-submit">
                        log In
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            <h2 className="section-title">Delivery Details</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="input"
                required
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="input"
                type="email"
                required
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="input"
                type="tel"
                required
              />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street Address"
                className="input"
                required
              />
              <div className="input-row">
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="input half"
                  required
                />
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="Postal Code"
                  className="input half"
                  required
                />
              </div>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional Notes (Optional)"
                className="input textarea"
              />
              <button type="submit" className="submit-btn">
                Place Order
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="summary-section">
            <h2 className="section-title">Order Summary</h2>
            <ul className="item-list">
              {cartItems.map((item, i) => (
                <li key={i} className="item">
                  <span>
                    {productData.find((data) => data.id === item.product_id)
                      ?.title || "Unknown Product"}{" "}
                    × {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button onClick={onBack} className="back-btn">
              ← Back
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
