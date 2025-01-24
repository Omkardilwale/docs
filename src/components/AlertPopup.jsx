import React from 'react'
import '../styling/alertpopup.css'

const AlertPopup = ({close,title,msg}) => {
  return (
    <div className="popup-overlay">
    <div className="popup-container">
      <div className="popup-header">
        <h2>{title}</h2>
      </div>
      <div className="popup-body">
        <p>{msg}</p>
      </div>
      <div className="popup-footer">
        <button className="close-btn" onClick={close}>Close</button>
      </div>
    </div>
  </div>
  )
}

export default AlertPopup