import React from 'react';
import {compose, Query} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {lodash as _} from 'lodash';
import {Paper, Typography, withStyles} from '@material-ui/core';
import {previewQuery} from '../gqlQueries';
import {getFileType, isBrowserImage, isPDF} from '../filesGrid/filesGridUtils';
import {CM_DRAWER_STATES, CM_PREVIEW_MODES, cmSetPreviewMode, cmSetPreviewState} from '../redux/actions';
import constants from '../constants';
import loadable from 'react-loadable';
import {DxContext} from '../DxContext';
import classNames from 'classnames';

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

const styles = theme => ({
    root: {
        flex: 1,
        position: 'relative'
    },
    previewContainer: {
        backgroundColor: theme.palette.background.default,
        overflow: 'scroll',
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    noPreviewContainer: {
        backgroundColor: theme.palette.background.default,
        overflow: 'scroll',
        width: '100%',
        height: '100%'
    },
    mediaContainer: {
        backgroundColor: theme.palette.background.dark
    },
    contentContainer: {
        padding: (theme.spacing.unit * 3) + 'px'
    },
    contentPaper: {
        width: '100%',
        height: '100%'
    },
    contentIframe: {
        border: 'none',
        width: '100%',
        height: '100%'
    }
});

class ContentPreview extends React.Component {
    constructor(props) {
        super(props);
        this.refetchPreview = () => {};
    }

    componentDidUpdate(prevProps) {
        if (this.props.selection && prevProps.selection && prevProps.selection.lastPublished !== this.props.selection.lastPublished) {
            this.refetchPreview();
        }
    }

    render() {
        const {selection, classes, previewMode} = this.props;

        if (_.isEmpty(selection)) {
            return this.noPreviewComponent();
        }

        const path = selection.path;
        const livePreviewAvailable = selection.publicationStatus !== constants.availablePublicationStatuses.UNPUBLISHED && selection.publicationStatus !== constants.availablePublicationStatuses.NOT_PUBLISHED;
        return (
            <DxContext.Consumer>
                {dxContext => (
                    <div className={classes.root}>
                        <Query query={previewQuery} errorPolicy="all" variables={this.queryVariables(path, livePreviewAvailable)}>
                            {({loading, data, refetch}) => {
                                this.refetchPreview = refetch;

                                if (!loading) {
                                    if (!_.isEmpty(data)) {
                                        let modes = [CM_PREVIEW_MODES.EDIT];
                                        // Check if the node is published in live.
                                        if (livePreviewAvailable) {
                                            modes.push(CM_PREVIEW_MODES.LIVE);
                                        }
                                        let selectedMode = _.find(modes, mode => {
                                            return previewMode === mode;
                                        }) === undefined ? CM_PREVIEW_MODES.EDIT : previewMode;
                                        return this.previewComponent(data[selectedMode], dxContext);
                                    }
                                }
                                return null;
                            }}
                        </Query>
                    </div>
                )}
            </DxContext.Consumer>
        );
    }

    noPreviewComponent() {
        const {classes, t} = this.props;
        return (
            <div className={classNames(classes.noPreviewContainer, classes.contentContainer)}>
                <Paper elevation={1} className={classes.contentContainer} classes={{root: classes.contentPaper}}>
                    <Typography variant="h5">
                        {t('label.contentManager.contentPreview.noViewAvailable')}
                    </Typography>
                </Paper>
            </div>
        );
    }

    previewComponent(data, dxContext) {
        const {classes, t, previewMode, previewState} = this.props;
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
                    <iframe ref={element => this.iframeLoadContent(assets, displayValue, element)} className={classes.contentIframe}/>
                </Paper>
            </div>
        );
    }

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

    queryVariables(path, isPublished) {
        return {
            path: path,
            templateType: 'html',
            view: 'cm',
            contextConfiguration: 'preview',
            language: this.props.language,
            isPublished: isPublished
        };
    }
}

const mapStateToProps = state => {
    return {
        previewMode: state.previewMode,
        previewState: state.previewState,
        language: state.language
    };
};

const mapDispatchToProps = dispatch => ({
    setPreviewMode: mode => {
        dispatch(cmSetPreviewMode(mode));
    },
    setPreviewState: state => {
        dispatch(cmSetPreviewState(state));
    }
});

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentPreview);
