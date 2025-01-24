import React from 'react';
import './CustomTooltip.css'; // Create a CSS file for styling

const CustomTooltip = ({ content, visible, position }) => {
    if (!visible) return null;

    return (
        <div className="custom-tooltip" style={{ top: position.top, left: position.left }} dangerouslySetInnerHTML={{ __html: content }} />
    );
};

export default CustomTooltip; 