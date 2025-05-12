import React from "react";
import "./ViewDetails.css"; // Optional for styling

const ViewDetails = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Details</h2>
        <div className="details-box">
          {Object.entries(data).map(([key, value]) => (
            <div className="detail-item" key={key}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ViewDetails;
