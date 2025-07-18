// BuyGiftCardPage.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Styles/BuyGiftCardPage.css";
import giftCardImg from "../../../src/assets/Tabster_GiftCard.png";
import AppNavbar from "./Navbar";
import axios from "axios";
import Toast from "./Toast";

export default function BuyGiftCardPage() {
  const userId = localStorage.getItem("user_id");
  const [amount, setAmount] = useState();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loadData, setLoadData] = useState(0);
  const [openCart, setOpenCart] = useState(false);
  const [toastTheme, setToastTheme] = useState("success");

  const handlePurchase = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setToastMessage("Enter a valid gift card amount.");
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
    const code = generateDiscountCode()
    axios
      .post("http://localhost:8081/addgiftcard", {
        amount: numericAmount,
        user_id: userId,
        code: code,
      })
      .then((results) => {
        axios
          .post("http://localhost:8081/api/giftcardcart", {
            giftCard: { value: numericAmount, id:results.data.insertId },
            user_id: userId,
          })
          .then((res) => {
            if (res.data.items === "products") {
              setToastMessage("Clear The Cart Of Products First.");
              setToastTheme("danger");
              setShowToast(true);
            } else {
              setLoadData((prev) => prev + 1);
              setOpenCart(true);
            }
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  const generateDiscountCode = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  return (
    <>
      <AppNavbar
        loadData={loadData}
        setLoadData={setLoadData}
        openCart={openCart}
      />
      {showToast && (
        <Toast
          message={toastMessage}
          theme={toastTheme}
          onClose={() => setShowToast(false)}
        />
      )}
      <motion.div
        className="gift-card-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="gift-title">Tabster Gift Cards</h2>
        <div className="gift-card-content">
          <motion.img
            className="gift-image"
            src={giftCardImg}
            alt="Gift Card"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          />

          <motion.div
            className="gift-options"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <label className="gift-label">GIFT CARD AMOUNT</label>
            <div className="gift-card-input-box">
              <i className="fa-solid fa-indian-rupee-sign "></i>
              <input
                className="gift-amount-input no-spinner-input"
                style={{ background: "transparent", border: "none" }}
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <motion.button
              className="gift-buy-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePurchase}
            >
              BUY IT NOW
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
