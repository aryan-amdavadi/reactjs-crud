import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Styles/EditOrder.css";
import axios from "axios";
import Toast from "./Toast";
import PaymentBox from "./PaymentBox";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import RefundBox from "./RefundBox";

export default function EditOrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  ///////////////////////////////////////////////////////////////////

  const order = location.state?.orderDetails || {};
  const [data, setData] = useState([]);
  const [shippingData, setShippingData] = useState([]);
  const shipping_address = JSON.parse(order.shipping_address);
  ///////////////////////////////////////////////////////////////////

  const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  );
  const [paymentIntentId, setPaymentIntentId] = useState();

  const [clientSecret, setClientSecret] = useState("");
  const [showPaymentAccordion, setShowPaymentAccordion] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const [showStripeAccordion,setShowStripeAccordion] = useState(false)
  const [showRefundAccordion, setShowRefundAccordion] = useState(false);
  ///////////////////////////////////////////////////////////////////

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastTheme, setToastTheme] = useState("success");
  ///////////////////////////////////////////////////////////////////

  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingMethod, setShippingMethod] = useState(
    order.shipping_method || ""
  );
  const [quantities, setQuantities] = useState(
    location.state?.initialQuantities || {}
  );
  const [editNotes, setEditNotes] = useState(order.notes || "");

  ///////////////////////////////////////////////////////////////////

  const amountPaid = order.amount_paid || 0;
  const discountData = location.state?.discountData || [];
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingFee, setShippingFee] = useState(order.shipping_cost);
  ///////////////////////////////////////////////////////////////////

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  ///////////////////////////////////////////////////////////////////

  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const productDropdownRef = useRef(null);

  ///////////////////////////////////////////////////////////////////

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, value),
    }));
  };
  ///////////////////////////////////////////////////////////////////

  const filteredProducts = data.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !quantities[p.id]
  );
  ///////////////////////////////////////////////////////////////////

  const removeProduct = (productId) => {
    const newQuantities = { ...quantities };
    delete newQuantities[productId];
    setQuantities(newQuantities);
  };
  ///////////////////////////////////////////////////////////////////

  const validatecoupon = useCallback(() => {
    if (data.length === 0) return;

    const updatedItems = Object.entries(quantities).map(
      ([productId, quantity]) => {
        const product = data.find((p) => p.id === parseInt(productId));
        return {
          product_id: parseInt(productId),
          quantity,
          price: product?.price || 0,
          user_id: order.user_id,
        };
      }
    );

    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    axios
      .post("http://localhost:8081/api/validatecoupon", {
        code: discountData.code,
        user_id: localStorage.getItem("user_id"),
        total: newTotal,
        cartData: updatedItems,
      })
      .then((res) => {
        const data = res.data;
        if (discountData.code === undefined) {
          setDiscountedTotal(newTotal);
          return;
        }
        if (!data.valid) {
          setToastMessage(data.message || "Invalid or expired coupon");
          setToastTheme("danger");
          setShowToast(true);
          setAppliedCoupon(null);
          setDiscountedTotal(newTotal);
          return;
        }

        const discountAmount =
          data.type === "percent"
            ? (newTotal * data.value) / 100
            : Math.min(data.value, newTotal);

        setAppliedCoupon({
          code: discountData.code,
          amount: discountAmount,
        });

        setDiscountedTotal(newTotal - discountAmount);
      })
      .catch((err) => {
        console.log(err);
        setToastMessage("Something went wrong");
        setToastTheme("danger");
        setShowToast(true);
      });
  }, [data, quantities, order.user_id, discountData.code]);
  ///////////////////////////////////////////////////////////////////

  const updatedProductPrice = Object.entries(quantities).reduce(
    (sum, [productId, qty]) => {
      const product = data.find((p) => p.id === parseInt(productId));
      const price = product?.price || 0;
      return sum + qty * price;
    },
    0
  );
  ///////////////////////////////////////////////////////////////////

  const updateOrder = async (type) => {
    const items = Object.entries(quantities).reduce((obj, [id, qty]) => {
      obj[id] = qty;
      return obj;
    }, {});
    const dataObject = {
      order_id: order.id,
      items,
      shipping_method: shippingMethod,
      shipping_cost: shippingFee,
      product_price: updatedProductPrice,
      amount_paid: discountedTotal + shippingFee,
      discount_code: appliedCoupon?.code || null,
      discountedTotal: discountedTotal || 0,
      amountPaid: amountPaid || 0,
      discount_amount: appliedCoupon?.amount || 0,
      notes: editNotes,
      payment_intent_id: paymentIntentId || null,
      type: type,
    };

    try {
      axios.post("http://localhost:8081/api/updateorder", dataObject);
      setToastMessage("Order updated successfully!");
      setToastTheme("success");
      setShowToast(true);
      setTimeout(() => {
        navigate("/history");
      }, 3500);
    } catch (error) {
      setToastMessage("Failed to update order.");
      setToastTheme("danger");
      setShowToast(true);
    }
  };

  ///////////////////////////////////////////////////////////////////

  useEffect(() => {
    axios
      .get("http://localhost:8081/products")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));

    axios
      .post("http://localhost:8081/timeframe", {
        city: shipping_address.city,
        post_code: Number(shipping_address.post_code),
      })
      .then((res) => {
        const methodNames = res.data.map((item) => item.name);
        setShippingOptions(methodNames);
        setShippingData(res.data);
      })
      .catch((err) => {});
  }, [shipping_address.city, shipping_address.post_code]);
  ///////////////////////////////////////////////////////////////////

  useEffect(() => {
    const delta = discountedTotal + shippingFee - amountPaid;

    if (delta > 0) {
      setShowPaymentAccordion(true);
      setShowRefundAccordion(false);
    } else if (delta < 0) {
      setShowRefundAccordion(true);
      setShowPaymentAccordion(false);
    } else {
      setShowPaymentAccordion(false);
      setShowRefundAccordion(false);
    }
  }, [discountedTotal, shippingFee, amountPaid]);

  ///////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!appliedCoupon) {
      setDiscountedTotal(updatedProductPrice);
    }
  }, [updatedProductPrice, appliedCoupon]);
  ///////////////////////////////////////////////////////////////////

  useEffect(() => {
    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }

      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target)
      ) {
        setProductDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  ///////////////////////////////////////////////////////////////////

  useEffect(() => {
    axios
      .post("http://localhost:8081/api/getintentid", {
        order_id: order.id,
      })
      .then((res) => {
        if (res.data && res.data[0]?.payment_id) {
          setPaymentIntentId(res.data[0].payment_id);
        }
      })

      .catch((err) => console.error("Stripe error", err));
  }, [order.id, showRefundAccordion]);
  ///////////////////////////////////////////////////////////////////

  useEffect(() => {
    for (let i = 0; i < shippingData.length; i++) {
      if (shippingData[i].name === shippingMethod) {
        if (updatedProductPrice >= shippingData[i].shipping_threshold) {
          setShippingFee(0);
        } else {
          setShippingFee(shippingData[i].shipping_cost);
        }
      }
    }
  }, [shippingData, shippingMethod, updatedProductPrice]);
  ///////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (data.length > 0) {
      validatecoupon();
    }
  }, [quantities, data.length, validatecoupon]);
  ///////////////////////////////////////////////////////////////////
  useEffect(() => {
    const delta = Number(discountedTotal + shippingFee - amountPaid);
    if (delta > 0 && !clientSecret) {
      axios
        .post("http://localhost:8081/create-payment-intent", {
          amount: Math.round(delta * 100),
        })
        .then((res) => {
          setClientSecret(res.data.clientSecret);
        })
        .catch((err) => console.error("Stripe error", err));
    }
  }, [amountPaid, clientSecret, discountedTotal, shippingFee]);

  ///////////////////////////////////////////////////////////////////
  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          theme={toastTheme}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="edit-order-container">
        <div className="d-flex">
          <button
            className="btn"
            style={{ height: "fit-content", marginRight: "10px" }}
            onClick={() => {
              navigate("/history");
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="page-title">Edit Order</h2>
        </div>
        <div className="edit-order-grid">
          <div className="left-column">
            <div className="box" ref={productDropdownRef}>
              <label className="label">Add Product</label>
              <div className="browse-row">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setProductDropdownOpen(true)}
                />
                <button
                  className="browse-btn"
                  onClick={() => setProductDropdownOpen((prev) => !prev)}
                >
                  Browse
                </button>
              </div>

              {productDropdownOpen && (
                <div className="dropdown-list">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="dropdown-item"
                        onClick={() => {
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: 1,
                          }));
                          setProductDropdownOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        {product.title} – ₹{product.price}
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-item disabled">
                      No matching products
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="box">
              <label className="label">Products *</label>
              {Object.entries(quantities).map(([productId, qty]) => {
                const product = data.find((p) => p.id === parseInt(productId));
                return (
                  <div key={productId} className="product-box">
                    <div className="product-info">
                      <div className="product-name">
                        {product?.title || `Product #${productId}`}
                      </div>
                      ₹{product?.price} per unit
                    </div>

                    <input
                      type="number"
                      min="1"
                      value={qty}
                      className="qty-input"
                      onChange={(e) => {
                        handleQuantityChange(productId, Number(e.target.value));
                      }}
                    />

                    <div className="product-total">
                      <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                      {(product?.price * qty || 0).toFixed(2)}
                    </div>

                    <button
                      className="order-remove-btn"
                      onClick={() => removeProduct(productId)}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="box" ref={dropdownRef}>
              <label className="label">Shipping Method</label>
              <div
                className={`dropdown-header ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <span>{shippingMethod || "Select a shipping method"}</span>
                <span className="arrow">{dropdownOpen ? "▲" : "▼"}</span>
              </div>

              {dropdownOpen && (
                <div className="dropdown-list" style={{ zIndex: "9999" }}>
                  {shippingOptions.map((method) => (
                    <div
                      style={{ zIndex: "9999" }}
                      key={method}
                      className={`dropdown-item ${
                        shippingMethod === method ? "selected" : ""
                      }`}
                      onClick={() => {
                        setShippingMethod(method);
                        setDropdownOpen(false);
                      }}
                    >
                      {method}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="box">
              <label className="label">Payment Breakdown</label>

              <div className="breakdown-row">
                <span>Product Total</span>
                <span>₹{updatedProductPrice.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="breakdown-row">
                  <span>Discount</span>
                  <span className="red-text">
                    − ₹{appliedCoupon.amount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="breakdown-row">
                <span>Shipping Charges</span>
                <span>₹{shippingFee.toFixed(2)}</span>
              </div>

              <hr className="summary-divider" />

              <div className="breakdown-row total">
                <span>Paid By Customer.</span>
                <span>₹{amountPaid.toFixed(2)}</span>
              </div>
            </div>

            <div className="box">
              <label className="label">Summary</label>
              <textarea
                className="order-notes-input"
                placeholder="Write why you're editing this order..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Right */}
          <div className="right-column">
            <div className="summary-box">
              <div className="order-summary-row">
                <span>Updated total</span>
                <span>
                  <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                  {(discountedTotal + shippingFee).toFixed(2)}
                </span>
              </div>
              <hr className="summary-divider" />

              <div className="order-summary-row">
                <span>Paid by customer</span>
                <span>
                  <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                  {amountPaid.toFixed(2)}
                </span>
              </div>

              <hr className="summary-divider" />

              <div className="order-summary-row">
                <span>
                  Amount to{" "}
                  {discountedTotal + shippingFee - amountPaid >= 0
                    ? "Collect"
                    : "Refund"}
                </span>
                <span className="green-text">
                  <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                  {discountedTotal + shippingFee - amountPaid > 0
                    ? (discountedTotal + shippingFee - amountPaid).toFixed(2)
                    : (discountedTotal + shippingFee - amountPaid).toFixed(2) *
                      -1}
                </span>
              </div>
              <button
                className="update-btn"
                disabled={
                  Number(discountedTotal + shippingFee - amountPaid) === 0 &&
                  !clientSecret
                }
                onClick={() => {
                  setShowStripeAccordion(true)
                  const delta = discountedTotal + shippingFee - amountPaid;
                  setShowAccordion(true);
                  if (delta > 0) {
                    setShowPaymentAccordion(true);
                    setShowRefundAccordion(false);
                  } else if (delta < 0) {
                    setShowRefundAccordion(true);
                    setShowPaymentAccordion(false);
                  } else {
                    setShowRefundAccordion(false);
                    setShowPaymentAccordion(false);
                  }
                }}
              >
                Update Order
              </button>

              <div
                className="accordion-wrapper"
                style={{
                  marginTop: "30px",
                  display:showStripeAccordion?"block":"none"
                }}
              >
                <div
                  className="accordion-header"
                  onClick={() => setShowAccordion(!showAccordion)}
                >
                  <h3>
                    <i className="fa-solid fa-credit-card"></i> Payment
                  </h3>
                  <span
                    className={`accordion-icon ${
                      showAccordion ? "rotate" : ""
                    }`}
                  >
                    &#9662;
                  </span>
                </div>
                {showAccordion && (
                  <>
                    {showPaymentAccordion && (
                      <div className="accordion-body open">
                        {!clientSecret ? (
                          <div
                            className="spinner-border text-primary d-flex"
                            role="status"
                            style={{ justifyContent: "center" }}
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                        ) : (
                          <Elements stripe={stripePromise}>
                            <PaymentBox
                              width="200px"
                              amount={(
                                discountedTotal +
                                shippingFee -
                                amountPaid
                              ).toFixed(2)}
                              clientSecret={clientSecret}
                              onPaymentSuccess={(intent) => {
                                setPaymentIntentId(intent.id);
                                updateOrder("Payment");
                              }}
                            />
                          </Elements>
                        )}
                      </div>
                    )}
                    {showRefundAccordion && (
                      <div className="accordion-body open">
                        {!paymentIntentId ? (
                          <div
                            className="spinner-border text-primary d-flex"
                            role="status"
                            style={{ justifyContent: "center" }}
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                        ) : (
                          <RefundBox
                            amount={Math.abs(
                              discountedTotal + shippingFee - amountPaid
                            )}
                            paymentIntentId={paymentIntentId}
                            onRefundSuccess={(refund) => {
                              updateOrder("Refund");
                            }}
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
