import React from 'react';
import PropTypes from 'prop-types';
import {Query} from 'react-apollo';
import {translate} from 'react-i18next';
import {withStyles, Paper, Grid, IconButton, Button} from "@material-ui/core";
import {Fullscreen, FullscreenExit, Lock, LockOpen, CloudDownload} from "@material-ui/icons";
import {previewQuery} from "./gqlQueries";
import PublicationInfo from './PublicationStatus';
import {Mutation} from 'react-apollo';
import ShareMenu from './ShareMenu';
import Actions from "../Actions";
import CmButton from "../renderAction/CmButton";
import CmIconButton from "../renderAction/CmIconButton";
import {lockNode, unlockNode} from "./gqlMutations";
import {Tooltip} from '@material-ui/core';
import {isPDF, isImage, getFileType} from "../filesGrid/filesGridUtils";
import {DxContext} from "../DxContext";
import {lodash as _} from "lodash";
import {connect} from "react-redux";
import {cmSetPreviewMode, cmSetPreviewModes, cmSetPreviewState, CM_PREVIEW_STATES} from "../redux/actions";
import Loadable from "react-loadable";
import {ellipsizeText} from "../utils.js";

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
        height: 'auto',
        maxHeight: '530px',
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
        height: 'calc(100vh - 28px)',
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
    titleBar: {
        color: theme.palette.background.default,
        paddingBottom: '0px',
    },
    contentTitle: {
        textAlign: 'left',
        fontSize: '27px',
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
    footerGrid: {
        backgroundColor: '#e8ebed',
        padding: '0px!important'
    },
    footerButton : {
        textAlign: 'right'
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
    }
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

class ContentPreview extends React.Component {

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
        return this.mainComponent();
    }

    mainComponent() {
        const {selection, classes, t, previewMode, previewModes, setPreviewMode, setPreviewModes} = this.props;
        const selectedItem = selection[0];
        const path = selectedItem ? selectedItem.path : "";
        const rootClass = this.state.fullScreen ? classes.rootFullWidth : classes.root;
        console.log(this.state.fullScreen);
        return <DxContext.Consumer>
            {dxContext => (
                <div className={rootClass}>
                    <Paper className={classes.previewPaper} elevation={0}>
                        <Query query={previewQuery} errorPolicy={"all"} variables={this.queryVariables(path)}>
                            {({loading, error, data}) => {
                                if (error) {
                                    //Ignore error that occurs if node is not published in live mode.
                                }
                                if (!loading) {
                                    if (!_.isEmpty(data)) {
                                        let modes = ['edit'];
                                        //Check if the node is published in live.
                                        if (data.edit.nodeByPath.isPublished && data.edit.nodeByPath.isPublished.value === "true") {
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
                        {this.componentFooter()}
                    </Paper>
                </div>
            )}
        </DxContext.Consumer>;
    }

    componentFooter() {
        let {classes, previewMode, selection, t, handleFullScreen} = this.props;
        let {selectionLocked} = this.state;
        let selectedItem = selection[0];
        switch (previewMode) {
            case 'live':
                return <Grid container spacing={0} className={classes.footerGrid}>
                    <Grid container spacing={0}>
                        <Grid container item xs={8} className={classes.titleBar}>
                            <div className={classes.contentTitle}>
                                {this.ellipsisText(selectedItem.displayName ? selectedItem.displayName : selectedItem.name)}
                            </div>
                        </Grid>
                        <Grid container item xs={4} justify={'flex-end'} className={classes.footerButton}>
                            {selectedItem.type === 'File' && this.downloadButton(selectedItem, 'live')}
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
                        {/*Element that will contain image controls if an image is the document being previewed*/}
                        <div id={this.state.imageControlElementId} style={{background: 'transparent'}}/>
                    </Grid>

                    <Grid item xs={4} className={classes.lockButton}>
                        <IconButton className={classes.lockButtonLive}>
                        </IconButton>
                    </Grid>
                    <Grid item xs={8} container={true} justify={"flex-end"}>
                        <Actions menuId={"livePreviewBar"} context={{
                            uuid: selectedItem.uuid,
                            path: selectedItem.path,
                            displayName: selectedItem.name
                        }}>
                            {(props) =>
                                <Button
                                    variant="contained"
                                    className={classes.unpublishButton}
                                    color="primary"
                                    onClick={(event) => props.onClick(event)}
                                >
                                    {t('label.contentManager.unpublish')}
                                </Button>}
                        </Actions>

                    </Grid>

                </Grid>;
            case 'edit':
                return <Grid container spacing={0} className={classes.footerGrid}>
                    <Grid container spacing={0}>
                        <Grid container item xs={8} className={classes.titleBar}>
                            <div className={classes.contentTitle}>
                                {this.ellipsisText(selectedItem.displayName ? selectedItem.displayName : selectedItem.name)}
                            </div>
                        </Grid>
                        <Grid container item xs={4} justify={'flex-end'} className={classes.footerButton}>
                            {selectedItem.type === 'File' && this.downloadButton(selectedItem, 'default')}
                            <ShareMenu/>
                            {this.screenModeButtons(handleFullScreen, classes)}
                        </Grid>
                    </Grid>
                    <Grid container item xs={12}>
                        <div className={classes.contentSubTitle}>
                        <PublicationInfo/>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        {/*Element that will contain image controls if an image is the document being previewed*/}
                        <div id={this.state.imageControlElementId} style={{background: 'transparent'}}/>
                    </Grid>
                    <Grid item xs={4} className={classes.lockButton}>
                        {selectionLocked ? this.unlock() : this.lock()}
                    </Grid>
                    <Grid item xs={8} container={true} justify={"flex-end"}>
                        <Actions menuId={"editPreviewBar"} context={{
                            uuid: selectedItem.uuid,
                            path: selectedItem.path,
                            primaryNodeType: selectedItem.primaryNodeType,
                            displayName: selectedItem.name,
                            nodeName: selectedItem.nodeName
                        }}>
                            {(props) => <CmButton {...props}/>}
                        </Actions>
                        <Actions menuId={"editAdditionalMenu"} context={{
                            uuid: selectedItem.uuid,
                            path: selectedItem.path,
                            displayName: selectedItem.name,
                            primaryNodeType: selectedItem.primaryNodeType,
                            nodeName: selectedItem.nodeName
                        }}>
                            {(props) => <CmIconButton footer={true} {...props} horizontal={true}/>}
                        </Actions>
                    </Grid>
                </Grid>;
        }
    };
    previewComponent(data) {
        const {classes, t, dxContext} = this.props;
        let displayValue = data ? data.nodeByPath.renderedContent.output : t('label.contentManager.contentPreview.emptyMessage');
        const assets = data ? data.nodeByPath.renderedContent.staticAssets : [];
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
            } else if (isImage(data.nodeByPath.path)) {
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
        if (isImage(selectedItem.path) || isPDF(selectedItem.path)) {
            return <a className={classes.colorIcon}
                      title="download"
                      target="_blank"
                      href={`${dxContext.contextPath}/files/${workspace}${selectedItem.path}`}>
                <Tooltip title={t('label.contentManager.contentPreview.download')}><CloudDownload/></Tooltip>
            </a>
        } else {
            return <a className={classes.colorIcon}
                      title="download"
                      href={`${dxContext.contextPath}/files/${workspace}${selectedItem.path}`}
                      download>
                <Tooltip title={t('label.contentManager.contentPreview.download')}><CloudDownload/></Tooltip>
            </a>
        }
    }
    screenModeButtons(handleFullScreen, classes) {
        const {t} = this.props;
        handleFullScreen(this.state.fullScreen);
        if (this.state.fullScreen) {
            return <Tooltip title={t('label.contentManager.contentPreview.collapse')}>
                <FullscreenExit className={classes.colorIcon} onClick={this.handleDialogState}/>
            </Tooltip>
        }
        return <Tooltip title={t('label.contentManager.contentPreview.expand')}>
            <Fullscreen onClick={this.handleDialogState} className={classes.colorIcon} />
        </Tooltip>
    }

    queryVariables(path) {
        return {
            path: path,
            templateType: "html",
            view: "cm",
            contextConfiguration: "preview",
            language: this.props.language
        }
    }

    lock() {
        const {t, selection, layoutQuery, layoutQueryParams} = this.props;
        return <Mutation
            mutation={lockNode}
            refetchQueries={[{
                query: layoutQuery,
                variables: layoutQueryParams
            }]}>
            {(lockNode) => {
                return <Tooltip title={t('label.contentManager.contentPreview.lockNode')} placement="top-start">
                    <IconButton color="secondary" onClick={() => {
                        lockNode({variables: {pathOrId: selection[0].path}});
                        this.setState({
                            selectionLocked: true
                        });
                    }}><LockOpen/></IconButton>
                </Tooltip>
            }}
        </Mutation>
    }

    unlock() {
        const {t, selection, layoutQuery, layoutQueryParams} = this.props;

        return <Mutation
            mutation={unlockNode}
            refetchQueries={[{
                query: layoutQuery,
                variables: layoutQueryParams
            }]}>
            {(unlockNode) => {
                return <Tooltip
                    title={t('label.contentManager.contentPreview.nodeLockedBy', {username: selection[0].lockOwner})}
                    placement="top-start">
                    <IconButton onClick={() => {
                        unlockNode({variables: {pathOrId: selection[0].path}});
                        this.setState({
                            selectionLocked: false
                        });
                    }}><Lock/></IconButton>
                </Tooltip>
            }}
        </Mutation>
    }

    ellipsisText(text) {
        return ellipsizeText(text, 50);
    }
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

ContentPreview = _.flowRight(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentPreview);

export default ContentPreview;

ContentPreview.propTypes = {
    layoutQuery: PropTypes.object.isRequired,
    layoutQueryParams: PropTypes.object.isRequired
};