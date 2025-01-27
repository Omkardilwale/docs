import React, { useState } from 'react';
import '../styling/toolbar.css';
import { BsWindowSplit } from "react-icons/bs";
import { LuAppWindow } from "react-icons/lu";

const ToolbarComponent = ({ onSplit, isSplitView }) => {
  const [highlightedButton, setHighlightedButton] = useState(null);

  const handleButtonClick = (button) => {
    setHighlightedButton(button);
    if (button === 'split') {
      onSplit(!isSplitView); // Pass the next state value
    }
  };

  return (
    <div className="toolbar">
      <button 
        onClick={() => handleButtonClick('split')} 
        className={isSplitView ? 'highlighted' : ''}
      >
        {isSplitView ? <LuAppWindow /> : <BsWindowSplit />}
      </button>
    </div>
  );
};

export default ToolbarComponent;