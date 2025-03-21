import React, { useState, useEffect, useRef } from 'react';
import './InfoIcon.css';

const InfoIcon = ({ text }) => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);

  // Close modal when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showModal]);

  return (
    <div className="info-icon-container">
      <span className="info-icon" onClick={() => setShowModal(true)}>i</span>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
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
