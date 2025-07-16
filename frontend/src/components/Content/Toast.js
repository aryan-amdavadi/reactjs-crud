import React, { useEffect } from "react";

const Toast = ({ message, onClose, theme }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500); // Auto close
    return () => clearTimeout(timer);
  }, [onClose]);
  const toastClass = theme === "danger" ? "toast-danger" : "toast-success";
  return (
    <div className="toast-container">
      <div className={toastClass}>
        <p style={{margin:"0"}}>{message}</p>
      </div>
    </div>
  );
};

export default Toast;
