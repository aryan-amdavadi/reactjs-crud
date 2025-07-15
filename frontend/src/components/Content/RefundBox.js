import React, { useState } from "react";
import axios from "axios";
import "./Refund.css";

export default function RefundBox({ amount, paymentIntentId, onRefundSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRefund = async () => {
    console.log(amount)

    try {
      const res = await axios.post("http://localhost:8081/create-refund-intent", {
        amount,
        payment_intent_id: paymentIntentId,
      });

      if (res.data.success) {
        onRefundSuccess(res.data.refund);
      } else {
        setError("Refund failed. Please try again.");
      }
    } catch (err) {
      console.error("Refund failed:", err);
      setError("An error occurred during refund.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="refund-box">
      <p className="refund-info">
        You’re about to refund <strong>₹{amount.toFixed(2)}</strong> to the customer.
      </p>

      {error && <p className="refund-error">{error}</p>}

      <button className="refund-btn" disabled={loading} onClick={handleRefund}>
        {loading ? "Processing..." : "Process Refund"}
      </button>
    </div>
  );
}
