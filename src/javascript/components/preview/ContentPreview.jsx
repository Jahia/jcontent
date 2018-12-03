import React from 'react';
import {compose, Query} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {lodash as _} from 'lodash';
import {IconButton, Paper, Tooltip, Typography, withStyles} from '@material-ui/core';
import {CloudDownload} from '@material-ui/icons';
import {buttonRenderer, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import {previewQuery} from '../gqlQueries';
import PublicationInfo from './PublicationStatus';
import ShareMenu from './ShareMenu';
import {getFileType, isBrowserImage, isPDF} from '../filesGrid/filesGridUtils';
import {CM_DRAWER_STATES, cmSetPreviewMode, cmSetPreviewState} from '../redux/actions';
import {ellipsizeText} from '../utils.js';
import constants from '../constants';
import loadable from 'react-loadable';
import {DxContext} from '../DxContext';

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
        transition: 'width 0.3s ease-in 0s',
        width: 550
    },
    rootFullWidth: {
        width: '100vw',
        transition: 'width 0.3s ease-in 0s'
    },
    button: {
        margin: theme.spacing.unit
    },
    previewPaper: {
        flex: 9,
        width: '550',
        position: 'relative'
    },
    previewContainer: {
        // MaxHeight: 1150, //Fix scroll issue on firefox TODO find better solution, only works for 25 results
        width: 550,
        backgroundColor: theme.palette.common.white,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
        height: 'calc(100vh - 155px)',
        border: 'none'
    },
    previewContainerFullScreen: {
        width: '100vw',
        backgroundColor: theme.palette.common.white,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
        height: 'calc(100vh - 28px)',
        border: 'none'
    },
    previewContainerPdf: {
        // MaxHeight: 1150, //Fix scroll issue on firefox TODO find better solution, only works for 25 results
        width: '100%',
        maxHeight: 'calc(100vh - 330px);',
        color: theme.palette.background.default,
        backgroundColor: theme.palette.common.white,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll'
    },
    previewContainerFullScreenPdf: {
        width: '100vw',
        color: theme.palette.background.default,
        backgroundColor: theme.palette.common.white,
        overflow: 'scroll',
        height: 'calc(100vh - 203px)'
    },
    unpublishButton: {
        margin: '0 !important',
        marginRight: '8px !important',
        display: 'flex',
        height: 36,
        maxHeight: 36
    },
    controlsPaperEdit: {
        position: 'absolute',
        left: '0',
        bottom: '0',
        width: '100%'
    },
    controlsPaperLive: {
        position: 'absolute',
        left: '0',
        bottom: '0',
        width: '100%',
        textAlign: 'center'
    },
    titleBar: {
    },
    contentTitle: {
        textAlign: 'left',
        fontSize: '27px',
        maxWidth: 360,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        paddingLeft: theme.spacing.unit,
        fontWeight: 100
    },
    contentSubTitle: {
        color: theme.palette.background.default,
        paddingLeft: theme.spacing.unit,
        fontSize: '18px',
        fontWeight: 100
    },
    drawerWidth: {
        boxShadow: 'none',
        backgroundColor: theme.palette.common.white,
        height: 'calc(100vh - ' + theme.contentManager.topBarHeight + 'px)',
        overflow: 'hidden !important',
        maxHeight: 'calc(100vh - ' + theme.contentManager.topBarHeight + 'px)'
    },
    drawerRoot: {
        top: String(theme.contentManager.topBarHeight) + 'px !important',
        overflow: 'hidden !important',
        right: '24px !important'
    },
    footerGrid: {
        minHeight: '208px',
        maxHeight: '208px',
        backgroundColor: '#e8ebed',
        padding: '0px !important'
    },
    footerButton: {
        textAlign: 'right'
    },
    colorIcon: {
        marginTop: 6,
        color: '#303030'
    },
    gridUnpublish: {
        marginTop: Number(theme.spacing.unit),
        marginBottom: Number(theme.spacing.unit)
    },
    paddingButton: {
        // Padding: '12px'
    },
    lockButton: {
        textAlign: 'left'
    },
    lockButtonLive: {
        padding: '12px',
        height: '48px !important',
        width: '48px !important'
    },
    lockIcon: {
        color: '#007CB0'
    },
    unlockIcon: {
        color: '#E67D3A'
    }
});

class ContentPreview extends React.Component {
    render() {
        if (_.isEmpty(this.props.selection)) {
            return null;
        }

        const {selection, classes, previewMode} = this.props;
        const selectedItem = selection[0];
        const path = selectedItem ? selectedItem.path : '';
        const livePreviewAvailable = selectedItem.publicationStatus === constants.availablePublicationStatuses.PUBLISHED || selectedItem.publicationStatus === constants.availablePublicationStatuses.MODIFIED;
        const rootClass = (previewMode === CM_DRAWER_STATES.FULL_SCREEN) ? classes.rootFullWidth : classes.root;
        return (
            <DxContext.Consumer>
                {dxContext => (
                    <div className={rootClass}>
                        <Paper className={classes.previewPaper} elevation={0}>
                            <Query query={previewQuery} errorPolicy="all" variables={this.queryVariables(path, livePreviewAvailable)}>
                                {({loading, error, data}) => {
                                    if (error) {
                                        // Ignore error that occurs if node is not published in live mode.
                                    }
                                    if (!loading) {
                                        if (!_.isEmpty(data)) {
                                            let modes = ['edit'];
                                            // Check if the node is published in live.
                                            if (livePreviewAvailable) {
                                                modes.push('live');
                                            }
                                            let selectedMode = _.find(modes, mode => {
                                                return previewMode === mode;
                                            }) === undefined ? 'edit' : previewMode;
                                            return this.previewComponent(data[selectedMode], dxContext);
                                        }
                                    }
                                    return null;
                                }}
                            </Query>
                        </Paper>
                        <Paper
                            className={previewMode === 'live' ? classes.controlsPaperLive : classes.controlsPaperEdit}
                            elevation={0}
                            >
                            {this.componentFooter(dxContext)}
                        </Paper>
                    </div>
                )}
            </DxContext.Consumer>
        );
    }

    componentFooter(dxContext) {
        let {classes, previewMode, selection} = this.props;
        let selectedItem = selection[0];

        let workspace = 'default';
        let leftButtons = <DisplayActions target="previewFooterActions" context={{path: selectedItem.path}} render={iconButtonRenderer({className: classes.lockIcon})}/>;
        let rightButtons = (
            <React.Fragment>
                <DisplayActions target="editPreviewBar" context={{path: selectedItem.path}} render={buttonRenderer({variant: 'contained', color: 'primary'})}/>
                <DisplayActions target="editAdditionalMenu" context={{path: selectedItem.path}} render={iconButtonRenderer({className: classes.lockIcon})}/>
            </React.Fragment>
        );

        if (previewMode === 'live') {
            workspace = previewMode;
            leftButtons = <IconButton className={classes.lockButtonLive}/>;
            rightButtons = <DisplayActions target="livePreviewBar" context={{path: selectedItem.path}} render={buttonRenderer({variant: 'contained', color: 'primary'})}/>;
        }

        return (
            <div className={classes.footerGrid}>
                <div>
                    <Typography variant="h5" data-cm-role="preview-name">
                        {this.ellipsisText(selectedItem.displayName ? selectedItem.displayName : selectedItem.name)}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2">
                        <PublicationInfo/>
                    </Typography>
                </div>
                <div>{leftButtons}
                    {selectedItem.type === 'File' && this.downloadButton(selectedItem, workspace, dxContext)}
                    <ShareMenu/>
                    {rightButtons}
                </div>
            </div>
        );
    }

    previewComponent(data, dxContext) {
        const {classes, t, previewMode} = this.props;
        const fullScreen = (previewMode === CM_DRAWER_STATES.FULL_SCREEN);
        let displayValue = data && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.output : '';
        if (displayValue === '') {
            displayValue = t('label.contentManager.contentPreview.noViewAvailable');
        }

        // If node type is "jnt:file" use pdf viewer
        if (data && data.nodeByPath.isFile) {
            let file = dxContext.contextPath + '/files/' + (previewMode === 'edit' ? 'default' : 'live') + data.nodeByPath.path + '?lastModified=' + data.nodeByPath.lastModified.value;

            if (isPDF(data.nodeByPath.path)) {
                return (
                    <div className={fullScreen ? classes.previewContainerFullScreenPdf : classes.previewContainerPdf}>
                        <PDFViewer file={file} fullScreen={fullScreen}/>
                    </div>
                );
            }

            if (isBrowserImage(data.nodeByPath.path)) {
                return (
                    <div className={fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}>
                        <ImageViewer file={file} fullScreen={fullScreen}/>
                    </div>
                );
            }

            let type = getFileType(file);
            return (
                <div className={fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}>
                    <DocumentViewer file={file} type={type}/>
                </div>
            );
        }

        const assets = data && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.staticAssets : [];
        return (
            <React.Fragment>
                <iframe id="previewContent" className={fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}/>
                {this.iframeLoadContent(assets, displayValue)}
            </React.Fragment>
        );
    }

    iframeLoadContent(assets, displayValue) {
        setTimeout(() => {
            let iframe = document.getElementById('previewContent');
            let frameDoc = iframe.document;
            if (iframe.contentWindow) {
                frameDoc = iframe.contentWindow.document;
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
        }, 200);
        return null;
    }

    downloadButton(selectedItem, workspace, dxContext) {
        let {classes, t} = this.props;

        if (isBrowserImage(selectedItem.path) || isPDF(selectedItem.path)) {
            return (
                <a
                    className={classes.colorIcon}
                    target="_blank" rel="noopener noreferrer"
                    href={`${dxContext.contextPath}/files/${workspace}${selectedItem.path}`}
                    >
                    <Tooltip title={t('label.contentManager.contentPreview.download')}>
                        <CloudDownload/>
                    </Tooltip>
                </a>
            );
        }
        return (
            <a
                download
                className={classes.colorIcon}
                href={`${dxContext.contextPath}/files/${workspace}${selectedItem.path}`}
                >
                <Tooltip title={t('label.contentManager.contentPreview.download')}>
                    <CloudDownload/>
                </Tooltip>
            </a>
        );
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

    ellipsisText(text) {
        return ellipsizeText(text, 50);
    }
}

const mapStateToProps = state => {
    return {
        selection: state.selection,
        previewMode: state.previewMode,
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
