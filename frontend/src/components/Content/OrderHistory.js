import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const [orders, setOrders] = useState([]);

  const [showDropdown, setShowDropdown] = useState(false);

  const [editingOrder, setEditingOrder] = useState(null); // order object
  const [editedQuantities, setEditedQuantities] = useState({});

  const [activeOrder, setActiveOrder] = useState(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [discountData, setDiscountdata] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [productsName, setProductsName] = useState({});
  const openEditModal = (order) => {
    const initialQuantities = {};
    orderDetails[order.id]?.forEach((item) => {
      initialQuantities[item.product_id] = item.quantity;
    });
    navigate("/editorder", {
      state: {
        initialQuantities: initialQuantities,
        orderDetails: order,
        discountData: discountData.find((d) => d.order_id === order.id),
      },
    });
  };

  const closeEditModal = () => {
    setEditingOrder(null);
    setEditedQuantities({});
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setEditedQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const handleRemoveProduct = (productId) => {
    setEditedQuantities((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const handleAddProduct = (productId) => {
    if (!productId) return;
    setEditedQuantities((prev) => ({
      ...prev,
      [productId]: 1,
    }));
  };
  const handleDeleteContent = (orderDetails) => {
    setActiveOrder(orderDetails);
  };
  const handleCancel = () => {
    console.log(activeOrder);
  };

  const saveEditedOrder = async () => {
    console.log("Order Id", editingOrder.id);
    console.log("Content", editedQuantities);
    try {
      await axios.post(`http://localhost:8081/api/updateorderitems`, {
        order_id: editingOrder.id,
        items: editedQuantities,
      });

      const res = await axios.post(`http://localhost:8081/orderdata`, {
        order_id: editingOrder.id,
      });

      setOrderDetails((prev) => ({
        ...prev,
        [editingOrder.id]: res.data,
      }));

      closeEditModal();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

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

          setProductsName(productNameMap);
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
      {modalDeleteOpen && (
        <Modal show={true}>
          <Modal.Header>
            <div>Cancel Order.</div>
            <div>
              <button
                type="button"
                to="/"
                onClick={() => {
                  setModalDeleteOpen(false);
                }}
                className="btn btn-light"
              >
                X
              </button>
            </div>
          </Modal.Header>
          <Modal.Body>Remember It Cannot Be Backuped.</Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              to="/"
              onClick={handleCancel}
              className="btn btn-outline-danger"
            >
              Cancel Order
            </button>
          </Modal.Footer>
        </Modal>
      )}
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
                      <div className="d-flex">
                        <button
                          className="delete-btn"
                          style={{
                            display:
                              expandedOrderId === order.id ? "none" : "block",
                            marginRight: "25px",
                          }}
                          onClick={() => {
                            handleDeleteContent(order);
                            setModalDeleteOpen(true);
                          }}
                        >
                          Cancel Order
                        </button>
                        <button
                          className="view-details-btn"
                          style={{
                            display:
                              expandedOrderId === order.id ? "block" : "none",
                            marginRight: "25px",
                          }}
                          onClick={() => openEditModal(order)}
                        >
                          Edit Order
                        </button>

                        <button
                          className="view-details-btn"
                          onClick={() => toggleDetails(order.id)}
                        >
                          {expandedOrderId === order.id
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                      </div>
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
      {editingOrder && (
        <div className="modal-overlay">
          <motion.div
            className="modal-content enhanced-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Edit Order #{editingOrder.id}</h3>

            <ul className="edit-list">
              {Object.entries(editedQuantities).map(
                ([productId, quantity], index) => (
                  <>
                    <li key={index} className="edit-item">
                      <button
                        className="remove-product"
                        onClick={() => handleRemoveProduct(productId)}
                      >
                        ×
                      </button>
                      <span>{productsName[productId]}</span>
                      <div className="edit-controls">
                        <div className="edit-controls">
                          <button
                            className="quantity-btn"
                            onClick={() =>
                              handleQuantityChange(
                                productId,
                                (quantity || 1) - 1
                              )
                            }
                            disabled={quantity <= 1}
                          >
                            −
                          </button>
                          <span className="quantity-display">{quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() =>
                              handleQuantityChange(
                                productId,
                                (quantity || 1) + 1
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  </>
                )
              )}
            </ul>

            <div className="custom-dropdown">
              <div
                className="dropdown-toggle"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                + Add Product
              </div>
              {showDropdown && (
                <ul className="dropdown-options">
                  {Object.entries(productsName)
                    .filter(([id]) => !(id in editedQuantities))
                    .map(([id, title]) => (
                      <li
                        key={id}
                        className="dropdown-option"
                        onClick={() => {
                          handleAddProduct(id);
                          setShowDropdown(false);
                        }}
                      >
                        {title}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="modal-buttons">
              <button className="save-btn" onClick={saveEditedOrder}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
