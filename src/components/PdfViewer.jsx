'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styles from '../styling/pdfViewer.module.css';
import Loader from './Loader';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PdfViewer({ docUrl , scaleRatio}) {
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [width, setWidth] = useState(350);

    // useState(()=>{
    //     console.log(docUrl)
    // })
    

    const minWidth = 150;
    const maxWidth = 1000;
    const zoomStep = 20;

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }

    const handleZoomIn = () => {
        setWidth((prevWidth) => Math.min(prevWidth + zoomStep, maxWidth));
    };

    const handleZoomOut = () => {
        setWidth((prevWidth) => Math.max(prevWidth - zoomStep, minWidth));
    };

    const preventContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    return (
        <>
            {loading && <Loader />}

            <div className={styles.page}>
                <main className={styles.main}>
                    <div className={styles.pdfViewer} onContextMenu={preventContextMenu}>
                        <div className={styles.scrollContainer}>
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
                                                scale={3}
                                                renderTextLayer={true}
                                                renderAnnotationLayer={true}
                                                quality={2}
                                                width={width}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Document>
                        </div>

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
                                <span className={styles.zoomLevel}>{Math.round(width)}%</span>
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