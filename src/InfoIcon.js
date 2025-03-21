import React, { useState } from 'react';
import './InfoIcon.css';

const InfoIcon = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="info-icon-container"
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <span className="info-icon">i</span>
      {showTooltip && <div className="tooltip">{text}</div>}
    </div>
  );
};

export default InfoIcon;
