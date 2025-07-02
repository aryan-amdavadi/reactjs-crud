import React, { useEffect } from "react";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500); // Auto close
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-container">
      <div className="toast-success">
        <span>✔</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Toast;
