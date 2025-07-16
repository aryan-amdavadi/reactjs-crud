// BuyGiftCardPage.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./BuyGiftCardPage.css";
import giftCardImg from "../../../src/assets/Tabster_GiftCard.png";
import AppNavbar from "./Navbar";
import axios from "axios";
import Toast from "./Toast";

export default function BuyGiftCardPage() {
  const userId = localStorage.getItem("user_id");
  const [selectedCard, setSelectedCard] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loadData, setLoadData] = useState(0);
  const [openCart, setOpenCart] = useState(false);
  const [toastTheme, setToastTheme] = useState("success");
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const handleSelect = (data) => {
    setSelectedCard(data);
    setIsOpen(false);
  };

  const handlePurchase = () => {
    if (!selectedCard || !selectedCard.id) {
      alert("Please select a valid gift card.");
      return;
    }
    if(!userId){
      setToastMessage("Login To Continue");
      setToastTheme("danger");
      setShowToast(true);
      return;
    }
    axios
      .post("http://localhost:8081/api/giftcardcart", {
        giftCard: selectedCard,
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
  };
  useEffect(() => {
    axios
      .get("http://localhost:8081/giftcard")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
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
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />

          <motion.div
            className="gift-options"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <label className="gift-label">GIFT CARD</label>
            <div className="dropdown-box">
              <div
                className="dropdown-selected"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <div>
                  {selectedCard ? (
                    <>
                      <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                      {selectedCard.value}
                    </>
                  ) : (
                    "Select Amount"
                  )}
                </div>
                <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
              </div>
              {isOpen && (
                <ul className="dropdown-list">
                  {data.map((data, index) => (
                    <li
                      key={index}
                      className={`dropdown-item ${
                        data.enabled === 1 ? "" : "disabled"
                      }`}
                      onClick={() => {
                        if (data.enabled === 1) {
                          handleSelect(data);
                        }
                      }}
                    >
                      <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                      {data.value}
                    </li>
                  ))}
                </ul>
              )}
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
