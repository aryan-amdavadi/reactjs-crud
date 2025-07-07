import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

export default function OrderHistoryPage() {
  const userId = localStorage.getItem("user_id");
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    axios
      .post(`http://localhost:8081/api/orders`, { user_id: userId })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, [userId]);

  const toggleDetails = (id) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };
  return (
    <>
      <Navbar />
      <motion.div
        className="order-history-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="order-title">My Orders</h2>

        {orders.length === 0 ? (
          <p className="no-orders">You haven't placed any orders yet.</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => {
              const address = JSON.parse(order.shipping_address || "{}");

              return (
                <motion.div
                  key={order.id}
                  className="order-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="order-summary">
                    <h3>Order #{order.id}</h3>
                    <p><strong>Total Paid:</strong> ₹{order.amount_paid}</p>
                    <button
                      className="view-details-btn"
                      onClick={() => toggleDetails(order.id)}
                    >
                      {expandedOrderId === order.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="order-details">
                      <p><strong>Name:</strong> {address.first_name+ " " + address.last_name}</p>
                      <p><strong>Email:</strong> {address.email}</p>
                      <p><strong>Phone:</strong> {address.phone}</p>
                      <p><strong>Address:</strong> {address.address}</p>
                      <p><strong>Postal Code:</strong> {address.post_code}</p>
                      <p><strong>City:</strong> {address.city}, {address.state} - {address.post_code}</p>
                      <p><strong>Delivery Notes:</strong> {order.delivery_notes || "None"}</p>
                      <p><strong>Payment Method:</strong> {order.payment_method}</p>
                      <p><strong>Shipping Method:</strong> {order.shipping_method}</p>
                      <p><strong>Shipping Cost:</strong> ₹{order.shipping_cost}</p>
                      <p><strong>Subtotal:</strong> ₹{order.product_price}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}
