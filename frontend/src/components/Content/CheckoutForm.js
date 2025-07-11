import React, { useState } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

export default function CheckoutForm({ clientSecret, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      if (result.paymentIntent.status === "succeeded") {
        onPaymentSuccess(result.paymentIntent);
      }
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#1e2b24] p-6 rounded-2xl shadow-lg space-y-4 w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-[#007d72] mb-2">
        Payment Details
      </h2>

      <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-[#26342e]">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#333",
                fontFamily: "Arial, sans-serif",
                "::placeholder": {
                  color: "#999",
                },
              },
              invalid: {
                color: "#e5424d",
              },
            },
          }}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="checkout-btn"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </motion.form>
  );
}
