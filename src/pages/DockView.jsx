'use client'
import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js'; // Ensure you import CryptoJS
import { decryptData } from '@/utils/encrypt';
import PdfViewer from '@/components/PdfViewer';
import TiffViewer from '@/components/TiffViewer';
import Loader from '@/components/Loader';
import styles from '../styling/DockView.css';
import { FaSearchPlus, FaSearchMinus, FaSync, FaRedo } from 'react-icons/fa'; // Importing zoom in, zoom out, rotate, and reset icons

const DockView = () => {
  const [doc, setDoc] = useState(null);
  const [docUrls, setDocUrls] = useState([]);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docData = params.get('doc');
    const docUrlsData = params.get('docUrls');


    if (docData) {
        try {
            const decryptedDoc = decryptData(decodeURIComponent(docData)); // Decrypt and set the doc data
            console.log(decryptedDoc)
            setDoc(decryptedDoc);
        } catch (error) {
            console.error('Error decrypting docData:', error); // Log the error
        }
    }
    if (docUrlsData) {
        try {
            const decryptedDocUrls = decryptData(decodeURIComponent(docUrlsData)); // Decrypt and set the docUrls data
            console.log(decryptedDocUrls)
            setDocUrls(decryptedDocUrls);
        } catch (error) {
            console.error('Error decrypting docUrlsData:', error); // Log the error
        }
    }

    // Disable right-click context menu
    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const handleZoomIn = () => {
    setScale(scale + 0.1);
  };

  const handleZoomOut = () => {
    setScale(scale - 0.1);
  };

  const handleRotate = () => {
    setRotation(rotation + 90);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="document-viewer-container" style={{ userSelect: 'none' }}>
      {docUrls?.length > 0 ? (
        docUrls.map((docItem, index) => (
          <div key={index} className="content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="doc-text-middle">
                {docItem.docName}
              </p>
              {docItem.contentType === "image/jpeg" || docItem.contentType === "image/png" ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleZoomIn} title="Zoom In">
                    <FaSearchPlus />
                  </button>
                  <button onClick={handleZoomOut} title="Zoom Out">
                    <FaSearchMinus />
                  </button>
                  <button onClick={handleRotate} title="Rotate">
                    <FaSync />
                  </button>
                  <button onClick={handleReset} title="Reset">
                    <FaRedo />
                  </button>
                </div>
              ) : null}
            </div>
            {docItem.contentType === "application/pdf" ? (
              <PdfViewer docUrl={docItem.url} scaleRatio={2} />
            ) : docItem.contentType === "image/tiff" ?(
              <TiffViewer docUrl={docItem.url} />
            ): docItem.contentType === "image/jpeg" ? (
              <div style={{ overflow: 'hidden', maxWidth: '100%', position: 'relative' }}>
                <img 
                  src={docItem.url} 
                  alt={docItem.docName} 
                  style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transition: 'transform 0.2s', width: '100%', display: 'block', margin: '0 auto' }} 
                />
              </div>
            ) : docItem.contentType === "image/png" ? (
              <div style={{ overflow: 'hidden', maxWidth: '100%', position: 'relative' }}>
                <img 
                  src={docItem.url} 
                  alt={docItem.docName} 
                  style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transition: 'transform 0.2s', width: '100%', display: 'block', margin: '0 auto' }} 
                />
              </div>
            ) : docItem.contentType.startsWith("video/")  ? (
                <embed src={docItem.url !== "" ? `${docItem.url}#toolbar=0` : null} 
                       type="application/pdf" 
                       width="100%" 
                       height="100%" />
            ) : (
                <div className="unsupported-format">
                    Unsupported document format: {docItem.contentType}
                </div>
            )}
          </div>
        ))
      ) : (
        <div className="content-blank">No document to display</div>
      )}
    </div>
  );
};

export default DockView;    