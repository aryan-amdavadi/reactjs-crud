import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./Styles/GiftCardRedeem.css";

export default function GiftCardRedeem() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const userId = localStorage.getItem("user_id");

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setStatus("loading");

    await axios.post(
      "http://localhost:8081/api/addcredits",
      {
        code: code,
        user_id: userId,
      }
        .then(() => {
          setStatus("success");
          setCode("");
        })
        .catch((err) => {
          setStatus("error");
        })
    );
    setTimeout(() => setStatus(null), 3000);
  };
  useEffect(() => {
    axios.post(
      "http://localhost:8081/logs",
      { user_id: userId }
        .then((res) => {
          setHistory(res.data);
        })
        .catch((error) => {
          console.log(error);
        })
    );
  }, [userId]);


  
  return (
    <div className="blur-redeem-page">
      {/* Redeem Section */}
      <motion.div
        className="blur-redeem-box"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: -20 }}
      >
        <h2 className="blur-title">🔷 Redeem Gift Card</h2>
        <div className="blur-input-row">
          <input
            placeholder="Enter your code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={16}
          />
          <motion.button
            className="blur-btn"
            whileTap={{ scale: 0.96 }}
            onClick={handleRedeem}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Checking…" : "Redeem"}
          </motion.button>
        </div>

        <AnimatePresence>
          {status === "success" && (
            <motion.div
              className="blur-toast success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
            >
              ✅ Code Redeemed Successfully!
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              className="blur-toast error"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
            >
              ❌ Invalid or expired code.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Separate History Section */}
      <motion.div
        className="blur-history-box"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>🕓 Redemption History</h3>
        {history.length === 0 ? (
          <p className="no-history">No gift cards redeemed yet.</p>
        ) : (
          history.map((entry, index) => (
            <div className="history-item" key={index}>
              <div className="history-left">
                <div className="history-code">{entry.code}</div>
                <div className="history-date">
                  {new Date(entry.redeemed_at).toLocaleString()}
                </div>
              </div>
              <div className="history-credit">+ ₹{entry.value}</div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
