import React from 'react';
import '../styling/CustomTooltip.css'; // Create a CSS file for styling

const CustomTooltip = ({ content, visible, position }) => {
    if (!visible) return null;

    return (
        <div className="custom-tooltip" style={{ top: position.top, left: position.left }}>
            {content}
        </div>
    );
};

export default CustomTooltip; 