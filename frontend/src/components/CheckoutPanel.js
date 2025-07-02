import React, { useEffect, useState } from "react";
import axios from "axios";
import Toast from "./Toast";
import { useNavigate } from "react-router-dom";

const CheckoutPanel = ({ isOpen, onClose, cartItems = [], total = 0 }) => {
    const navigate = useNavigate()
  const [productData, setProductData] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [shippingAddress, setShippingAdress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/products")
      .then((res) => {
        setProductData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataObject = {
      shippingAddress: shippingAddress,
      deliveryNotes: deliveryNotes,
      paymentMethod: paymentMethod,
      cartItems: cartItems,
      total: total,
      user_id: Number(localStorage.getItem("user_id")),
    };
    axios
      .post("http://localhost:8081/api/addorder", dataObject)
      .then((responce) => {
        console.log("Responce :", responce.data);
        setShowToast(true);
      })
      .catch((error) => {
        console.log(error);
      });
    setPaymentMethod("");
    setDeliveryNotes("");
    setShippingAdress("");
    console.log(dataObject);
    document.getElementById("checkout-form").reset();
    setTimeout(()=>{
        navigate("/menu")
        onClose();
    },3500)
  };

  return (
    <>
      {showToast && (
        <Toast
          message="Order placed successfully!"
          onClose={() => setShowToast(false)}
        />
      )}
      {isOpen && (
        <>
          <div className="checkout-overlay" onClick={onClose} />
          <div className={`checkout-panel ${isOpen ? "open" : ""}`}>
            <div className="checkout-header">
              <h2>Checkout</h2>
              <button className="close-button" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="checkout-content">
              <div className="card">
                <h3>Order Summary</h3>
                <ul className="order-list">
                  {cartItems.map((item, index) => (
                    <li key={index} className="order-item">
                      <span>
                        {productData.find((data) => data.id === item.product_id)
                          ?.title || "Unknown Product"}{" "}
                        x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="total-line">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <form onSubmit={handleSubmit} id="checkout-form">
                <div className="card">
                  <h3>Billing Details</h3>
                  <div className="form-group">
                    <label>Shipping Address</label>
                    <textarea
                      rows="3"
                      value={shippingAddress}
                      onChange={(e) => setShippingAdress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Delivery Notes</label>
                    <textarea
                      rows="2"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                    />
                  </div>
                </div>
                <br />
                <div className="card">
                  <h3>Payment Method</h3>
                  <div className="payment-options">
                    {["Credit / Debit Card", "UPI", "Cash on Delivery"].map(
                      (method, index) => (
                        <label key={index}>
                          <input
                            type="radio"
                            name="payment"
                            value={method}
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required
                          />
                          {method}
                        </label>
                      )
                    )}
                  </div>
                </div>
                <br />
                <button type="submit" className="place-order-button">
                  Place Order
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CheckoutPanel;
