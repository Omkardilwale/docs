import React, { useEffect, useState } from 'react'
import '../styling/navigator.css'
import { FaTachometerAlt,FaFileAlt } from 'react-icons/fa';

const NavigationBar = ({ searchQuery, handlePolicyNumberChange, handleSearch }) => {

    const [currentPage , setCurrentPage] = useState("Dashboard");
    const pages = [
        {page:"Dashboard" , icon:<FaTachometerAlt/>},
        // {page:"Policy Details" , icon:<FaFileAlt/>}
    ]

    const Navigate = (page)=>{
        setCurrentPage(page)
    }


    useEffect(() => {
        // console.log(searchQuery.searchQuery)
        // console.log(typeof (handlePolicyNumberChange))
    })

    return (
        <>
            <div className="search-section">
                <div className='s-s-placeholde-section'>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for a policy..."
                        value={searchQuery}
                        onChange={(e) => handlePolicyNumberChange(e.target.value)}
                    />
                    <button className="search-btn" onClick={() => { handleSearch(null) }}>
                        Search Policy
                    </button>

                </div>
                
                {/* <div className='navigator-section'>
                    {
                        pages.map((items)=>(
                            <p className={currentPage==items.page ?'highlighed':"non-highlted"} key={items.page} onClick={()=>{Navigate(items.page)}}>{items.icon}{items.page}</p>
                        ))
                    }
                </div> */}
                
            </div>
        </>
    )
}

export default NavigationBar