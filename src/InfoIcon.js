import React, { useState } from 'react';
import './InfoIcon.css';

const InfoIcon = ({ text }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="info-icon-container"
      onClick={() => setShowModal(!showModal)}
    >
      <span className="info-icon">i</span>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <p>{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoIcon;
