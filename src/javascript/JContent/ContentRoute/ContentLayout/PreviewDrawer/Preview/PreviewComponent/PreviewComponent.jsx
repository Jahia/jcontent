import React from 'react';
import PropTypes from 'prop-types';
import {getFileType, isBrowserImage, isPDF} from '../../../ContentLayout.utils';
import classNames from 'classnames';
import {Paper, withStyles} from '@material-ui/core';
import DocumentViewer from './DocumentViewer';
import PDFViewer from './PDFViewer';
import ImageViewer from './ImageViewer';
import {compose} from '~/utils';
import {useTranslation} from 'react-i18next';

const styles = theme => ({
    previewContainer: {
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 0,
        backgroundColor: theme.palette.background.default
    },
    noPreviewContainer: {
        flex: '1 1 0%',
        backgroundColor: theme.palette.background.default,
        display: 'flex'
    },
    center: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        color: theme.palette.text.disabled
    },
    centerIcon: {
        margin: '8 auto'
    },
    mediaContainer: {
        backgroundColor: theme.palette.background.dark
    },
    contentContainer: {
        padding: (theme.spacing.unit * 3) + 'px'
    },
    contentPaper: {
        width: '100%',
        height: '100%',
        display: 'flex'
    },
    contentIframe: {
        border: 'none',
        width: '100%',
        height: '100%'
    }
});

const iframeLoadContent = (assets, displayValue, element, domLoadedCallback, iFrameStyle) => {
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

const PreviewComponentCmp = ({classes, data, workspace, fullScreen, domLoadedCallback, iFrameStyle, iframeProps}) => {
    const {t} = useTranslation();

    let displayValue = data && data.nodeByPath && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.output : '';
    if (displayValue === '') {
        displayValue = t('jcontent:label.contentManager.contentPreview.noViewAvailable');
    }

    // If node type is "jnt:file" use specific viewer
    if (data && data.nodeByPath && data.nodeByPath.lastModified && data.nodeByPath.isFile) {
        let file = window.contextJsParameters.contextPath + '/files/' + (workspace === 'edit' ? 'default' : 'live') + data.nodeByPath.path.replace(/[^/]/g, encodeURIComponent) + (data.nodeByPath.lastModified ? ('?lastModified=' + data.nodeByPath.lastModified.value) : '');
        if (isPDF(data.nodeByPath.path)) {
            return (
                <div className={classes.previewContainer} data-sel-role="preview-type-pdf">
                    <PDFViewer file={file} fullScreen={fullScreen}/>
                </div>
            );
        }

        if (isBrowserImage(data.nodeByPath.path)) {
            return (
                <div className={classNames(classes.previewContainer, classes.mediaContainer)}
                     data-sel-role="preview-type-image"
                >
                    <ImageViewer file={file} fullScreen={fullScreen}/>
                </div>
            );
        }

        const type = getFileType(data.nodeByPath.path);
        const isMedia = (type === 'avi' || type === 'mp4' || type === 'video');
        return (
            <div className={classNames(classes.previewContainer, isMedia && classes.mediaContainer)}
                 data-sel-role="preview-type-document"
            >
                <DocumentViewer file={file} type={type} fullScreen={fullScreen}/>
            </div>
        );
    }

    const assets = data && data.nodeByPath && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.staticAssets : [];
    return (
        <div className={classNames(classes.previewContainer, classes.contentContainer)}
             data-sel-role="preview-type-content"
        >
            <Paper elevation={1} classes={{root: classes.contentPaper}}>
                <iframe key={data && data.nodeByPath ? data.nodeByPath.path : 'NoPreviewAvailable'}
                        ref={element => iframeLoadContent(assets, displayValue, element, domLoadedCallback, iFrameStyle)}
                        data-sel-role={workspace + '-preview-frame'}
                        className={classes.contentIframe}
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
    classes: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    workspace: PropTypes.string.isRequired,
    // eslint-disable-next-line react/boolean-prop-naming
    fullScreen: PropTypes.bool,
    domLoadedCallback: PropTypes.func,
    iFrameStyle: PropTypes.string,
    iframeProps: PropTypes.object
};

const PreviewComponent = compose(
    withStyles(styles)
)(PreviewComponentCmp);

export default PreviewComponent;
