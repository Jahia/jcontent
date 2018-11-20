import React from 'react';
import PropTypes from 'prop-types';
import {Query} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import Loadable from "react-loadable";
import _ from "lodash";
import {Grid, IconButton, Paper, Tooltip, withStyles} from '@material-ui/core';
import {CloudDownload, Fullscreen, FullscreenExit} from "@material-ui/icons";
import {previewQuery} from "../gqlQueries";
import {getFileType, isBrowserImage, isPDF} from "../filesGrid/filesGridUtils";
import {CM_PREVIEW_STATES, cmSetPreviewMode, cmSetPreviewModes, cmSetPreviewState} from "../redux/actions";
import constants from '../constants';
import ContentPreviewFooter from './footer/ContentPreviewFooter';

const styles = theme => ({
    root: {
        transition: "width 0.3s ease-in 0s",
        width: 550,
    },
    rootFullWidth: {
        width: '100vw',
        transition: "width 0.3s ease-in 0s",
    },
    button: {
        margin: theme.spacing.unit
    },
    previewPaper: {
        flex: 9,
        width: '550',
        position: "relative"
    },
    previewContainer: {
        // maxHeight: 1150, //Fix scroll issue on firefox TODO find better solution, only works for 25 results
        width: 550,
        backgroundColor: theme.palette.common.white,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
        height: 'calc(100vh - 155px)',
        border: "none"
    },
    previewContainerFullScreen: {
        width: '100vw',
        backgroundColor: theme.palette.common.white,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
        height: 'calc(100vh - 28px)',
        border: "none"
        },
    previewContainerPdf: {
        // maxHeight: 1150, //Fix scroll issue on firefox TODO find better solution, only works for 25 results
        width: '100%',
        maxHeight: 'calc(100vh - 330px);',
        color: theme.palette.background.default,
        backgroundColor: theme.palette.common.white,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
    },
    previewContainerFullScreenPdf: {
        width: '100vw',
        color: theme.palette.background.default,
        backgroundColor: theme.palette.common.white,
        overflow: 'scroll',
        height: 'calc(100vh - 203px)',
    },
    unpublishButton: {
        margin: '0!important',
        marginRight: '8px!important',
        display: 'flex',
        height: 36,
        maxHeight: 36,
    },
    controlsPaperEdit: {
        position: 'absolute',
        left: '0',
        bottom: '0',
        width: '100%',
    },
    controlsPaperLive: {
        position: 'fixed',
        left: '0',
        bottom: '0',
        width: '100%',
        textAlign: 'center',
    },
    contentTitle: {
        textAlign: 'left',
        fontSize: '27px',
        maxWidth: 360,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        paddingLeft: theme.spacing.unit,
        fontWeight: 100,
    },
    contentSubTitle: {
        color: theme.palette.background.default,
        paddingLeft: theme.spacing.unit,
        fontSize: '18px',
        fontWeight: 100,
    },
    drawerWidth: {
        boxShadow: 'none',
        backgroundColor: theme.palette.common.white,
        height: 'calc(100vh - 140px)',
        overflow: 'hidden!important',
        maxHeight: 'calc(100vh - 140px)',
    },
    drawerRoot: {
        top: '140px!important',
        overflow: 'hidden!important',
        right: '24px!important',
    },
    colorIcon: {
        marginTop: 6,
        color: '#303030'
    },
    gridUnpublish: {
        marginTop: theme.spacing.unit * 1,
        marginBottom: theme.spacing.unit * 1,
    },
    paddingButton: {
        // padding: '12px'
    },
    lockButton: {
        textAlign: 'left'
    },
    lockButtonLive: {
        padding: '12px',
        height: '48px!important',
        width: '48px!important',
    },
    lockIcon: {
        color: "#007CB0"
    },
    unlockIcon: {
        color: "#E67D3A"
    },

    // TODO put all style relative to footer in ContentPreviewFooter component
    footerGrid: {
        backgroundColor: '#e8ebed',
        padding: '0px!important'
    },
    footerButton : {
        textAlign: 'right'
    },
    titleBar: {
        color: theme.palette.background.default,
        paddingBottom: '0px',
    },
});

const DocumentViewer = Loadable({
    loader: () => import('./filePreviewer/DocumentViewer'),
    loading: () => <div/>,
});

const PDFViewer = Loadable({
    loader: () => import('./filePreviewer/PDFViewer'),
    loading: () => <div/>,
});

const ImageViewer = Loadable({
    loader: () => import('./filePreviewer/ImageViewer'),
    loading: () => <div/>,
});

class ContentPreviewView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            additionalActionsMenuAnchor: null,
            fullScreen: false,
            imageControlElementId: "previewImageControls",
            selectedItem: null,
            selectionLocked: props.selection[0] ? props.selection[0].isLocked : false
        };
    }

    handleDialogState = () => {
        this.setState({
            fullScreen: !this.state.fullScreen
        });
    };

    componentDidUpdate(prevProps) {
        if (this.props.selection[0] === undefined) {
            this.props.setPreviewState(CM_PREVIEW_STATES.HIDE);
        }
    }

    render() {
        if (_.isEmpty(this.props.selection)) {
            return null;
        }

        const {selection, classes, t, previewMode, previewModes, setPreviewMode, setPreviewModes} = this.props;
        const selectedItem = selection[0];
        const path = selectedItem ? selectedItem.path : "";
        const livePreviewAvailable = selectedItem.publicationStatus === constants.availablePublicationStatuses.PUBLISHED || selectedItem.publicationStatus === constants.availablePublicationStatuses.MODIFIED;
        const rootClass = this.state.fullScreen ? classes.rootFullWidth : classes.root;
        return <div className={rootClass}>
            <Paper className={classes.previewPaper} elevation={0}>
                <Query query={previewQuery} errorPolicy={"all"} variables={this.queryVariables(path, livePreviewAvailable)}>
                    {({loading, error, data}) => {
                        if (error) {
                            //Ignore error that occurs if node is not published in live mode.
                        }
                        if (!loading) {
                            if (!_.isEmpty(data)) {
                                let modes = ['edit'];
                                //Check if the node is published in live.
                                if (livePreviewAvailable) {
                                    modes.push('live');
                                }
                                let selectedMode = _.find(modes, (mode) => {
                                    return previewMode === mode
                                }) !== undefined ? previewMode : 'edit';
                                if (previewModes.length !== modes.length) {
                                    setPreviewMode(selectedMode);
                                    setPreviewModes(modes);
                                }
                                return this.previewComponent(data[selectedMode]);
                            }
                        }
                        return null
                    }}
                </Query>
            </Paper>
            <Paper className={previewMode === 'live' ? classes.controlsPaperLive : classes.controlsPaperEdit}
                   elevation={0}>
                <ContentPreviewFooter
                  classes={classes}
                  previewMode={previewMode}
                  selection={selection}
                  imageControlElementId={this.state.imageControlElementId}
                  t={t}
                  handleFullScreen={handleFullScreen}
                  screenModeButtons={this.screenModeButtons}
                  downloadButton={this.downloadButton}
                />
            </Paper>
        </div>
    }

    previewComponent(data) {
        const {classes, t, dxContext} = this.props;
        let displayValue = data && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.output : '';
        const assets = data && data.nodeByPath.renderedContent ? data.nodeByPath.renderedContent.staticAssets : [];
        if (displayValue === "") {
            displayValue = t('label.contentManager.contentPreview.noViewAvailable');
        }
        //If node type is "jnt:file" use pdf viewer
        if (data && data.nodeByPath.isFile) {
            let file = dxContext.contextPath + '/files/default' + data.nodeByPath.path;
            if (isPDF(data.nodeByPath.path)) {
                return <div className={this.state.fullScreen ? classes.previewContainerFullScreenPdf : classes.previewContainerPdf}>
                <PDFViewer fullscreen={this.state.fullScreen} key={data.nodeByPath.uuid} file={file}/>
                </div>;
            } else if (isBrowserImage(data.nodeByPath.path)) {
                return <div className={this.state.fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}>
                <ImageViewer key={data.nodeByPath.uuid}
                                    elementId={this.state.imageControlElementId}
                                    fullScreen={this.state.fullScreen}
                                    file={file}/>
                </div>;
            } else {
                let type = getFileType(file);
                return <div className={this.state.fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}>
                <DocumentViewer file={file} type={type}/>
                </div>
            }
        } else {
            return <React.Fragment>
                <iframe id="previewContent" className={this.state.fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}/>
                {this.iframeLoadContent(assets, displayValue)}
            </React.Fragment>
        }
    }

    iframeLoadContent(assets, displayValue) {
        setTimeout(()=>{
            let iframe = document.getElementById("previewContent");
            let frameDoc = iframe.document;
            if (iframe.contentWindow) {
                frameDoc = iframe.contentWindow.document;
            }
            frameDoc.open();
            frameDoc.writeln(displayValue);
            frameDoc.close();
            if (assets != null) {
                let iframeHeadEl = frameDoc.getElementsByTagName("head")[0];
                for(let i in assets) {
                    let linkEl = document.createElement("link");
                    linkEl.setAttribute("rel", "stylesheet");
                    linkEl.setAttribute("type", "text/css");
                    linkEl.setAttribute("href", assets[i].key);
                    iframeHeadEl.appendChild(linkEl);
                }
            }

        },200);
        return null;
    }

    downloadButton(selectedItem, workspace) {

        let {classes, dxContext, t} = this.props;

        if (isBrowserImage(selectedItem.path) || isPDF(selectedItem.path)) {
            return <a
                className={classes.colorIcon}
                target="_blank"
                href={`${dxContext.contextPath}/files/${workspace}${selectedItem.path}`}
            >
                <Tooltip title={t('label.contentManager.contentPreview.download')}>
                    <CloudDownload/>
                </Tooltip>
            </a>;
        } else {
            return <a
                className={classes.colorIcon}
                href={`${dxContext.contextPath}/files/${workspace}${selectedItem.path}`}
                download
            >
                <Tooltip title={t('label.contentManager.contentPreview.download')}>
                    <CloudDownload/>
                </Tooltip>
            </a>;
        }
    }

    screenModeButtons(handleFullScreen, classes) {

        const {t} = this.props;
        handleFullScreen(this.state.fullScreen);

        if (this.state.fullScreen) {
            return <Tooltip title={t('label.contentManager.contentPreview.collapse')}>
                <FullscreenExit className={classes.colorIcon} onClick={this.handleDialogState}/>
            </Tooltip>;
        } else {
            return <Tooltip title={t('label.contentManager.contentPreview.expand')}>
                <Fullscreen onClick={this.handleDialogState} className={classes.colorIcon}/>
            </Tooltip>;
        }
    }

    queryVariables(path, isPublished) {
        return {
            path: path,
            templateType: "html",
            view: "cm",
            contextConfiguration: "preview",
            language: this.props.language,
            isPublished: isPublished
        }
    }
}

ContentPreviewView.propTypes = {
  selection: PropTypes.arrayOf(PropTypes.shape({
    isLocked: PropTypes.bool.isRequired
  })).isRequired,
  previewMode: PropTypes.string.isRequired,
  previewModes: PropTypes.arrayOf(PropTypes.string).isRequired,
  language: PropTypes.string.isRequired,

  setPreviewState: PropTypes.func.isRequired,
  setPreviewMode: PropTypes.func.isRequired,
  setPreviewModes: PropTypes.func.isRequired
}

const mapStateToProps = (state, ownProps) => {
    return {
        selection: state.selection,
        previewMode: state.previewMode,
        previewModes: state.previewModes,
        language: state.language
    }
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPreviewMode: (mode) => {
        dispatch(cmSetPreviewMode(mode));
    },
    setPreviewModes: (modes) => {
        dispatch(cmSetPreviewModes(modes));
    },
    setPreviewState: (state) => {
        dispatch(cmSetPreviewState(state))
    }
});

const ContentPreview = _.flowRight(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentPreviewView)

ContentPreview.propTypes = {
    layoutQuery: PropTypes.object.isRequired,
    layoutQueryParams: PropTypes.object.isRequired
};

export default ContentPreview;
