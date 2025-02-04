'use client';
 
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// Import the worker directly
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styles from '../styling/pdfViewer.module.css';
import Loader from './Loader';
 
// Set the worker directly from the import
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
 
export default function PdfViewer({ docUrl }) {
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [width, setWidth] = useState(300); // Default width in pixels
 
    const minWidth = 100;  // Minimum width in pixels
    const maxWidth = 2400; // Maximum width in pixels
    const zoomStep = 100;  // Width change per zoom step
 
    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }
 
    const handleZoomIn = () => {
        if (width < maxWidth) {
            setWidth((prevWidth) => Math.min(prevWidth + zoomStep, maxWidth));
        }
    };
 
    const handleZoomOut = () => {
        if (width > minWidth) {
            setWidth((prevWidth) => Math.max(prevWidth - zoomStep, minWidth));
        }
    };
 
    // const preventContextMenu = (e) => {
    //     e.preventDefault();
    //     return false;
    // };
 
    return (
        <>
            {loading && <Loader />}
 
            <div className={styles.page} >
                <main className={styles.main}>
                    <div className={styles.pdfViewer} >
                        <Document
                            file={docUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className={styles.pdfDocument}
                        >
                            <div className={styles.pagesContainer}>
                                {Array.from(new Array(numPages), (el, index) => (
                                    <div key={`page_${index + 1}`} className={styles.pageWrapper}>
                                        <Page
                                            pageNumber={index + 1}
                                            className={styles.pdfPage}
                                            width={width}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                            quality={1}
                                            scale={3}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Document>
 
                        <div className={styles.controls}>
                            <div className={styles.zoomControls}>
                                <button
                                    className={styles.zoomButton}
                                    onClick={handleZoomOut}
                                    disabled={width <= minWidth}
                                    aria-label="Zoom out"
                                >
                                    −
                                </button>
                                <span className={styles.zoomLevel}>
                                    {Math.round((width / 800) * 100)}%
                                </span>
                                <button
                                    className={styles.zoomButton}
                                    onClick={handleZoomIn}
                                    disabled={width >= maxWidth}
                                    aria-label="Zoom in"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
 
    );
}