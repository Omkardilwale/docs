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

export default function PdfViewer({ docUrl , scaleRatio}) {
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(scaleRatio);

    // useState(()=>{
    //     console.log(docUrl)
    // })
    

    const minScale = 0.25;
    const maxScale = 3;
    const zoomStep = 0.25;

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }

    const handleZoomIn = () => {
        if (scale < maxScale) {
            setScale((prevScale) => Math.min(prevScale + zoomStep, maxScale));
        }
    };

    const handleZoomOut = () => {
        if (scale > minScale) {
            setScale((prevScale) => Math.max(prevScale - zoomStep, minScale));
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
                                            scale={scale}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                            quality={1}
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
                                    disabled={scale <= minScale}
                                    aria-label="Zoom out"
                                >
                                    −
                                </button>
                                <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
                                <button
                                    className={styles.zoomButton}
                                    onClick={handleZoomIn}
                                    disabled={scale >= maxScale}
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