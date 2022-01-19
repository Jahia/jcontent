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

const iframeLoadContent = ({assets, displayValue, element, domLoadedCallback, iFrameStyle}) => {
    if (element) {
        let frameDoc = element.document;
        if (element.contentWindow) {
            frameDoc = element.contentWindow.document;
        }

        frameDoc.open();
        frameDoc.close();
        frameDoc.body.innerHTML = displayValue;
        frameDoc.body.setAttribute('style', iFrameStyle);

        if (assets !== null) {
            let iframeHeadEl = frameDoc.getElementsByTagName('head')[0];
            if (!iframeHeadEl) {
                frameDoc.getElementsByTagName('html')[0].insertBefore(frameDoc.createElement('head'), frameDoc.body);
                iframeHeadEl = frameDoc.getElementsByTagName('head')[0];
            }

            assets.forEach(asset => {
                let linkEl = document.createElement('link');
                linkEl.setAttribute('rel', 'stylesheet');
                linkEl.setAttribute('type', 'text/css');
                linkEl.setAttribute('href', asset.key);
                iframeHeadEl.appendChild(linkEl);
            });
        }

        if (domLoadedCallback) {
            domLoadedCallback(frameDoc);
        }
    }
};

function getFile(workspace, data) {
    return window.contextJsParameters.contextPath + '/files/' + (workspace === 'edit' ? 'default' : 'live') + data.nodeByPath.path.replace(/[^/]/g, encodeURIComponent) + (data.nodeByPath.lastModified ? ('?lastModified=' + data.nodeByPath.lastModified.value) : '');
}

const PreviewComponentCmp = ({data, workspace, fullScreen, domLoadedCallback, iFrameStyle, iframeProps}) => {
    const {t} = useTranslation();

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
