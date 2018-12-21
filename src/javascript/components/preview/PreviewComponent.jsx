import loadable from 'react-loadable';
import React from 'react';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES} from '../redux/actions';
import {getFileType, isBrowserImage, isPDF} from '../filesGrid/filesGridUtils';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';

const DocumentViewer = loadable({
    loader: () => import('./filePreviewer/DocumentViewer'),
    loading: () => <div/>
});
const PDFViewer = loadable({
    loader: () => import('./filePreviewer/PDFViewer'),
    loading: () => <div/>
});
const ImageViewer = loadable({
    loader: () => import('./filePreviewer/ImageViewer'),
    loading: () => <div/>
});

export class PreviewComponent extends React.Component {
    iframeLoadContent(assets, displayValue, element) {
        if (element) {
            let frameDoc = element.document;
            if (element.contentWindow) {
                frameDoc = element.contentWindow.document;
            }
            frameDoc.open();
            frameDoc.writeln(displayValue);
            frameDoc.close();
            if (assets !== null) {
                let iframeHeadEl = frameDoc.getElementsByTagName('head')[0];
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
        let displayValue = data && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.output : '';
        if (displayValue === '') {
            displayValue = t('label.contentManager.contentPreview.noViewAvailable');
        }

        // If node type is "jnt:file" use specific viewer
        if (data && data.nodeByPath.isFile) {
            let file = dxContext.contextPath + '/files/' + (previewMode === CM_PREVIEW_MODES.EDIT ? 'default' : 'live') + data.nodeByPath.path + '?lastModified=' + data.nodeByPath.lastModified.value;

            if (isPDF(data.nodeByPath.path)) {
                return (
                    <div className={classes.previewContainer}>
                        <PDFViewer file={file} fullScreen={fullScreen}/>
                    </div>
                );
            }

            if (isBrowserImage(data.nodeByPath.path)) {
                return (
                    <div className={classNames(classes.previewContainer, classes.mediaContainer)}>
                        <ImageViewer file={file} fullScreen={fullScreen}/>
                    </div>
                );
            }

            const type = getFileType(data.nodeByPath.path);
            const isMedia = (type === 'avi' || type === 'mp4' || type === 'video');
            return (
                <div className={classNames(classes.previewContainer, isMedia && classes.mediaContainer)}>
                    <DocumentViewer file={file} type={type} fullScreen={fullScreen}/>
                </div>
            );
        }

        const assets = data && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.staticAssets : [];
        return (
            <div className={classNames(classes.previewContainer, classes.contentContainer)}>
                <Paper elevation={1} classes={{root: classes.contentPaper}}>
                    <iframe ref={element => this.iframeLoadContent(assets, displayValue, element)}
                            className={classes.contentIframe}/>
                </Paper>
            </div>
        );
    }
}
