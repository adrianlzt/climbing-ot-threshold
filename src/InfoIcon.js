import React, { useState, useEffect, useRef } from 'react';
import './InfoIcon.css';

const InfoIcon = ({ text }) => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const iconRef = useRef(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  // Position the modal next to the icon
  useEffect(() => {
    if (showModal && iconRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Position to the right of the icon if there's enough space
      // Otherwise position to the left
      const left = iconRect.right + 10 + 300 < viewportWidth 
        ? iconRect.right + 10 
        : Math.max(10, iconRect.left - 310);
      
      // Position vertically centered with the icon
      const top = Math.max(10, iconRect.top - 100);
      
      setModalPosition({ top, left });
    }
  }, [showModal]);

  // Close modal when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && 
          iconRef.current && !iconRef.current.contains(event.target)) {
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
      <span 
        className="info-icon" 
        onClick={() => setShowModal(true)}
        ref={iconRef}
      >
        i
      </span>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
            style={{
              position: 'fixed',
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              transform: 'none',
              margin: 0
            }}
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
