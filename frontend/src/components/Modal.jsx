import React from "react";
import "./css/Modal.css";

const Modal = ({
  show,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!show) {
    return null;
  }

  const iconMap = {
    success: "bi bi-check-circle-fill",
    error: "bi bi-x-circle-fill",
    warning: "bi bi-exclamation-triangle-fill",
    info: "bi bi-info-circle-fill",
  };

  return (
    <div className="standard-modal-overlay">
      <div className={`standard-modal standard-modal-${type}`}>
        <div className="standard-modal-icon">
          <i className={iconMap[type] || iconMap.info}></i>
        </div>

        <div className="standard-modal-content">
          <h3>{title}</h3>

          <p>{message}</p>
        </div>

        <div className="standard-modal-actions">
          {onConfirm && (
            <button
              type="button"
              className="standard-modal-btn standard-modal-btn-secondary"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className="standard-modal-btn standard-modal-btn-primary"
            onClick={onConfirm || onClose}
          >
            {onConfirm ? confirmText : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
