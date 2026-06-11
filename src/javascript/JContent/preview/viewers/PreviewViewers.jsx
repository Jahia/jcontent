import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './PreviewViewers.scss';

import {DocumentViewer} from './DocumentViewer';
import {ImageViewer} from './ImageViewer';
import {IframeViewer} from './IframeViewer';
import {PDFViewer} from './PDFViewer';
import {getFileExtension, isBrowserImage, isPDF} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.utils';

export const PreviewViewers = ({data, previewContext, nodeData = null, isFullScreen = false, onContentNotFound}) => {
    const isFile = data?.nodeByPath?.lastModified && data?.nodeByPath?.isFile;
    if (isFile) {
        const file = window.contextJsParameters.contextPath + '/files/' + (previewContext.workspace === 'edit' ? 'default' : 'live') + data.nodeByPath.path.replace(/[^/]/g, encodeURIComponent) + (data.nodeByPath.lastModified ? ('?lastModified=' + data.nodeByPath.lastModified.value) : '');
        if (isPDF(data.nodeByPath)) {
            return (
                <div className={styles.previewContainer} data-sel-role="preview-type-pdf">
                    <PDFViewer file={file} isFullScreen={isFullScreen}/>
                </div>
            );
        }

        if (isBrowserImage(data.nodeByPath)) {
            return (
                <div className={clsx(styles.previewContainer, styles.mediaContainer)}
                     data-sel-role="preview-type-image"
                >
                    <ImageViewer file={file} isFullScreen={isFullScreen}/>
                </div>
            );
        }

        const type = getFileExtension(data.nodeByPath);
        const isMedia = (type === 'webm' || type === 'mp4');
        return (
            <div className={clsx(styles.previewContainer, isMedia && styles.mediaContainer)}
                 data-sel-role="preview-type-document"
            >
                <DocumentViewer file={file} isFullScreen={isFullScreen} type={type}/>
            </div>
        );
    }

    return (
        <div className={clsx(styles.previewContainer, styles.contentContainer)}
             data-sel-role="preview-type-content"
        >
            <IframeViewer
                data={data}
                nodeData={nodeData}
                previewContext={previewContext}
                onContentNotFound={onContentNotFound}
            />
        </div>
    );
};

PreviewViewers.propTypes = {
    data: PropTypes.object.isRequired,
    previewContext: PropTypes.shape({
        workspace: PropTypes.string.isRequired
    }).isRequired,
    nodeData: PropTypes.object,
    isFullScreen: PropTypes.bool,
    onContentNotFound: PropTypes.func.isRequired
};
