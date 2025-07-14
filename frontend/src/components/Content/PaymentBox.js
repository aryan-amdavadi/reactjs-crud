import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1e2b24",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      "::placeholder": {
        color: "#888",
      },
    },
    invalid: {
      color: "#e5424d",
    },
  },
};

export default function PaymentBox({ amount, clientSecret, onPaymentSuccess, width }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  if (!stripe || !elements || !clientSecret) {
    setLoading(false);
    return;
  }

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: elements.getElement(CardNumberElement),
    },
  });

  if (result.error) {
    setError(result.error.message);
    setLoading(false);
  } else {
    if (result.paymentIntent.status === "succeeded") {
      onPaymentSuccess?.(result.paymentIntent);
    }
    setLoading(false);
  }
};


  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: "#ffffff",
        width: width,
        borderRadius: "20px",
        maxWidth: "1000px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#007d72",
          marginBottom: "24px",
        }}
      >
        Pay ₹{amount}
      </h2>

      {/* Card Number */}
      <label style={labelStyle}>
        <i className="fa-regular fa-credit-card" style={iconStyle}></i>
        Card Number
      </label>
      <div style={inputWrapperStyle}>
        <CardNumberElement options={ELEMENT_OPTIONS} />
      </div>

      {/* Expiry & CVC */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>
            <i className="fa-regular fa-calendar" style={iconStyle}></i>
            Expiry
          </label>
          <div style={inputWrapperStyle}>
            <CardExpiryElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>
            <i className="fa-solid fa-lock" style={iconStyle}></i>
            CVC
          </label>
          <div style={inputWrapperStyle}>
            <CardCvcElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p
          style={{
            color: "#e5424d",
            fontSize: "14px",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!stripe || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          marginTop: "24px",
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: "linear-gradient(135deg, #00c9a7, #007d72)",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
          transition: "all 0.3s",
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </motion.button>
    </motion.form>
  );
}

const labelStyle = {
  display: "flex",
  alignItems: "center",
  fontWeight: "600",
  fontSize: "14px",
  color: "#444",
  marginBottom: "6px",
};

const iconStyle = {
  marginRight: "8px",
  color: "#007d72",
};

const inputWrapperStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  backgroundColor: "#f9f9f9",
  marginBottom:"15px"
};
