import React from 'react'
import "../styling/loader.css"

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="loader"></div>
            <p>Loading document...</p>
        </div>
        )
}

export default Loader