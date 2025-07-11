import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

export default function OrderHistoryPage() {
  const userId = localStorage.getItem("user_id");
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [discountData, setDiscountdata] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [productsName, setProductsName] = useState({});

  useEffect(() => {
    axios
      .post(`http://localhost:8081/api/orders`, { user_id: userId })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching orders:", err));
    axios
      .post(`http://localhost:8081/discountdata`, { user_id: userId })
      .then((res) => setDiscountdata(res.data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, [userId]);
  useEffect(() => {
    if (orders.length > 0) {
      const fetchDetails = async () => {
        try {
          const responses = await Promise.all(
            orders.map((order) =>
              axios.post(`http://localhost:8081/orderdata`, {
                order_id: order.id,
              })
            )
          );

          const details = {};
          let allProductIds = new Set();

          responses.forEach((res, idx) => {
            const orderId = orders[idx].id;
            details[orderId] = res.data;

            res.data.forEach((item) => {
              allProductIds.add(item.product_id);
            });
          });

          const productIdArray = Array.from(allProductIds);

          const productNameResponse = await axios.post(
            `http://localhost:8081/api/getproductsbyids`,
            {
              ids: productIdArray,
            }
          );

          const productNameMap = {};
          productNameResponse.data.forEach((item) => {
            productNameMap[item.id] = item.title;
          });

          setProductsName(productNameMap); // update once
          setOrderDetails(details);
        } catch (err) {
          console.error("Error fetching order details or product names:", err);
        }
      };

      fetchDetails();
    }
  }, [orders]);

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
              const discount = discountData.find(
                (d) => d.order_id === order.id
              );

              return (
                <motion.div
                  key={order.id}
                  className="order-card"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="bill-box"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="order-summary">
                      <h3>Order #{order.id}</h3>
                      <p>
                        <strong>Total Paid:</strong> ₹{order.amount_paid}
                      </p>
                      <button
                        className="view-details-btn"
                        onClick={() => toggleDetails(order.id)}
                      >
                        {expandedOrderId === order.id
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </div>

                    {expandedOrderId === order.id && (
                      <div className="order-details">
                        <div className="top-boxes">
                          <motion.div
                            className="box"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          >
                            <h4>Shipping Info</h4>
                            <p>
                              <strong>Name:</strong> {address.first_name}{" "}
                              {address.last_name}
                            </p>
                            <p>
                              <strong>Email:</strong> {address.email}
                            </p>
                            <p>
                              <strong>Phone:</strong> {address.phone}
                            </p>
                            <p>
                              <strong>Address:</strong> {address.address}
                            </p>
                            <p>
                              <strong>Postal Code:</strong> {address.post_code}
                            </p>
                            <p>
                              <strong>City:</strong> {address.city},{" "}
                              {address.state}
                            </p>
                          </motion.div>

                          <motion.div
                            className="box"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            <h4>Order Info</h4>
                            <p>
                              <strong>Order ID:</strong> {order.id}
                            </p>
                            <p>
                              <strong>Payment:</strong> {order.payment_method}
                            </p>
                            <p>
                              <strong>Shipping Method:</strong>{" "}
                              {order.shipping_method}
                            </p>
                            <p>
                              <strong>Delivery Notes:</strong>{" "}
                              {order.delivery_notes || "None"}
                            </p>
                            <p>
                              <strong>Discount Code:</strong>{" "}
                              {discount?.code || "N/A"}
                            </p>
                            <p>
                              <strong>Discount Amount:</strong> ₹
                              {discount?.amount || "0"}
                            </p>
                          </motion.div>
                        </div>

                        <div className="bill-box">
                          <h4>Billing Summary</h4>
                          <ul className="bill-items">
                            {orderDetails[order.id]?.map((item, index) => (
                              <li key={index}>
                                {productsName[item.product_id]} ×{" "}
                                {item.quantity}
                              </li>
                            ))}
                          </ul>

                          <div className="price-breakdown">
                            <div className="bill-row positive">
                              <span>Subtotal</span>
                              <span>+ ₹{order.product_price}</span>
                            </div>
                            <div className="bill-row positive">
                              <span>Shipping Cost</span>
                              <span>+ ₹{order.shipping_cost}</span>
                            </div>
                            <div className="bill-row discount">
                              <span>Discount</span>
                              <span>- ₹{discount?.amount || 0}</span>
                            </div>
                            <div className="bill-row total">
                              <span>Total Paid</span>
                              <span>₹{order.amount_paid}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}
