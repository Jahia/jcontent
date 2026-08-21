import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './PreviewViewers.scss';

import {DocumentViewer} from './DocumentViewer';
import {ImageViewer} from './ImageViewer';
import {IframeViewer} from './IframeViewer';
import {PDFViewer} from './PDFViewer';
import {getFileExtension, isBrowserImage, isImage, isPDF} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.utils';
import {NoView} from './NoView';

// Appends a rendition selector to a file URL that may or may not already carry a query string.
const withRendition = (fileUrl, rendition) => `${fileUrl}${fileUrl.includes('?') ? '&' : '?'}t=${rendition}`;

/**
 * What the image preview loads. Renditions are PNG, so for a format the browser cannot decode they
 * are the only option and the original must never be used - that is what left TIFF and PSD previews
 * blank. For a format it can decode, the 800px rendition caps the payload (a 12 MB TIFF or a 6000px
 * JPEG is a lot of bytes for a 550px viewport) and the viewer still renders anything smaller at its
 * natural size, so nothing is ever upscaled.
 *
 * Returns null when there is nothing displayable, which the caller turns into a plain icon rather
 * than a broken image.
 */
const getPreviewImageUrl = (node, originalUrl) => {
    if (isBrowserImage(node)) {
        return node.hasThumbnail3 ? withRendition(originalUrl, 'thumbnail3') : originalUrl;
    }

    if (node.hasThumbnail3) {
        return withRendition(originalUrl, 'thumbnail3');
    }

    if (node.hasThumbnail2) {
        return withRendition(originalUrl, 'thumbnail2');
    }

    return node.hasThumbnail ? withRendition(originalUrl, 'thumbnail') : null;
};

export const PreviewViewers = ({data, previewContext, nodeData = null, isFullScreen = false, onContentNotFound, pageCssHtml = ''}) => {
    const isFile = data?.nodeByPath?.lastModified && data?.nodeByPath?.isFile;
    if (isFile) {
        const file = window.contextJsParameters.contextPath + '/files/' + (previewContext.workspace === 'edit' ? 'default' : 'live') + data.nodeByPath.path.replaceAll(/[^/]/g, encodeURIComponent) + (data.nodeByPath.lastModified ? ('?lastModified=' + data.nodeByPath.lastModified.value) : '');
        if (isPDF(data.nodeByPath)) {
            return (
                <div className={styles.previewContainer} data-sel-role="preview-container" data-preview-type="pdf">
                    <PDFViewer file={file} isFullScreen={isFullScreen}/>
                </div>
            );
        }

        if (isImage(data.nodeByPath)) {
            const imageUrl = getPreviewImageUrl(data.nodeByPath, file);
            return imageUrl ? (
                <div className={clsx(styles.previewContainer, styles.mediaContainer)}
                     data-sel-role="preview-container"
                     data-preview-type="image"
                >
                    <ImageViewer
                        alt={decodeURIComponent(data.nodeByPath.path.split('/').pop())}
                        file={imageUrl}
                        isFullScreen={isFullScreen}
                    />
                </div>
            ) : <NoView/>;
        }

        const type = getFileExtension(data.nodeByPath);
        const isMedia = (type === 'webm' || type === 'mp4');
        return (
            <div className={clsx(styles.previewContainer, isMedia && styles.mediaContainer)}
                 data-sel-role="preview-container"
                 data-preview-type={isMedia ? 'media' : 'document'}
            >
                <DocumentViewer file={file} isFullScreen={isFullScreen} type={type}/>
            </div>
        );
    }

    const output = data?.nodeByPath?.renderedContent?.output;
    if (output === '') {
        return <NoView/>;
    }

    return (
        <div className={clsx(styles.previewContainer, styles.contentContainer)}
             data-sel-role="preview-container"
             data-preview-type="content"
        >
            <IframeViewer
                data={data}
                nodeData={nodeData}
                pageCssHtml={pageCssHtml}
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
    pageCssHtml: PropTypes.string,
    onContentNotFound: PropTypes.func.isRequired
};
