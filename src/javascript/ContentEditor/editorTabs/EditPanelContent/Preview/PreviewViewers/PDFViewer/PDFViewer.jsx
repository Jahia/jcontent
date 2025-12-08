import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Tooltip} from '@material-ui/core';
import {
    Button,
    ChevronFirstPage,
    ChevronLastPage,
    ChevronLeft,
    ChevronRight,
    Typography,
    ZoomIn,
    ZoomOut
} from '@jahia/moonstone';
import clsx from 'clsx';
import styles from './PDFViewer.scss';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';

import {pdfjs, Document, Page} from 'react-pdf';

// Set local worker
pdfjs.GlobalWorkerOptions.workerSrc = `${window.contextJsParameters.contextPath}/modules/jcontent/javascript/apps/pdf.worker.min.mjs`;

const scaleSizes = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

export const PDFViewer = ({file, isFullScreen}) => {
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(null);
    const [scaleSize, setScaleSize] = useState(6);
    const [showScale, setShowScale] = useState(false);

    const scaleTimeout = useRef();

    const onDocumentLoadSuccess = ({numPages}) => {
        setPages(numPages);
    };

    const onDocumentLoadError = error => {
        console.error('PDF load error:', error);
    };

    const handleNavigation = (_, value) => {
        switch (value) {
            case 'first':
                setPage(1);
                break;
            case 'last':
                setPage(pages);
                break;
            case 'next':
                setPage(prev => Math.min(prev + 1, pages));
                break;
            case 'previous':
                setPage(prev => Math.max(prev - 1, 1));
                break;
            default:
                break;
        }
    };

    const handleZoom = (_, value) => {
        // Show zoom tooltip briefly
        clearTimeout(scaleTimeout.current);
        scaleTimeout.current = setTimeout(() => {
            setShowScale(false);
        }, 1000);

        setShowScale(true);

        if (value === 'in') {
            setScaleSize(prev => Math.min(prev + 1, scaleSizes.length - 1));
        } else if (value === 'out') {
            setScaleSize(prev => Math.max(prev - 1, 0));
        }
    };

    return (
        <>
            <Tooltip
                title={Math.floor(scaleSizes[scaleSize] * 100) + ' %'}
                placement="top-end"
                open={showScale}
                classes={{popper: styles.scale}}
            >
                <div className={clsx(styles.pdfContainer, isFullScreen && styles.fullScreen)}>
                    <React.Suspense fallback={<LoaderOverlay/>}>
                        <Document
                            key={file}
                            file={file}
                            loading={<LoaderOverlay/>}
                            error="Could not load PDF"
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                        >
                            {pages && (
                                <Page
                                    key={page}
                                    renderAnnotationLayer
                                    renderTextLayer
                                    pageNumber={page}
                                    scale={scaleSizes[scaleSize]}
                                />
                            )}
                        </Document>
                    </React.Suspense>
                </div>
            </Tooltip>

            <div className={clsx('flexRow_between', styles.controlsContainer)}>
                <div className={clsx('flexRow', 'alignCenter')}/>

                {/* Navigation controls */}
                <div className={clsx('flexRow', 'alignCenter')}>
                    <Button
                        isDisabled={page === 1}
                        variant="ghost"
                        icon={<ChevronFirstPage/>}
                        onClick={e => handleNavigation(e, 'first')}
                    />
                    <Button
                        isDisabled={page === 1}
                        variant="ghost"
                        icon={<ChevronLeft/>}
                        onClick={e => handleNavigation(e, 'previous')}
                    />

                    <Typography variant="caption">
                        {page}/{pages ?? '--'}
                    </Typography>

                    <Button
                        isDisabled={!pages || page === pages}
                        variant="ghost"
                        icon={<ChevronRight/>}
                        onClick={e => handleNavigation(e, 'next')}
                    />
                    <Button
                        isDisabled={!pages || page === pages}
                        variant="ghost"
                        icon={<ChevronLastPage/>}
                        onClick={e => handleNavigation(e, 'last')}
                    />
                </div>

                {/* Zoom controls */}
                <div className={clsx('flexRow', 'alignCenter')}>
                    <Button
                        isDisabled={scaleSize === 0}
                        variant="ghost"
                        icon={<ZoomOut/>}
                        onClick={e => handleZoom(e, 'out')}
                    />
                    <Button
                        isDisabled={scaleSize === scaleSizes.length - 1}
                        variant="ghost"
                        icon={<ZoomIn/>}
                        onClick={e => handleZoom(e, 'in')}
                    />
                </div>
            </div>
        </>
    );
};

PDFViewer.propTypes = {
    file: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired
};

export default PDFViewer;
