import React from 'react';
import PropTypes from 'prop-types';
import {Query} from 'react-apollo';
import {translate} from 'react-i18next';
import {withStyles, Paper, Grid, IconButton, Button} from "@material-ui/core";
import {Fullscreen, FullscreenExit, Lock, LockOpen} from "@material-ui/icons";
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
        display: 'flex',
        justifyContent: 'center',
        color: theme.palette.background.default,
        backgroundColor: theme.palette.common.white,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
        height: 'calc(100vh - 28px)',
    },
    previewContainerFullScreen: {
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        color: theme.palette.background.default,
        backgroundColor: theme.palette.common.white,
        padding: theme.spacing.unit * 1,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
        height: 'calc(100vh - 28px)',
        },
    previewContainerPdf: {
        // maxHeight: 1150, //Fix scroll issue on firefox TODO find better solution, only works for 25 results
        width: 550,
        color: theme.palette.background.default,
        backgroundColor: theme.palette.common.white,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
    },
    previewContainerFullScreenPdf: {
        width: '100%',
        color: theme.palette.background.default,
        backgroundColor: theme.palette.common.white,
        padding: theme.spacing.unit * 1,
        paddingBottom: theme.spacing.unit * 16,
        overflow: 'scroll',
        height: 'calc(100vh - 28px)',
    },
    unpublishButton: {
        textAlign: 'center',
        margin: theme.spacing.unit
    },
    controlsPaperEdit: {
        position: 'fixed',
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
    lockButton: {
        textAlign: 'left'
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
                                {selectedItem.displayName ? this.ellipsisText(selectedItem.displayName) : this.ellipsisText(selectedItem.name)}
                            </div>
                        </Grid>
                        <Grid container item xs={4} justify={'flex-end'} className={classes.footerButton}>
                            <ShareMenu/>
                            {this.screenModeButtons(handleFullScreen, classes)}
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <div className={classes.contentSubTitle}>
                            <PublicationInfo/>
                        </div>
                    </Grid>
                    <Grid container item xs={12}>
                        {/*Element that will contain image controls if an image is the document being previewed*/}
                        <div id={this.state.imageControlElementId} style={{background: 'transparent'}}/>
                    </Grid>
                    <Grid item xs={12} style={{ display: "flex", justifyContent: "flex-end"}}>
                        <Actions menuId={"livePreviewBar"} context={{
                            uuid: selectedItem.uuid,
                            path: selectedItem.path,
                            displayName: selectedItem.name
                        }}>
                            {(props) =>
                                <Button
                                    className={classes.unpublishButton}
                                    variant="contained"
                                    size="medium"
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
                                {selectedItem.displayName ? this.ellipsisText(selectedItem.displayName) : this.ellipsisText(selectedItem.name)}
                                </div>
                        </Grid>
                        <Grid container item xs={4} justify={'flex-end'} className={classes.footerButton}>
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
                            displayName: selectedItem.name,
                            primaryNodeType: selectedItem.primaryNodeType,
                            nodeName: selectedItem.nodeName
                        }}>
                            {(props) => <CmButton {...props}/>}
                        </Actions>
                        <Actions menuId={"editAdditionalMenu"} context={{
                            uuid: selectedItem.uuid,
                            path: selectedItem.path,
                            primaryNodeType: selectedItem.primaryNodeType,
                            displayName: selectedItem.name,
                            nodeName: selectedItem.nodeName
                        }}>
                            {(props) => <CmIconButton {...props} horizontal={true}/>}
                        </Actions>
                    </Grid>
                </Grid>;
        }
    };
    previewComponent(data) {
        const {classes, t, dxContext} = this.props;
        let displayValue = data ? data.nodeByPath.renderedContent.output : t('label.contentManager.contentPreview.emptyMessage');
        const assets = data ? data.nodeByPath.renderedContent.staticAssets : [];
        console.log(assets);
        if (displayValue === "") {
            displayValue = t('label.contentManager.contentPreview.noViewAvailable');
        }
        //If node type is "jnt:file" use pdf viewer
        if (data && data.nodeByPath.isFile) {
            let file = dxContext.contextPath + '/files/default' + data.nodeByPath.path;
            if (isPDF(data.nodeByPath.path)) {
                return <div className={this.state.fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}>
                <PDFViewer key={data.nodeByPath.uuid} file={file}/>
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
                { this.css(assets) }
                <div
                    id="previewContent" className={this.state.fullScreen ? classes.previewContainerFullScreen : classes.previewContainer}
                    dangerouslySetInnerHTML={{__html: displayValue}} />
            </React.Fragment>
        }
    }

    screenModeButtons(handleFullScreen, classes) {
        handleFullScreen(this.state.fullScreen);
        if (this.state.fullScreen) {
            return <FullscreenExit className={classes.colorIcon} onClick={this.handleDialogState}/>
        }
        return <Fullscreen onClick={this.handleDialogState} className={classes.colorIcon} />
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
        let {t} = this.props;
        if (text !== undefined && text.length > 50) {
            let subtext = text.substring(0, 50);
            let words = subtext.split(" ");
            let allWords = text.split(" ");
            words[words.length-1] = allWords[words.length-1];
            return t("label.ellipsis", {text: words.join(" ")})
        } else {
            return text;
        }
    }

    css(scripts) {
        const css = [];
        for (let index in scripts) {
            css.push(<link key={`cssAsset${index}`} rel="stylesheet" type="text/css" href={ scripts[index].key } />);
        }
        return css;
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