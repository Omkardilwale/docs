import React, { useEffect, useRef, useState } from "react";
import "../styling/documentViewer.css";
import Frame from 'react-frame-component'
import AlertPopup from "@/components/AlertPopup";
import { formatDDMMYYHHMMSS, getDocNameColor } from "@/utils/utils";
import { fetchDocuments, fetchDocumentsByCatagory, getDocUrl } from "@/utils/api";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getDocumentIcon } from "@/utils/reactIcons";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import { LuCalendarArrowUp , LuCalendarArrowDown } from "react-icons/lu";
import { FaRectangleList } from "react-icons/fa6";
import { AiFillCloseSquare } from "react-icons/ai";
import { MdSummarize } from "react-icons/md";
import { HiDocument } from "react-icons/hi2";
import NavigationBar from "@/components/NavigationBar";
import TiffViewer from "@/components/TiffViewer";
import PdfViewer from "@/components/PdfViewer";
import {documentContentTypeStyle} from '../styling/inlineCSS'

export default function Page() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docUrls, setDocUrl] = useState([])
  const [selectedCatagory, setSelectedCatagory] = useState("")
  const [showPopup, setShowPopup] = useState(false);
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(15);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [docName , setDocName] = useState(null)
  const [isAscending , setIsDescending] = useState(true)
  const [contentType , setContentType] = useState(null)
  const router = useRouter();



  const handleSearch = async (policyNumFromUrl) => {
    setDocUrl([])
    setSelectedDocId(null)
    setDocuments([]); // C436797835
    const policyNumber = policyNumFromUrl?policyNumFromUrl:searchQuery
    sessionStorage.setItem("proposalNo",policyNumber)
    if(policyNumber.length==0){
      setShowPopup(true)
      return 
    }
    setLoading(true);

    try {
      const data = await fetchDocuments(policyNumber);
      const sortedDocs = [...data.documents].sort((a,b)=>{
        const dateA = new Date(a.metaData.updatedAt)
        const dateB = new Date(b.metaData.updatedAt)
        return dateB - dateA;
      })
      setDocuments(sortedDocs || []);
      if (data._status.code == 1 || data.documents.length == 0) {
        setShowPopup(true)
      }
      setFilteredDocs([])
      console.log(sortedDocs, "sorted");
    } catch (e) {
      console.error("Error fetching documents:", e);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const manageUrls=(newUrl)=>{
    setDocUrl((prevUrls)=>{
      // let updatedUrls = [newUrl,...prevUrls]
      // updatedUrls = [...new Set(updatedUrls)]
      // return updatedUrls.slice(0,2)
      if(prevUrls.length===0){
        return[newUrl]
      }else{
        return [prevUrls[0],newUrl]
      }
    })
  }
  
  const handleDocumentClick = async (doc) => {
    const docId = doc.docId
    const docName = doc.metaData.docName
    const bucketId = doc.bucketId
    const contentType = doc.metaData.contentType
    setDocName(docName)
    setLoading(true);
    if (selectedDocId === docId) {
      setSelectedDocId(docId);
      setContentType(contentType)
      setLoading(false); // Stop loader
    } else {
      setSelectedDocId(docId);
      setContentType(contentType)
      try {
        const data = await getDocUrl(docId,bucketId);
        console.log(data.url, "dsssata");
        // setDocUrl([...docUrl,data.url])
        manageUrls(data.url)
      } catch (e) {
        console.error("Error fetching documents:", e);
      } finally {
        setLoading(false); // Stop loader
      }
    }
  };


  
  const handleCtagoryChange = async (event) => {
    setLoading(true); // Start loader
    setSelectedCatagory(event.target.value)
    console.log(event.target.value)
    const docCode = event.target.value
    try {
      const data = await fetchDocumentsByCatagory(searchQuery, docCode)
      console.log("data", data.documents)
      setFilteredDocs(data.documents);
      setDocUrl([])
      setSelectedDocId(null)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false); // Stop loader
    }
  }

  const closePopup = () => {
    setShowPopup(false)
  }

  const HandleLeftMouseDown = () => {
    setIsDraggingLeft(true);
  }

  const HandleRightMouseDown = () => {
    setIsDraggingRight(true)
  }

  const HandleMouseMove = (e) => {
    if (isDraggingLeft) {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 10 && newWidth < 50 && newWidth + rightWidth < 90) {
        setLeftWidth(newWidth);
        setLeftCollapsed(false)
      }
    } else if (isDraggingRight) {
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      if (newWidth > 10 && newWidth < 50 && leftWidth + newWidth < 90) {
        setRightWidth(newWidth)
        setRightCollapsed(false)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  }

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener('mousemove', HandleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', HandleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', HandleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight])

  useEffect(()=>{
    const searchParams = new URLSearchParams(window.location.search)
    const policyNumFromUrl = searchParams.get('policyNum')
    const policyNumFromSession = sessionStorage.getItem("proposalNo")

    if(policyNumFromUrl || policyNumFromSession){
      setSearchQuery(policyNumFromUrl || policyNumFromSession)
      handleSearch(policyNumFromUrl || policyNumFromSession)
    }

  },[])

  const handlePolicyNumberChange = (e)=>{
    setSearchQuery(e)
    const policyNumFromSession = sessionStorage.getItem("proposalNo") 
    if(searchQuery){
      router.push(`/document-viewer?policyNum=${searchQuery || policyNumFromSession}`,undefined,{
        shallow:true
      });
    }else{
      router.push("/document-viewer",undefined,{shallow:true})
    }
  }

  const handleRelatedDocumentsUpdate = async(newDocuments) => {
    // console.log(newDocuments)
    setFilteredDocs(newDocuments)
  };

  const sortDocuments=()=>{
    const sortedDocs = [...documents].sort((a,b)=>{
      const dateA = new Date(a.metaData.updatedAt)
      const dateB = new Date(b.metaData.updatedAt)
      return isAscending ? dateA - dateB : dateB - dateA;
    })
    setDocuments(sortedDocs)
    setIsDescending(!isAscending)
  }

  const handleContext = (event)=>{
    event.preventDefault();
    // alert("right-click is disabled on this page")
  }

  const closeTab=(indexToRemove)=>{
    console.log(indexToRemove)
    setDocUrl((prevUrls)=>docUrls.filter((_,index)=>index!==indexToRemove))
  }


  return (
    <>
      <div className="app-container">
        <Header/>
        <NavigationBar searchQuery={searchQuery} handlePolicyNumberChange={handlePolicyNumberChange} handleSearch={handleSearch}/>


        <div className="body-container">
          <div className={`sidebar left ${leftCollapsed ? "collapsed" : ""}`} style={{ width: !leftCollapsed && `${leftWidth}%` }} >
            <button
              className="toggle-btn"
              onClick={() => setLeftCollapsed(!leftCollapsed)}
            >
              {leftCollapsed ? ">" : "<"}
            </button>

            {!leftCollapsed && (
              <>
                {documents.length >= 1 &&
                 <>
                  {!leftCollapsed && (
                        <SearchWithSuggestions
                        documents={documents}
                        onUpdateRelatedDocuments={handleRelatedDocumentsUpdate}
                      />
                        
                    )}
                  {/* <div className="filter-section">
                    <select value={selectedCatagory} onChange={handleCtagoryChange}>
                      <option>Choose Category</option>
                      <option>Show All</option>
                      {[...new Map(documents?.map((item) =>
                        [item.metaData.docType, item.metaData]
                      )).values()].map((metaData, index) => (
                        <option key={index} value={metaData.code}>{metaData.docType}</option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search Catagory..."
                      
                      style={{marginTop:'2rem'}}
                    />
                    <button className="search-icon-catagory"><FaSearch size={20}/></button>
                  </div> */}
                 </>
                }
                <div className="doc-head-wrapper">
                  <p className="doc-text"><FaRectangleList/>DOCUMENTS </p>
                  <button className="sort-btn" onClick={() => { sortDocuments() }}>SORT BY {isAscending ? <LuCalendarArrowDown /> : <LuCalendarArrowUp />}</button>
                </div>
                <div className="document-list">
                  {filteredDocs?.length >= 1
                    ? filteredDocs.map((doc, index) => (
                      <div
                        className={`document-item ${selectedDocId === doc.docId ? "highlighted" : ""}`}
                        key={index}
                        onClick={() => handleDocumentClick(doc)}
                      >
                        <div className="doc-details">
                        <div className="doc-icon"><p className="doc-type">{getDocumentIcon(doc)}{doc.metaData?.docType}</p><p style={{fontSize:"12px"}}>{doc.metaData?.FormID || doc.metaData?.formID}</p></div>                         
                        <div className="d-d-lower-pallet">
                            <p className="doc-content-type" style={documentContentTypeStyle(doc.metaData?.docName)}>
                              {doc.metaData?.docName}
                            </p>
                            <p className="d-d-date">{formatDDMMYYHHMMSS(doc.metaData.updatedAt)}</p>
                          </div>  
                        </div>
                      </div>
                    ))
                    : documents?.map((doc, index) => (
                      <div
                        className={`document-item ${selectedDocId === doc.docId ? "highlighted" : ""}`}
                        key={index}
                        onClick={() => handleDocumentClick(doc)}
                      >
                        <div className="doc-details">
                          <div className="doc-icon"><p className="doc-type">{getDocumentIcon(doc)}{doc.metaData?.docType}</p><p style={{fontSize:"12px"}}>{doc.metaData?.FormID || doc.metaData?.formID}</p></div>
                          <div className="d-d-lower-pallet">
                            <p className="doc-content-type" style={documentContentTypeStyle(doc.metaData?.docName)}>
                              {doc.metaData?.docName}
                            </p>
                            <p className="d-d-date">{formatDDMMYYHHMMSS(doc.metaData.updatedAt)}</p>
                          </div>                         
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
          <div className="dragger" onMouseDown={HandleLeftMouseDown} />

          {loading ? (  
            <Loader/>
          ) : (
            docUrls?.length>0?
            docUrls?.map((docUrl,index)=>{
              return(
                <>
                  <div 
                    className={`content ${leftCollapsed && rightCollapsed ? "a4-only" : ""}`} 
                    style={docUrls.length===1 ? { width: `${100 - leftWidth - rightWidth}%`}:{ width: `${100 - leftWidth - rightWidth}%`,padding:"10px",border: "2px solid orange"}}
                    >
                    <p style={docUrls.length===1 ? {fontSize: "16px"}:{fontSize: "12px"}} className="doc-text-middle">{docName}-{contentType} <button className="closetab-btn" onClick={()=>{closeTab(index)}}><AiFillCloseSquare/></button></p>

                    {contentType &&
                      contentType == "image/tiff" ?
                      <TiffViewer  tiffUrl={docUrl} scale={docUrl.length==1? 1.5 : 0.5}/> :

                      contentType == "video/webm" || contentType == "video/mp4" ?
                        <embed  src={docUrl != "" ? `${docUrl}#toolbar=0` : null}  type="application/pdf" width="100%" height="100%" /> :

                      contentType == "application/pdf" ?
                        <PdfViewer docUrl={docUrl}  scaleRatio={docUrls?.length==1? 1.5 : 0.5}/> :

                      <Frame><img  onContextMenu={handleContext} draggable="false" style={{ "width": "-webkit-fill-available" }} className="jpg-document" src={docUrl} /></Frame>

                    }
                  </div>
                </>
              )
            }) 
 
              :
              <div className="content-blank"><HiDocument/></div>
          )}
          <div className="dragger" onMouseDown={HandleRightMouseDown} />

          <div
            className={`sidebar right ${rightCollapsed ? "collapsed" : ""}`} style={{ width: !rightCollapsed && `${rightWidth}%` }}>
            <button
              className="toggle-btn-right"
              onClick={() => setRightCollapsed(!rightCollapsed)}
            >
              {rightCollapsed ? "<" : ">"}
            </button>
            {!rightCollapsed && (
              <p className="doc-text"><MdSummarize/>SUMMARY</p>
            )}
          </div>
        </div>
      </div>


      {showPopup &&
        <AlertPopup close={closePopup} title={"No Documents Found"} msg={"We couldn't find any documents to display. Please try again."} />
      }

    </>
  );
}



