import React, { useEffect, useRef, useState } from "react";
import "../styling/documentViewer.css";
import Frame from 'react-frame-component'
import AlertPopup from "@/components/AlertPopup";
import { commonEventAttributes, formatDDMMYYHHMMSS, getDocNameColor } from "@/utils/utils";
import { fetchDocuments, fetchDocumentsByCatagory, getDocUrl, sendEvent } from "@/utils/api";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getDocumentIcon } from "@/utils/reactIcons";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import { LuCalendarArrowUp , LuCalendarArrowDown } from "react-icons/lu";
import { FaRectangleList, FaSort ,FaArrowRotateLeft,FaArrowRotateRight } from "react-icons/fa6";
import { AiFillCloseSquare } from "react-icons/ai";
import { MdSummarize } from "react-icons/md";
import { HiDocument } from "react-icons/hi2";
import NavigationBar from "@/components/NavigationBar";
import TiffViewer from "@/components/TiffViewer";
import PdfViewer from "@/components/PdfViewer";
import {documentContentTypeStyle} from '../styling/inlineCSS'
import CustomTooltip from "@/components/CustomTooltip";
import { SlOptionsVertical } from "react-icons/sl";
import { ImNewTab } from "react-icons/im";
import CryptoJS from 'crypto-js'; // Import the crypto-js library
import { encryptData } from "@/utils/encrypt";
import ToolbarComponent from "@/components/Toolbar";
import { PiImageBrokenFill } from "react-icons/pi";

export default function Page() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docUrls, setDocUrl] = useState([]);
  const [selectedCatagory, setSelectedCatagory] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(15);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [docName , setDocName] = useState(null);
  const [isAscending , setIsDescending] = useState(true);
  const [contentType , setContentType] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [dropdownVisible, setDropdownVisible] = useState({});
  const router = useRouter();
  const [isSplitView, setIsSplitView] = useState(false);
  const [alertMsg , setAlertMsg] = useState({
    title:"No Documents Found",
    msg:"We couldn't find any documents to display. Please try again."
  })
  const UserId = typeof window!== 'undefined' ? sessionStorage.getItem('userName'):null;
 
  const styles = {
    viewerContainer: {
      position: 'relative',
      height: '100%',
      overflow: 'auto'
    },
    zoomControls: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '5px',
      borderRadius: '5px',
      display: 'flex',
      gap: '5px',
      alignItems: 'center',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    zoomBtn: {
      padding: '4px 8px',
      cursor: 'pointer',
      border: '1px solid #ccc',
      borderRadius: '3px',
      background: 'white',
      fontSize: '14px'
    }
  };
 
  // New priority sorting function
  const getPriorityOrder = (doc) => {
    const docType = doc.metaData?.docType?.toUpperCase();
    const docName = doc.metaData?.docName?.toUpperCase();
    const contentType = doc.metaData?.contentType;
    
    // Priority order (from highest to lowest):
    // 1. Application Form
    // 2. SIS
    // 3. KYC
    // 4. INCOME
    // 5. AML
    // 6. All remaining documents
    // 7. image/tiff documents (absolute lowest priority)
    
    if (contentType === 'image/tiff') return 1000; // Absolute last priority
    if (docType?.includes('APPLICATION FORM') || docName?.includes('APPLICATION FORM')) return 1;
    if (docType?.includes('SIS') || docName?.includes('SIS')) return 2;
    if (docType?.includes('KYC') || docName?.includes('KYC')) return 3;
    if (docType?.includes('INCOME') || docName?.includes('INCOME')) return 4;
    if (docType?.includes('AML') || docName?.includes('AML')) return 5;
    
    // All remaining non-TIFF documents
    return 100;
  };
 
  const handleSearch = async (policyNumFromUrl) => {
    setDocUrl([]);
    setSelectedDocId(null);
    setDocuments([]);
    const policyNumber = policyNumFromUrl ? policyNumFromUrl : searchQuery;
    sessionStorage.setItem("proposalNo", policyNumber);
    if (policyNumber.length === 0) {
      setShowPopup(true);
      return;
    }
    setLoading(true);
 
    try {
      const data = await fetchDocuments(policyNumber);
      
      const sortedDocs = [...data.documents].sort((a, b) => {
        const priorityA = getPriorityOrder(a);
        const priorityB = getPriorityOrder(b);
        
        if (priorityA === priorityB) {
          // For documents with same priority (including non-priority docs),
          // sort by date (newest first)
          const dateA = new Date(a.metaData.updatedAt);
          const dateB = new Date(b.metaData.updatedAt);
          return dateB - dateA;
        }
        return priorityA - priorityB;
      });
 
      setDocuments(sortedDocs || []);
      if (data._status.code === 1 || data.documents.length === 0) {
        setShowPopup(true);
      }
      setFilteredDocs([]);
      console.log(sortedDocs, "sorted");
      //  sendEvent({
      //   name: "search_documents",
      //   attributes: {
      //     userId:UserId,
      //     ...commonEventAttributes(),
      //     policyNumber: policyNumber,
      //   }
      // })
    } catch (e) {
      console.error("Error fetching documents:", e);
    } finally {
      setLoading(false);
    }
  };
 
  const manageUrls = (newUrl, contentType, docName) => {
    setDocUrl((prevUrls) => {
        if (prevUrls.length === 0) {
            return [{
                url: newUrl,
                contentType: contentType,
                docName: docName,
                zoomLevel: 1
            }];
        } else {
            return [
                prevUrls[0],
                {
                    url: newUrl,
                    contentType: contentType,
                    docName: docName,
                    zoomLevel: 1
                }
            ];
        }
    });
  };
  
  const handleDocumentClick = async (doc) => {
    const docId = doc.docId;
    const docName = doc.metaData.docName;
    const bucketId = doc.bucketId;
    const contentType = doc.metaData.contentType;
    if(!docId){
      setShowPopup(true)
      setAlertMsg({
        title:"Document Not Found",
        msg:"Oops! We couldn't find a document ID."
      })
      return
    }
    if(!bucketId){
      setShowPopup(true)
      setAlertMsg({
        title:"Document Not Found",
        msg:"Oops! We couldn't find a bucket ID."
      })
      return
    }
    
    setDocName(docName);
    setLoading(true);
    
    
    if (selectedDocId === docId) {
        setSelectedDocId(docId);
        setContentType(contentType);
        setLoading(false);
    } else {
        setSelectedDocId(docId);
        setContentType(contentType);
        try {
            const data = await getDocUrl(docId, bucketId);
            manageUrls(data.url, contentType,docName);
            //  sendEvent({
            //   name: "document_click",
            //   attributes: {
            //     userId:UserId,
            //     ...commonEventAttributes(),
            //     docName: docName,
            //     docId: docId,
            //     policyNumber: searchQuery,
            //   }
            // })
        } catch (error) {
          //  sendEvent({
          //   name: "document_click_error",
          //   attributes: {
          //     userId:UserId,
          //     ...commonEventAttributes(),
          //     docName: docName,
          //     docId: docId,
          //     policyNumber: searchQuery,
          //   }
          // })
            console.error("Error fetching document URL:", error);
        } finally {
            setLoading(false);
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
 
  // const handleContext = (event)=>{
  //   event.preventDefault();
  // }
 
  const closeTab=(indexToRemove)=>{
    {isSplitView ?
    setDocUrl((prevUrls)=>docUrls.filter((_,index)=>index!==indexToRemove))
    :setDocUrl([])
    }
  }
 
  const handleZoomIn = (index) => {
    setDocUrl(prevUrls => {
        const newUrls = [...prevUrls];
        newUrls[index].zoomLevel = Math.min(newUrls[index].zoomLevel + 0.25, 3); // Max zoom 300%
        return newUrls;
    });
  };
 
  const handleZoomOut = (index) => {
    setDocUrl(prevUrls => {
        const newUrls = [...prevUrls];
        newUrls[index].zoomLevel = Math.max(newUrls[index].zoomLevel - 0.25, 0.25); // Min zoom 25%
        return newUrls;
    });
  };
 
  const handleZoomReset = (index) => {
    setDocUrl(prevUrls => {
        const newUrls = [...prevUrls];
        newUrls[index].zoomLevel = 1; // Reset zoom level
        return newUrls;
    });
  };
 
  const handleRotateLeft = (index) => {
    setDocUrl(prevUrls => {
        const newUrls = [...prevUrls];
        newUrls[index].rotationAngle = (newUrls[index].rotationAngle || 0) - 45; // Rotate left by 45 degrees for JPEG/PNG
        return newUrls;
    });
  };

  const handleRotateRight = (index) => {
    setDocUrl(prevUrls => {
        const newUrls = [...prevUrls];
        newUrls[index].rotationAngle = (newUrls[index].rotationAngle || 0) + 45; // Rotate right by 45 degrees for JPEG/PNG
        return newUrls;
    });
  };
 
  const handleSortChange = (event) => {
    const sortOption = event.target.value;
    let sortedDocs;

    switch (sortOption) {
      case 'dateAscending':
        sortedDocs = [...documents].sort((a, b) => new Date(a.metaData.updatedAt) - new Date(b.metaData.updatedAt));
        break;
      case 'dateDescending':
        sortedDocs = [...documents].sort((a, b) => new Date(b.metaData.updatedAt) - new Date(a.metaData.updatedAt));
        break;
      case 'priority':
        sortedDocs = [...documents].sort((a, b) => getPriorityOrder(a) - getPriorityOrder(b));
        break;
      default:
        sortedDocs = documents; // No sorting
    }

    setDocuments(sortedDocs);
  };
 
  const handleMouseEnter = (doc, e) => {
    setTooltipContent(`Form ID: ${doc.metaData?.FormID || doc.metaData?.formID} <br/> Date: ${formatDDMMYYHHMMSS(doc.metaData.updatedAt)}`);
    setTooltipVisible(true);
    setTooltipPosition({ top: e.clientY + 10, left: e.clientX + 10 });
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };
  const handleNewTab = async (data) => {
    const { doc } = data;
    const docId = doc.docId;
    const bucketId = doc.bucketId;

    if(!docId){
      setShowPopup(true)
      setAlertMsg({
        title:"Document Not Found",
        msg:"Oops! We couldn't find a document ID."
      })
      return
    }
    if(!bucketId){
      setShowPopup(true)
      setAlertMsg({
        title:"Document Not Found",
        msg:"Oops! We couldn't find a bucket ID."
      })
      return
    }

    setLoading(true);
    
    try {
      // Fetch the document URL first
      const urlData = await getDocUrl(doc.docId, doc.bucketId);
      
      // Create docUrl object with the same structure as in manageUrls
      const docUrlObject = {
        url: urlData.url,
        contentType: doc.metaData.contentType,
        docName: doc.metaData.docName,
        zoomLevel: 1,
        rotationAngle: 0
      };

      // Encrypt the data
      const encryptedDoc = encryptData(doc);
      const encryptedDocUrls = encryptData([docUrlObject]); // Wrap in array to match existing structure

      // Create the URL with encrypted parameters
      const newTabUrl = `/docviewer/dockview?doc=${encodeURIComponent(encryptedDoc)}&docUrls=${encodeURIComponent(encryptedDocUrls)}`;
      //  sendEvent({
      //   name: "new_tab_open",
      //   attributes: {
      //     userId:UserId,
      //     ...commonEventAttributes(),
      //     policyNumber: searchQuery,
      //     docName: doc.metaData.docName,
      //     docId: doc.docId,
      //   }
      // })
      window.open(newTabUrl, '_blank');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching document URL:', error);
      //  sendEvent({
      //   name: "new_tab_open_error",
      //   attributes: {
      //     userId:UserId,
      //     ...commonEventAttributes(),
      //     policyNumber: searchQuery,
      //     docName: doc.metaData.docName,
      //     docId: doc.docId,
      //   }
      // })
    } finally {
      setLoading(false);
    }
  };

  const handleSplit = () => {
    setIsSplitView(prevState => !prevState); // Toggle the split view state
    console.log("Split view toggled:", !isSplitView);
  };
 
  return (
    <>
      <div className="app-container">
        <Header/>
        <NavigationBar searchQuery={searchQuery} handlePolicyNumberChange={handlePolicyNumberChange} handleSearch={handleSearch}/>
 
        <ToolbarComponent 
          onSplit={handleSplit} 
          isSplitView={isSplitView}
        />
        <div className="body-container">
          <div className={`sidebar left ${leftCollapsed ? "collapsed" : ""}`} style={{ width: !leftCollapsed && `${leftWidth}%` }} >
            <button
              className="toggle-btn"
              onClick={() => {setLeftCollapsed(!leftCollapsed)}
                //  sendEvent({
                //   name: "sidebar_toggle_left",
                //   attributes: {
                //     userId:UserId,
                //     ...commonEventAttributes(),
                //     policyNumber: searchQuery,
                //   }
                // })}
                
              }
            >
              {leftCollapsed ? ">" : "<"}
            </button>
 
            {!leftCollapsed && (
              <>
                {documents.length >= 1 &&
                  <>
                    {!leftCollapsed && (
                      <>
                        <div className="doc-head-wrapper">
                        <SearchWithSuggestions
                          documents={documents}
                          onUpdateRelatedDocuments={handleRelatedDocumentsUpdate}
                          policyNumber={searchQuery}
                        />
                          <div className="sort-wrapper">
                          <label htmlFor="sortOptions" className="sort-label">
                            <FaSort style={{ marginRight: '5px' }} /> Sort By:
                          </label>
                          <select id="sortOptions" onChange={handleSortChange} defaultValue="priority">
                            <option value="dateAscending">Date Ascending</option>
                            <option value="dateDescending">Date Descending</option>
                            <option value="priority">Priority</option>
                            </select>
                          </div>
                        </div>
                      </>

                    )}

                  </>
                }

                <div className="document-list">
                  {filteredDocs?.length >= 1
                    ? filteredDocs.map((doc, index) => (
                      <div
                        className={`document-item ${doc?.docId && selectedDocId === doc?.docId ? "highlighted" : ""}`}
                        key={index}
                        onClick={() => handleDocumentClick(doc)}
                        onMouseEnter={(e) => handleMouseEnter(doc, e)}
                        onMouseLeave={handleMouseLeave}
                        style={{ position: 'relative' }}
                      >
                        <div className="doc-details">
                          <div className="doc-icon">
                            <p className="doc-type">{getDocumentIcon(doc)}{doc.metaData?.docType}</p>
                          </div>
                          <div className="d-d-lower-pallet">
                            <p className="doc-content-type" style={documentContentTypeStyle(doc.metaData?.docName)}>
                              {doc.metaData?.docName}
                            </p>
                          </div>
                        </div>
                        <div className="options-menu" onClick={(e) => { e.stopPropagation(); handleNewTab({doc}); }}>
                          <ImNewTab size={20} />
                        </div>
                      </div>
                    ))
                    : documents?.map((doc, index) => (
                      <div
                        className={`document-item ${doc?.docId && selectedDocId === doc.docId ? "highlighted" : ""}`}
                        key={index}
                        onClick={() => handleDocumentClick(doc)}
                        onMouseEnter={(e) => handleMouseEnter(doc, e)}
                        onMouseLeave={handleMouseLeave}
                        style={{ position: 'relative' }}
                      >
                        <div className="doc-details">
                          <div className="doc-icon">
                            <p className="doc-type">{getDocumentIcon(doc)}{doc.metaData?.docType}</p>
                          </div>
                          <div className="d-d-lower-pallet">
                            <p className="doc-content-type" style={documentContentTypeStyle(doc.metaData?.docName)}>
                              {doc.metaData?.docName}
                            </p>
                          </div>
                        </div>
                        <div className="options-menu" onClick={(e) => { e.stopPropagation(); handleNewTab({doc}); }}>
                          <ImNewTab size={20} />
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
            (isSplitView ? docUrls : [docUrls[docUrls?.length==2?1:0]])?.map((docItem, index) => (
                <div
                    key={index}
                    className={`content ${leftCollapsed && rightCollapsed ? "a4-only" : ""}`}
                    style={docUrls.length === 1 
                        ? { width: `${100 - leftWidth - rightWidth}%`}
                        : { width: `${100 - leftWidth - rightWidth}%`, padding: "10px", border: isSplitView &&  "2px solid orange"}
                    }
                >
                    <p style={docUrls.length === 1 || !isSplitView? {fontSize: "16px"} : {fontSize: "12px"}} 
                       className="doc-text-middle">
                        {docItem.docName}-{docItem.contentType} 
                        <button className="closetab-btn" onClick={() => closeTab(index)}>
                            <AiFillCloseSquare/>
                        </button>
                    </p>

                    {docItem.contentType === "image/tiff" ? (
                        <div className="viewer-container">
                            <TiffViewer tiffUrl={docItem.url} scale={docItem.zoomLevel * (docUrls.length === 1 ? 1.5 : 0.5)} rotationAngle={docItem.rotationAngle || 0}/>
                        </div>
                    ) : (docItem.contentType === "image/jpeg" || docItem.contentType === "image/png" || docItem.contentType === "image/jpg") ? (
                        <div className="viewer-container">
                            <div className="zoom-controls">
                                <button onClick={() => handleZoomOut(isSplitView ? index:docUrls.length===1?0 :docUrls.length===2?1:null)} className="zoom-btn">-</button>
                                <button onClick={() => handleZoomReset(isSplitView ? index:docUrls.length===1?0 :docUrls.length===2?1:null)} className="zoom-btn">Reset</button>
                                <button onClick={() => handleZoomIn(isSplitView ? index:docUrls.length===1?0 :docUrls.length===2?1:null)} className="zoom-btn">+</button>
                                <button onClick={() => handleRotateLeft(isSplitView ? index:docUrls.length===1?0 :docUrls.length===2?1:null)} className="zoom-btn"><FaArrowRotateLeft/></button>
                                <button onClick={() => handleRotateRight(isSplitView ? index:docUrls.length===1?0 :docUrls.length===2?1:null)} className="zoom-btn"><FaArrowRotateRight/></button>
                                <span>{Math.round(docItem.zoomLevel * 100)}%</span>
                            </div>
                            <Frame>
                                <img
                                    // onContextMenu={handleContext}
                                    draggable="false"
                                    style={{
                                        width: "-webkit-fill-available",
                                        transform: `scale(${docItem.zoomLevel}) rotate(${docItem.rotationAngle || 0}deg)`,
                                        transformOrigin: 'center',
                                        transition: 'transform 0.2s ease-in-out'
                                    }}
                                    className="jpg-document"
                                    src={docItem.url}
                                />
                            </Frame>
                        </div>
                    ) : docItem.contentType === "application/pdf" ? (
                      <PdfViewer docUrl={docItem.url}/>

                    ) : docItem.contentType.startsWith("video/") ? (
                        <embed src={docItem.url !== "" ? `${docItem.url}#toolbar=0` : null} 
                               width="100%" 
                               height="100%" />
                    ) : docItem.contentType ==="text/html" ?(
                      <embed src={docItem.url !== "" ? `${docItem.url}#toolbar=0&navpanes=0&scrollbar=1` : null} 
                               type="application/pdf" 
                               width="100%" 
                               height="100%" />
                    ):docItem.contentType ==="audio/mpeg" || docItem.contentType ==="audio/mp4" || contentType.startsWith('audio/')?(
                            <audio controls>
                              <source src={docItem.url !== "" ? `${docItem.url}` : null}
                                type="audio/mpeg"
                              />
                            </audio>

                    ):<PiImageBrokenFill/>
                    }
                </div>
            ))
              :
              <div className="content-blank"><HiDocument/></div>
          )}
          <div className="dragger" onMouseDown={HandleRightMouseDown} />
 
          <div
            className={`sidebar right ${rightCollapsed ? "collapsed" : ""}`} style={{ width: !rightCollapsed && `${rightWidth}%` }}>
            <button
              className="toggle-btn-right"
              onClick={async() => {
                setRightCollapsed(!rightCollapsed)
                //  sendEvent({
                //   name: "sidebar_toggle_right",
                //   attributes: {
                //     userId:UserId,
                //     ...commonEventAttributes(),
                //     policyNumber: searchQuery,
                //   }
                // })
              }}
            >
              {rightCollapsed ? "<" : ">"}
            </button>
            {!rightCollapsed && (
              <p className="doc-text"><MdSummarize/>SUMMARY</p>
            )}
          </div>
        </div>
      </div>
 
 
      {showPopup && alertMsg &&
        <AlertPopup close={closePopup} title={alertMsg.title} msg={alertMsg.msg} />
      }
      <CustomTooltip content={tooltipContent} visible={tooltipVisible} position={tooltipPosition} />
    </>
  );
}