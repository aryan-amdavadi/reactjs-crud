import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import axios from "axios";
import Navbar from "./Navbar";
import { loadStripe } from "@stripe/stripe-js";
import PaymentBox from "./PaymentBox";
import { Elements } from "@stripe/react-stripe-js";

export default function CheckoutPage() {
  const navigate = useNavigate();
  var userId = localStorage.getItem("user_id");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showTimeFrame, setShowTimeFrame] = useState(false);
  const [options, setOptions] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingThreshold, setShippingThreshold] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastTheme, setToastTheme] = useState("success");
  const [productData, setProductData] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [cartData, setCartData] = useState([]);
  const [giftCardData, setGiftCardData] = useState([])
  const [paymentDone, setPaymentDone] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [giftValue, setGiftValue] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [giftCode, setGiftCode] = useState("");
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    post_code: "",
    notes: "",
  });
  const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  );
  
  const [showPayment, setShowPayment] = useState(false);
  const handleSelect = (option) => {
    setSelected(option.name);
    setShippingFee(option.shipping_cost);
    setShippingThreshold(option.shipping_threshold);
    setOpen(false);
  };

  const toggleAccordion = (section) => {
    setActiveAccordion((prev) => (prev === section ? null : section));
  };
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
      .get("http://localhost:8081/giftcard")
      .then((res) => setGiftCardData(res.data))
      .catch((err) => console.log(err));
    axios
      .post("http://localhost:8081/carts", userObject)
      .then((res) => {
        setCartData(res.data);
        setDiscountedTotal(totalPrice);
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
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [userId, totalPrice]);
  useEffect(() => {
    if (!appliedCoupon) setDiscountedTotal(totalPrice);
  }, [totalPrice, appliedCoupon]);

  const getFinalTotal = React.useCallback(() => {
    if (paymentDone) return 0.0;
    if (shippingThreshold > totalPrice) return discountedTotal + shippingFee;
    return discountedTotal;
  }, [
    paymentDone,
    shippingThreshold,
    totalPrice,
    discountedTotal,
    shippingFee,
  ]);
  const handleValidateGiftCard = async () => {
    try {
      const res = await axios.post("http://localhost:8081/api/addcredits", {
        code: giftCode,
        user_id: localStorage.getItem("user_id"),
      });
      setGiftValue(res.data.value);
      setToastMessage("Gift Card Applied!");
      setToastTheme("success");
      setShowToast(true);
    } catch (err) {
      setToastMessage("Error");
      setToastTheme("danger");
      setShowToast(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };
      if (e.target.name === "city" || e.target.name === "post_code") {
        setShowTimeFrame(false);
        if (updatedForm.city !== "" && updatedForm.post_code !== "") {
          axios
            .post("http://localhost:8081/timeframe", {
              city: updatedForm.city,
              post_code: Number(updatedForm.post_code),
            })
            .then((res) => {
              setOptions(res.data);
              setShowTimeFrame(true);
            })
            .catch((err) => {});
        }
      }
      return updatedForm;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  useEffect(() => {
    if (showPayment && !clientSecret) {
      axios
        .post("http://localhost:8081/create-payment-intent", {
          amount: Math.round(getFinalTotal() * 100),
        })
        .then((res) => {
          setClientSecret(res.data.clientSecret);
        })
        .catch((err) => console.error("Stripe error", err));
    }
  }, [showPayment, clientSecret, getFinalTotal]);
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
    if (!coupon.trim()) return;
    axios
      .post("http://localhost:8081/api/validatecoupon", {
        code: coupon,
        user_id: userId,
        total: totalPrice,
        cartData: cartData,
      })
      .then((res) => {
        const data = res.data;

        if (!data.valid) {
          setToastMessage(data.message || "Invalid or expired coupon");
          setToastTheme("danger");
          setShowToast(true);
          return;
        }

        const discountAmount =
          data.type === "percent"
            ? (totalPrice * data.value) / 100
            : Math.min(data.value, totalPrice);

        setAppliedCoupon({
          code: coupon,
          amount: discountAmount,
        });

        setDiscountedTotal(totalPrice - discountAmount);

        setToastMessage("Coupon Applied Successfully");
        setToastTheme("success");
        setShowToast(true);
      })
      .catch((err) => {
        console.log(err);
        setToastMessage("Something went wrong");
        setToastTheme("danger");
        setShowToast(true);
      });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCoupon("");
    setDiscountedTotal(totalPrice);
  };

  return (
    <>
      <Navbar color="#bbcfe4" />
      {showToast && (
        <Toast
          message={toastMessage}
          theme={toastTheme}
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
            <form onSubmit={handleLogin} className="checkout-form" id="login">
              <div className="accordion-wrapper">
                <div
                  className="accordion-header"
                  onClick={() => toggleAccordion("login")}
                >
                  <h3>
                    <i className="fa-solid fa-user"></i> Login{" "}
                    {!userId ? (
                      <i className="fa-solid fa-xmark"></i>
                    ) : (
                      <i className="fa-solid fa-check"></i>
                    )}
                  </h3>
                  <span
                    className={`accordion-icon ${
                      activeAccordion === "login" ? "rotate" : ""
                    }`}
                  >
                    &#9662;
                  </span>
                </div>
                <div
                  className={`accordion-body ${
                    activeAccordion === "login" ? "open" : ""
                  }`}
                >
                  <div className="mb-3 ">
                    <label  className="title">
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
                      Log In
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <div>
              <form
                onSubmit={handleSubmit}
                className="checkout-form"
                id="checkoutDetails"
              >
                <h2 className="section-title" style={{display:cartData[0]?.product_id?"block":"none"}}>Delivery Details</h2>
                <div className="accordion-wrapper" style={{display:cartData[0]?.product_id?"block":"none"}}>
                  <div
                    className="accordion-header"
                    onClick={() => toggleAccordion("shipping")}
                  >
                    <h3>
                      <i className="fa-solid fa-truck"></i> Shipping Info
                    </h3>
                    <span
                      className={`accordion-icon ${
                        activeAccordion === "" ? "rotate" : ""
                      }`}
                    >
                      &#9662;
                    </span>
                  </div>
                  <div
                    className={`accordion-body ${
                      activeAccordion === "shipping" ? "open" : ""
                    }`}
                  >
                    <label className="title">Full Name</label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="input"
                      required
                    />
                    <label className="title">Email Address</label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="input"
                      type="email"
                      required
                    />
                    <label className="title">Phone Number</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="input"
                      type="tel"
                      required
                    />
                    <div
                      className="input-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <div
                        className="d-flex col-6"
                        style={{ flexDirection: "column", paddingLeft: 0 }}
                      >
                        <label className="title">City</label>
                        <input
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="City"
                          className="input half"
                          required
                        />
                      </div>
                      <div
                        className="d-flex col-6"
                        style={{ flexDirection: "column", paddingLeft: 0 }}
                      >
                        <label className="title">Postal Code</label>
                        <input
                          name="post_code"
                          value={form.post_code}
                          onChange={handleChange}
                          placeholder="Postal Code"
                          className="input half"
                          required
                        />
                      </div>
                    </div>
                    <label className="title">Shipping Address</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street Address"
                      className="input"
                      required
                    />
                  </div>
                </div>

                {showTimeFrame && (
                  <div className="tabster-dropdown">
                    <label className="dropdown-label title">
                      Delivery Timeframe
                    </label>
                    <div
                      className={`dropdown-header ${open ? "open" : ""}`}
                      onClick={() => setOpen((prev) => !prev)}
                      style={{ marginBottom: "20px" }}
                    >
                      {selected || "Choose..."}
                      <span className="arrow">{open ? "▲" : "▼"}</span>
                    </div>
                    {open && (
                      <ul className="dropdown-list">
                        {options.map((option, index) => (
                          <li
                            key={index}
                            className={`dropdown-item ${
                              selected === option.name ? "selected" : ""
                            }`}
                            onClick={() => handleSelect(option)}
                          >
                            {option.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <div style={{display:cartData[0]?.product_id?"block":"none"}}>
                  <label className="title">
                    Delivery Notes
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional Notes (Optional)"
                    className="input textarea"
                  />
                </div>
                <div
                  style={{
                    height: "60px",
                    display: showPayment ? "none" : "flex",
                  }}
                >
                  <button type="submit" className="submit-btn" onClick={()=>{
                    if(cartData[0]?.product_id){
                      return
                    }else{
                      setShowPayment(true)
                    }
                  }}>
                    {paymentDone ? "Place Order" : "Procced To Pay"}
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

              <div
                className="accordion-wrapper"
                style={{ display: showPayment ? "block" : "none" }}
              >
                <div
                  className="accordion-header"
                  onClick={() => toggleAccordion("payment")}
                >
                  <h3>
                    <i className="fa-solid fa-credit-card"></i> Payment
                  </h3>
                  <span
                    className={`accordion-icon ${
                      activeAccordion === "payment" ? "rotate" : ""
                    }`}
                  >
                    &#9662;
                  </span>
                </div>
                <div
                  className={`accordion-body ${
                    activeAccordion === "payment" ? "open" : ""
                  }`}
                >
                  {showPayment ? (
                    <>
                      <h1>Payment</h1>
                      {!clientSecret ? (
                        <p>Loading payment info...</p>
                      ) : (
                        <Elements stripe={stripePromise}>
                          <PaymentBox
                            amount={getFinalTotal().toFixed(2)}
                            clientSecret={clientSecret}
                            width="660px"
                            onPaymentSuccess={(intent) => {
                              if(!cartData[0]?.product_id){
                                setToastMessage("Payment Completed");
                                setToastTheme("success");
                                setShowToast(true);
                                return;
                              }
                              if (!selected && showTimeFrame) {
                                setToastMessage("Select Timeframe");
                                setToastTheme("danger");
                                setShowToast(true);
                                return;
                              }
                              if (!userId) {
                                setToastMessage("Login To Continue");
                                setToastTheme("danger");
                                setShowToast(true);
                                return;
                              }
                              if (getFinalTotal() !== 0) {
                                setActiveAccordion("payment");
                              }
                              const { notes, fullName, ...userData } = form;
                              const fullname_part = form.fullName.split(" ", 2);
                              const First_Name = fullname_part[0];
                              const Last_Name = fullname_part[1];
                              userData.first_name = First_Name;
                              userData.last_name = Last_Name;
                              const dataObject = {
                                user_id: userId,
                                user_details: JSON.stringify(userData),
                                time_frame: selected,
                                shipping_cost:
                                  shippingThreshold > totalPrice
                                    ? Number(shippingFee.toFixed(2))
                                    : 0.0,
                                orderData: cartData,
                                notes: form.notes,
                                discount_code: coupon,
                                discount_amount: totalPrice - discountedTotal,
                                amount_paid: getFinalTotal().toFixed(2),
                                product_price: totalPrice.toFixed(2),
                              };
                              axios
                                .post(
                                  "http://localhost:8081/api/addorder",
                                  dataObject
                                )
                                .then((res) => {
                                  console.log(res.data);
                                  const paymentIntentId = intent?.id;
                                  if (paymentIntentId) {
                                    axios.post(
                                      "http://localhost:8081/api/save-payment-intent",
                                      {
                                        order_id: res.data.order_id,
                                        user_id: userId,
                                        payment_intent_id: paymentIntentId,
                                        amount_paid: getFinalTotal().toFixed(2),
                                        refund_amount: null,
                                      }
                                    );
                                  }
                                  setPaymentDone(true);
                                  setShowPayment(false);
                                  setToastMessage("Order Placed..");
                                  setToastTheme("success");
                                  setShowToast(true);

                                  setTimeout(() => {
                                    navigate("/menu");
                                  }, 3500);
                                })
                                .catch((err) => {});
                            }}
                          />
                        </Elements>
                      )}
                    </>
                  ) : (
                    "Fill The Details To Pay.."
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="summary-section">
            <h2 className="section-title">Order Summary</h2>
            <ul className="item-list">
              {cartData.map((item, i) => (
                <li key={i} className="item">
                  <span>
                    {productData.find((data) => data.id === item.product_id)
                      ?.title || giftCardData.find((data) => data.id === item.giftcard_id)?.code}{" "}
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
                  onChange={(e) => {
                    setCoupon(e.target.value);
                  }}
                />
                <button
                  className="submit-btn"
                  style={{ height: "50px" , width:"10rem"}}
                  onClick={applyCoupon}
                >
                  Apply Discount
                </button>
              </div>
            )}
            {/* <div
              className="coupon-row"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                style={{
                  width: "18rem",
                  height: "3rem",
                }}
                className="input"
                placeholder="Gift Card Code"
              />
              <button
                className="submit-btn"
                style={{ height: "50px", width:"10rem" }}
                onClick={handleValidateGiftCard}
              >
                Apply Gift Card
              </button>
            </div> */}
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
                    – ₹{appliedCoupon?.amount?.toFixed(2) || "0.00"}
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
                className="summary-row price-row"
                style={{ justifyContent: "space-between" ,
                  display:giftValue>0?"flex":"none"
                }}
              >
                <span className="price-label">
                  Gift Card {giftCode?.code?.toUpperCase() || ""}
                </span>

                <div className="d-flex">
                  <span className="discount price-label">
                    – ₹{giftValue.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
              <div
                className="summary-row d-flex price-row"
                style={{ justifyContent: "space-between" }}
              >
                <span className="price-label">Shipping</span>
                <span
                  className="price-label"
                  style={{ marginRight: appliedCoupon ? "24px" : "" }}
                >
                  ₹
                  {shippingThreshold > totalPrice
                    ? shippingFee.toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="summary-row total">
                <strong>Total Payable</strong>
                <strong>₹{getFinalTotal().toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
