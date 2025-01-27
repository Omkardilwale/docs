import React, { useState } from 'react';
import '../styling/toolbar.css';

const ToolbarComponent = ({ onSplit }) => {
  const [highlightedButton, setHighlightedButton] = useState(null);

  const handleButtonClick = (button) => {
    setHighlightedButton(button);
  };

  return (
    <div className="toolbar">
      <button 
        onClick={() => { handleButtonClick('split'); onSplit(); }} 
        className={highlightedButton === 'split' ? 'highlighted' : ''}
      >
        <span className="icon">🪟</span> {/* Example icon, replace with actual icons */}
        Split Horizontally
      </button>
      <button 
        onClick={() => handleButtonClick('refresh')} 
        className={highlightedButton === 'refresh' ? 'highlighted' : ''}
      >
        <span className="icon">🔄</span> {/* Example icon */}
        Refresh
      </button>
      {/* Add more toolbar buttons here if needed */}
    </div>
  );
};

export default ToolbarComponent;