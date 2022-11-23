import React from 'react';
import PropTypes from 'prop-types';
import {getFileType, isBrowserImage, isPDF} from '../../../ContentLayout.utils';
import classNames from 'clsx';
import {Paper} from '@material-ui/core';
import DocumentViewer from './DocumentViewer';
import PDFViewer from './PDFViewer';
import ImageViewer from './ImageViewer';
import {useTranslation} from 'react-i18next';
import styles from './PreviewComponent.scss';

function writeInIframe(html, iframeWindow, iFrameStyle) {
    return new Promise((resolve, reject) => {
        iframeWindow.document.open();
        iframeWindow.onload = resolve;
        iframeWindow.onerror = reject;
        iframeWindow.document.write(html);
        iframeWindow.document.body.setAttribute('style', iFrameStyle);
        iframeWindow.document.close();
    });
}

function loadAsset(asset, iframeHeadEl) {
    return new Promise(resolve => {
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.type = 'text/css';
        linkEl.href = asset.key;
        linkEl.onload = resolve;

        iframeHeadEl.appendChild(linkEl);
    });
}

function loadAssets(assets, iframeDocument) {
    if (!assets || assets.length === 0) {
        return Promise.resolve();
    }

    let iframeHeadEl = iframeDocument.getElementsByTagName('head')[0];
    if (!iframeHeadEl) {
        iframeDocument.getElementsByTagName('html')[0].insertBefore(iframeDocument.createElement('head'), iframeDocument.body);
        iframeHeadEl = iframeDocument.getElementsByTagName('head')[0];
    }

    return Promise.all(assets.map(asset => loadAsset(asset, iframeHeadEl)));
}

const iframeLoadContent = ({assets, displayValue, element, domLoadedCallback, iFrameStyle}) => {
    if (element) {
        const iframeWindow = element.contentWindow || element;

        writeInIframe(displayValue, iframeWindow, iFrameStyle)
            .then(() => {
                iframeWindow.document.body.setAttribute('style', 'pointer-events: none');
            })
            .then(() => {
                return loadAssets(assets, iframeWindow.document);
            })
            .catch(err => console.error('Error in the preview', err));

        if (domLoadedCallback) {
            domLoadedCallback(iframeWindow.document);
        }
    }
};

function getFile(workspace, data) {
    return window.contextJsParameters.contextPath + '/files/' + (workspace === 'edit' ? 'default' : 'live') + data.nodeByPath.path.replace(/[^/]/g, encodeURIComponent) + (data.nodeByPath.lastModified ? ('?lastModified=' + data.nodeByPath.lastModified.value) : '');
}

const PreviewComponentCmp = ({data, workspace, fullScreen, domLoadedCallback, iFrameStyle, iframeProps}) => {
    const {t} = useTranslation('jcontent');

    let displayValue = data && data.nodeByPath && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.output : '';
    if (displayValue === '') {
        displayValue = t('jcontent:label.contentManager.contentPreview.noViewAvailable');
    }

    // If node type is "jnt:file" use specific viewer
    if (data && data.nodeByPath && data.nodeByPath.lastModified && data.nodeByPath.isFile) {
        let file = getFile(workspace, data);
        if (isPDF(data.nodeByPath.path)) {
            return (
                <div className={styles.previewContainer} data-sel-role="preview-type-pdf">
                    <PDFViewer file={file} isFullScreen={fullScreen}/>
                </div>
            );
        }

        if (isBrowserImage(data.nodeByPath.path)) {
            return (
                <div className={classNames(styles.previewContainer, styles.mediaContainer)}
                     data-sel-role="preview-type-image"
                >
                    <ImageViewer file={file} isFullScreen={fullScreen}/>
                </div>
            );
        }

        const type = getFileType(data.nodeByPath.path);
        // Media compatible with react-file-viewer
        const isMedia = (type === 'mp4' || type === 'webm');
        return (
            <div className={classNames(styles.previewContainer, isMedia && styles.mediaContainer)}
                 data-sel-role="preview-type-document"
            >
                <DocumentViewer file={file} type={type} isFullScreen={fullScreen}/>
            </div>
        );
    }

    const assets = data && data.nodeByPath && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.staticAssets : [];
    return (
        <div className={classNames(styles.previewContainer, styles.contentContainer)}
             data-sel-role="preview-type-content"
        >
            <Paper elevation={1} classes={{root: styles.contentPaper}}>
                <iframe key={data && data.nodeByPath ? data.nodeByPath.path : 'NoPreviewAvailable'}
                        ref={element => iframeLoadContent({assets, displayValue, element, domLoadedCallback, iFrameStyle})}
                        data-sel-role={workspace + '-preview-frame'}
                        className={styles.contentIframe}
                        {...iframeProps}
                />
            </Paper>
        </div>
    );
};

PreviewComponentCmp.defaultProps = {
    fullScreen: false,
    domLoadedCallback: null,
    iFrameStyle: '',
    iframeProps: {}
};

PreviewComponentCmp.propTypes = {
    data: PropTypes.object.isRequired,
    workspace: PropTypes.string.isRequired,
    // eslint-disable-next-line react/boolean-prop-naming
    fullScreen: PropTypes.bool,
    domLoadedCallback: PropTypes.func,
    iFrameStyle: PropTypes.string,
    iframeProps: PropTypes.object
};

const PreviewComponent = PreviewComponentCmp;

export default PreviewComponent;
