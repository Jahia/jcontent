import React from 'react';
import {compose, Query} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {lodash as _} from 'lodash';
import {Grid, IconButton, Paper, Tooltip, withStyles} from '@material-ui/core';
import {CloudDownload, Fullscreen, FullscreenExit} from '@material-ui/icons';
import {buttonRenderer, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import {previewQuery} from '../gqlQueries';
import PublicationInfo from './PublicationStatus';
import ShareMenu from './ShareMenu';
import {getFileType, isBrowserImage, isPDF} from '../filesGrid/filesGridUtils';
import {CM_PREVIEW_STATES, cmSetPreviewMode, cmSetPreviewModes, cmSetPreviewState} from '../redux/actions';
import {ellipsizeText} from '../utils.js';
import constants from '../constants';
import loadable from 'react-loadable';

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
        margin: '0!important',
        marginRight: '8px!important',
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
        position: 'fixed',
        left: '0',
        bottom: '0',
        width: '100%',
        textAlign: 'center'
    },
    titleBar: {
        color: theme.palette.background.default,
        paddingBottom: '0px'
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
        height: 'calc(100vh - 140px)',
        overflow: 'hidden!important',
        maxHeight: 'calc(100vh - 140px)'
    },
    drawerRoot: {
        top: '140px!important',
        overflow: 'hidden!important',
        right: '24px!important'
    },
    footerGrid: {
        backgroundColor: '#e8ebed',
        padding: '0px!important'
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
        height: '48px!important',
        width: '48px!important'
    },
    lockIcon: {
        color: '#007CB0'
    },
    unlockIcon: {
        color: '#E67D3A'
    }
});

class ContentPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fullScreen: false,
            imageControlElementId: 'previewImageControls'
        };
        this.handleDialogState = this.handleDialogState.bind(this);
    }

    handleDialogState() {
        this.setState(state => ({
            fullScreen: !state.fullScreen
        }));
    }

    componentDidUpdate() {
        if (this.props.selection[0] === undefined) {
            this.props.setPreviewState(CM_PREVIEW_STATES.HIDE);
        }
    }

    render() {
        if (_.isEmpty(this.props.selection)) {
            return null;
        }

        const {selection, classes, previewMode, previewModes, setPreviewMode, setPreviewModes} = this.props;
        const selectedItem = selection[0];
        const path = selectedItem ? selectedItem.path : '';
        const livePreviewAvailable = selectedItem.publicationStatus === constants.availablePublicationStatuses.PUBLISHED || selectedItem.publicationStatus === constants.availablePublicationStatuses.MODIFIED;
        const rootClass = this.state.fullScreen ? classes.rootFullWidth : classes.root;
        return (
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
                                }) !== undefined ? previewMode : 'edit';
                                if (previewModes.length !== modes.length) {
                                    setPreviewMode(selectedMode);
                                    setPreviewModes(modes);
                                }
                                return this.previewComponent(data[selectedMode]);
                            }
                        }
                        return null;
                    }}
                    </Query>
                </Paper>
                <Paper className={previewMode === 'live' ? classes.controlsPaperLive : classes.controlsPaperEdit}
                    elevation={0}
                    >
                    {this.componentFooter()}
                </Paper>
            </div>
        );
    }

    componentFooter() {
        let {classes, previewMode, selection, handleFullScreen} = this.props;
        let selectedItem = selection[0];

        let workspace = 'default';
        let leftButtons = <DisplayActions target="previewFooterActions" context={{path: selectedItem.path}} render={iconButtonRenderer({className: classes.lockIcon})}/>;
        let rightButtons = (
            <React.Fragment>
                <DisplayActions target="editPreviewBar" context={{path: selectedItem.path}} render={buttonRenderer({variant: 'contained', color: 'primary'})}/>
                <DisplayActions target="editAdditionalMenu" context={{path: selectedItem.path}} render={iconButtonRenderer({className: classes.lockIcon})}/>
            </React.Fragment>);
        if (previewMode === 'live') {
            workspace = previewMode;
            leftButtons = <IconButton className={classes.lockButtonLive}/>;
            rightButtons = <DisplayActions target="livePreviewBar" context={{path: selectedItem.path}} render={buttonRenderer({variant: 'contained', color: 'primary'})}/>;
        }

        return (
            <Grid container spacing={0} className={classes.footerGrid}>
                <Grid container spacing={0}>
                    <Grid container item xs={8} className={classes.titleBar}>
                        <div className={classes.contentTitle}>
                            {this.ellipsisText(selectedItem.displayName ? selectedItem.displayName : selectedItem.name)}
                        </div>
                    </Grid>
                    <Grid container item xs={4} justify="flex-end" className={classes.footerButton}>
                        {selectedItem.type === 'File' && this.downloadButton(selectedItem, workspace)}
                        <ShareMenu/>
                        {this.screenModeButtons(handleFullScreen, classes)}
                    </Grid>
                </Grid>

                <Grid container item xs={12}>
                    <div className={classes.contentSubTitle}>
                        <PublicationInfo/>
                    </div>
                </Grid>

                <Grid container item xs={12}>
                    {/* Element that will contain image controls if an image is the document being previewed */}
                    <div id={this.state.imageControlElementId} style={{background: 'transparent'}}/>
                </Grid>

                <Grid item xs={4} className={classes.lockButton}>
                    {leftButtons}
                </Grid>
                <Grid item container xs={8} justify="flex-end">
                    {rightButtons}
                </Grid>
            </Grid>
        );
    }

    previewComponent(data) {
        const {classes, t, dxContext, previewMode} = this.props;

        let displayValue = data && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.output : '';
        if (displayValue === '') {
            displayValue = t('label.contentManager.contentPreview.noViewAvailable');
        }

        // If node type is "jnt:file" use pdf viewer
        if (data && data.nodeByPath.isFile) {
            let file = dxContext.contextPath + '/files/' + (previewMode === 'edit' ? 'default' : 'live') + data.nodeByPath.path + '?lastModified=' + data.nodeByPath.lastModified.value;

            if (isPDF(data.nodeByPath.path)) {
                return (
                    <div className={this.state.fullScreen ? classes.previewContainerFullScreenPdf : classes.previewContainerPdf}>
                        <PDFViewer key={data.nodeByPath.uuid} file={file} fullScreen={this.state.fullScreen}/>
                    </div>
                );
            }

            if (isBrowserImage(data.nodeByPath.path)) {
                return (
                    <div className={this.state.fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}>
                        <ImageViewer key={data.nodeByPath.uuid} file={file} fullScreen={this.state.fullScreen}/>
                    </div>
                );
            }

            let type = getFileType(file);
            return (
                <div className={this.state.fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}>
                    <DocumentViewer file={file} type={type}/>
                </div>
            );
        }

        const assets = data && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.staticAssets : [];
        return (
            <React.Fragment>
                <iframe id="previewContent" className={this.state.fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}/>
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

    downloadButton(selectedItem, workspace) {
        let {classes, dxContext, t} = this.props;

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
            <a download
                className={classes.colorIcon}
                href={`${dxContext.contextPath}/files/${workspace}${selectedItem.path}`}
                >
                <Tooltip title={t('label.contentManager.contentPreview.download')}>
                    <CloudDownload/>
                </Tooltip>
            </a>
        );
    }

    screenModeButtons(handleFullScreen, classes) {
        const {t} = this.props;
        handleFullScreen(this.state.fullScreen);

        if (this.state.fullScreen) {
            return (
                <Tooltip title={t('label.contentManager.contentPreview.collapse')}>
                    <FullscreenExit className={classes.colorIcon} onClick={this.handleDialogState}/>
                </Tooltip>
            );
        }
        return (
            <Tooltip title={t('label.contentManager.contentPreview.expand')}>
                <Fullscreen className={classes.colorIcon} onClick={this.handleDialogState}/>
            </Tooltip>
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
        previewModes: state.previewModes,
        language: state.language
    };
};

const mapDispatchToProps = dispatch => ({
    setPreviewMode: mode => {
        dispatch(cmSetPreviewMode(mode));
    },
    setPreviewModes: modes => {
        dispatch(cmSetPreviewModes(modes));
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
