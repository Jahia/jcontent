import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Tooltip} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {
    ChevronLeft,
    ChevronRight,
    MagnifyMinusOutline,
    MagnifyPlusOutline,
    StepBackward,
    StepForward
} from 'mdi-material-ui';
import classNames from 'classnames';
import clsx from 'clsx';
import styles from './PDFViewer.scss';

const scaleSizes = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

const Pdf = React.lazy(() => import(/* webpackChunkName: "reactPdfJs" */ 'react-pdf-js'));

export const PDFViewer = ({file, isFullScreen}) => {
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(null);
    const [scaleSize, setScaleSize] = useState(6);
    const [showScale, setShowScale] = useState(false);

    const scaleTimeout = useRef();

    const onDocumentComplete = pages => {
        setPage(1);
        setPages(pages);
    };

    const handleNavigation = (event, value) => {
        switch (value) {
            case 'first':
                setPage(1);
                break;
            case 'last':
                setPage(pages);
                break;
            case 'next':
                setPage(page + 1);
                break;
            case 'previous':
                setPage(page - 1);
                break;
            default:
                break;
        }
    };

    const handleZoom = (event, value) => {
        clearTimeout(scaleTimeout.current);
        scaleTimeout.current = setTimeout(() => {
            setShowScale(false);
        }, 1000);

        setShowScale(true);

        switch (value) {
            case 'in':
                setScaleSize(scaleSize + 1);
                break;
            case 'out':
                setScaleSize(scaleSize - 1);
                break;
            default:
                break;
        }
    };

    return (
        <React.Fragment>
            <Tooltip title={Math.floor(scaleSizes[scaleSize] * 100) + ' %'}
                     placement="top-end"
                     open={showScale}
                     classes={{popper: styles.scale}}
            >
                <div className={classNames(styles.pdfContainer, isFullScreen && styles.fullScreen)}>
                    <Pdf key={file}
                         file={file}
                         scale={scaleSizes[scaleSize]}
                         page={page}
                         onDocumentComplete={onDocumentComplete}
                    />
                </div>
            </Tooltip>

            <div className={clsx('flexRow_between', styles.controlsContainer)}>
                <div className={clsx('flexRow', 'alignCenter')}/>
                <div className={clsx('flexRow', 'alignCenter')}>
                    <Button disabled={page === 1}
                            variant="ghost"
                            icon={<StepBackward/>}
                            onClick={event => {
                                handleNavigation(event, 'first');
                            }}
                    />
                    <Button disabled={page === 1}
                            variant="ghost"
                            icon={<ChevronLeft/>}
                            onClick={event => {
                                handleNavigation(event, 'previous');
                            }}
                    />
                    <Typography variant="caption">
                        {page}/{pages}
                    </Typography>
                    <Button disabled={page === pages}
                            variant="ghost"
                            icon={<ChevronRight/>}
                            onClick={event => {
                                handleNavigation(event, 'next');
                            }}
                    />
                    <Button disabled={page === pages}
                            variant="ghost"
                            icon={<StepForward/>}
                            onClick={event => {
                                handleNavigation(event, 'last');
                            }}
                    />
                </div>
                <div className={clsx('flexRow', 'alignCenter')}>
                    <Button disabled={scaleSize === 0}
                            variant="ghost"
                            icon={<MagnifyMinusOutline/>}
                            onClick={event => {
                                handleZoom(event, 'out');
                            }}
                    />
                    <Button disabled={scaleSize === scaleSizes.length - 1}
                            variant="ghost"
                            icon={<MagnifyPlusOutline/>}
                            onClick={event => {
                                handleZoom(event, 'in');
                            }}
                    />
                </div>
            </div>
        </React.Fragment>
    );
};

PDFViewer.propTypes = {
    file: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired
};

export default PDFViewer;
