import React from 'react';
import PropTypes from 'prop-types';
import loadable from 'react-loadable';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES} from '../../../../../ContentManager.redux-actions';
import {getFileType, isBrowserImage, isPDF} from '../../../FilesGrid/FilesGrid.utils';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';

const DocumentViewer = loadable({
    loader: () => import('./DocumentViewer'),
    loading: () => <div/>
});
const PDFViewer = loadable({
    loader: () => import('./PDFViewer'),
    loading: () => <div/>
});
const ImageViewer = loadable({
    loader: () => import('./ImageViewer'),
    loading: () => <div/>
});

class PreviewComponent extends React.Component {
    iframeLoadContent(assets, displayValue, element) {
        if (element) {
            let frameDoc = element.document;
            if (element.contentWindow) {
                frameDoc = element.contentWindow.document;
            }
            frameDoc.open();
            frameDoc.close();
            frameDoc.body.innerHTML = displayValue;
            frameDoc.body.style = '';
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
        }
    }

    render() {
        let {data, dxContext, classes, t, previewMode, previewState} = this.props;
        const fullScreen = (previewState === CM_DRAWER_STATES.FULL_SCREEN);
        let displayValue = data && data.nodeByPath && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.output : '';
        if (displayValue === '') {
            displayValue = t('label.contentManager.contentPreview.noViewAvailable');
        }

        // If node type is "jnt:file" use specific viewer
        if (data && data.nodeByPath && data.nodeByPath.isFile) {
            let file = dxContext.contextPath + '/files/' + (previewMode === CM_PREVIEW_MODES.EDIT ? 'default' : 'live') + data.nodeByPath.path + '?lastModified=' + data.nodeByPath.lastModified.value;

            if (isPDF(data.nodeByPath.path)) {
                return (
                    <div className={classes.previewContainer} data-cm-role="preview-type-pdf">
                        <PDFViewer file={file} fullScreen={fullScreen}/>
                    </div>
                );
            }

            if (isBrowserImage(data.nodeByPath.path)) {
                return (
                    <div className={classNames(classes.previewContainer, classes.mediaContainer)} data-cm-role="preview-type-image">
                        <ImageViewer file={file} fullScreen={fullScreen}/>
                    </div>
                );
            }

            const type = getFileType(data.nodeByPath.path);
            const isMedia = (type === 'avi' || type === 'mp4' || type === 'video');
            return (
                <div className={classNames(classes.previewContainer, isMedia && classes.mediaContainer)} data-cm-role="preview-type-video">
                    <DocumentViewer file={file} type={type} fullScreen={fullScreen}/>
                </div>
            );
        }

        const assets = data && data.nodeByPath && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.staticAssets : [];
        return (
            <div className={classNames(classes.previewContainer, classes.contentContainer)} data-cm-role="preview-type-content">
                <Paper elevation={1} classes={{root: classes.contentPaper}}>
                    <iframe key={data && data.nodeByPath ? data.nodeByPath.path : 'NoPreviewAvailable'}
                            ref={element => this.iframeLoadContent(assets, displayValue, element)}
                            className={classes.contentIframe}
                            data-cm-role={previewMode + '-preview-frame'}/>
                </Paper>
            </div>
        );
    }
}

PreviewComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    dxContext: PropTypes.object.isRequired,
    previewMode: PropTypes.string.isRequired,
    previewState: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired
};

export default PreviewComponent;
