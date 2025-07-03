import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import axios from "axios";

export default function CheckoutPage() {
  const navigate = useNavigate();
  var userId = localStorage.getItem("user_id");
  const [showToast, setShowToast] = useState(false);
  const [productData, setProductData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cartData, setCartData] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountedTotal, setDiscountedTotal] = useState(0);

  // const [profileData,setProfileData] =useState([])
  const toggleAccordion = () => setIsOpen(!isOpen);
  const totalPrice = cartData.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  useEffect(() => {
    const userObject = {
      user_id: userId,
    };
    axios
      .get("http://localhost:8081/products")
      .then((res) => {
        setProductData(res.data);
      })
      .catch((err) => console.log(err));
    axios
      .post("http://localhost:8081/carts", userObject)
      .then((res) => {
        setCartData(res.data);
        setDiscountedTotal(totalPrice); // Set initial discountedTotal
      })
      .catch((err) => console.log(err));
    if (userId) {
      const dataObject = {
        user_id: userId,
      };
      axios
        .post("http://localhost:8081/postowner", dataObject)
        .then((res) => {
          setForm((f) => ({
            ...f,
            fullName: res.data.First_Name + " " + res.data.Last_Name,
          }));
          setForm((f) => ({ ...f, email: res.data.Email }));
          setForm((f) => ({ ...f, phone: res.data.Phone_No }));
          // setProfileData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [userId, totalPrice]);
  useEffect(() => {
    if (!appliedCoupon) setDiscountedTotal(totalPrice);
  }, [totalPrice, appliedCoupon]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send order data to backend here
    // console.log("Order submitted:", form, cartItems);
  };
  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let dataObject = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    axios
      .post("http://localhost:8081/login", dataObject)
      .then((res) => {
        localStorage.setItem("user_id", res.data.Emp_Id);
        localStorage.setItem("role", res.data.role);
        navigate("/checkout");
      })
      .catch((err) => {
        console.log(err);
      });

  };
  const applyCoupon = () => {
    if (coupon.toLowerCase() === "tabster10") {
      const discount = totalPrice * 0.1;
      setAppliedCoupon({ code: coupon, amount: discount });
      setDiscountedTotal(totalPrice - discount);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCoupon("");
    setDiscountedTotal(totalPrice);
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
            <form onSubmit={handleLogin} className="checkout-form">
              <div className="accordion-wrapper">
                <div className="accordion-header" onClick={toggleAccordion}>
                  <h3>
                    <i className="fa-solid fa-user"></i> Login{" "}
                    {!userId ? (
                      <i className="fa-solid fa-xmark"></i>
                    ) : (
                      <i className="fa-solid fa-check"></i>
                    )}
                  </h3>
                  <span className={`accordion-icon ${isOpen ? "rotate" : ""}`}>
                    &#9662;
                  </span>
                </div>
                <div className={`accordion-body ${isOpen ? "open" : ""}`}>
                  <div className="mb-3 ">
                    <label htmlFor="exampleFormControlInput1" className="title">
                      Email Address
                    </label>
                    <br />
                    <input
                      type="email"
                      className="input"
                      name="email"
                      onChange={handleChange}
                      value={form.email}
                      style={{ width: "100%" }}
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div style={{ display: userId ? "none" : "block" }}>
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
                        style={{ width: "100%" }}
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
                            marginTop: "15px",
                          }}
                          onClick={() => {
                            navigate("/login-signup");
                          }}
                        >
                          Forgot Password!
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="auth-submit">
                      log In
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <h2 className="section-title">Delivery Details</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <label htmlFor="exampleFormControlInput1" className="title">
                Full Name
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="input"
                required
              />
              <label htmlFor="exampleFormControlInput1" className="title">
                Email Address
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="input"
                type="email"
                required
              />
              <label htmlFor="exampleFormControlInput1" className="title">
                Phone Number
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="input"
                type="tel"
                required
              />
              <label htmlFor="exampleFormControlInput1" className="title">
                Shipping Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street Address"
                className="input"
                required
              />
              <div
                className="input-row"
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <label htmlFor="exampleFormControlInput1" className="title">
                    City
                  </label>
                  <br />
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="input half"
                    required
                  />
                </div>
                <div className="d-flex" style={{ flexDirection: "column" }}>
                  <label htmlFor="exampleFormControlInput1" className="title">
                    Postal Code
                  </label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="Postal Code"
                    className="input half"
                    required
                  />
                </div>
              </div>
              <label htmlFor="exampleFormControlInput1" className="title">
                Delivery Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional Notes (Optional)"
                className="input textarea"
              />
              <div className="d-flex" style={{ height: "60px" }}>
                <button type="submit" className="submit-btn">
                  Place Order
                </button>
                <button
                  className="back-btn"
                  onClick={() => {
                    navigate("/menu");
                  }}
                >
                  ← Back
                </button>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="summary-section">
            <h2 className="section-title">Order Summary</h2>
            <ul className="item-list">
              {cartData.map((item, i) => (
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
            {!appliedCoupon && (
              <div
                className="coupon-row"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  style={{
                    width: "18rem",
                    height: "3rem",
                  }}
                  className="input"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button
                  className="submit-btn"
                  style={{ height: "50px" }}
                  onClick={applyCoupon}
                >
                  Apply
                </button>
              </div>
            )}
            <br />
            <div className="summary-row">
              <div className="price-row">
                <span className="price-label ">Sub Total</span>
                <span
                  className="original-price"
                  style={{
                    textDecoration: appliedCoupon ? "line-through" : "none",
                    marginRight: appliedCoupon ? "24px" : "",
                  }}
                >
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <div
                className="summary-row d-flex price-row"
                style={{ justifyContent: "space-between" }}
              >
                <span className="price-label">
                  Discount {appliedCoupon?.code?.toUpperCase() || ""}
                </span>

                <div className="d-flex">
                  <span className="discount price-label">
                    – ₹{appliedCoupon?.amount?.toFixed(2) || "0"}
                  </span>

                  <button
                    style={{ display: appliedCoupon ? "block" : "none" }}
                    className="remove-coupon-btn"
                    onClick={removeCoupon}
                    label="remove"
                  >
                    ✖
                  </button>
                </div>
              </div>
              <div
                className="summary-row d-flex price-row"
                style={{ justifyContent: "space-between" }}
              >
                <span className="price-label">
                  Shipping
                  {/* {": " + appliedCoupon?.code?.toUpperCase() || ""} */}
                </span>
                <span
                  className="price-label"
                  style={{ marginRight: appliedCoupon ? "24px" : "" }}
                >
                  ₹0
                  {/* ₹{appliedCoupon?.amount?.toFixed(2)||"0"} */}
                </span>
              </div>

              <div className="summary-row total">
                <strong>Total Payable</strong>
                <strong>₹{discountedTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
