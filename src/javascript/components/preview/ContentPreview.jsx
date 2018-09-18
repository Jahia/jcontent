import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { translate } from 'react-i18next';
import { withStyles, Paper, Grid, IconButton } from "@material-ui/core";
import { Fullscreen, FullscreenExit, Lock, LockOpen } from "@material-ui/icons";
import { previewQuery } from "./gqlQueries";
import PublicationInfo from './PublicationStatus';
import { Mutation } from 'react-apollo';
import ShareMenu from './ShareMenu';
import Actions from "../Actions";
import CmButton from "../renderAction/CmButton";
import CmIconButton from "../renderAction/CmIconButton";
import { lockNode, unlockNode } from "./gqlMutations";
import Tooltip from '@material-ui/core/Tooltip';
import PDFViewer from "./filePreviewer/PDFViewer";
import ImageViewer from "./filePreviewer/ImageViewer";
import DocumentViewer from "./filePreviewer/DocumentViewer";
import {isPDF, isImage, getFileType} from "../filesGrid/filesGridUtils";
import {DxContext} from "../DxContext";
import {lodash as _} from "lodash";
import {connect} from "react-redux";

const styles = theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        transition: "width 0.3s ease-in 0s",
        width: 650,
    },
    rootFullWidth : {
        width : "99vw"
    },
    button: {
        margin: theme.spacing.unit
    },
    previewPaper: {
        flex: 9
    },
    previewContainer: {
        // maxHeight: 1150, //Fix scroll issue on firefox TODO find better solution, only works for 25 results
        overflow: "auto",
        padding: theme.spacing.unit * 2
    },
    previewContainerFullScreen: {
        top: "0!important",
        left: "0!important",
        height: "1000px!important"
    },
    controlsPaper: {
        flex: 3,
        maxHeight: "200px",
        backgroundColor: "#555",
        opacity: 0.9
    },
    titleBar: {
        color: "whitesmoke",
        padding: theme.spacing.unit,
        paddingBottom: '0px',
        minHeight: "100px"
    },
    contentTitle : {
        fontWeight: 500,
        padding: theme.spacing.unit
    }
});

class ContentPreview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            additionalActionsMenuAnchor: null,
            fullScreen: false,
            imageControlElementId: "previewImageControls"
        };
    }

    handleDialogState = () => {
        this.setState({
            fullScreen: !this.state.fullScreen
        });
    };

    render() {
        if (_.isEmpty(this.props.selection)) {
            return null;
        }
        return this.mainComponent();
    }

    mainComponent() {

        const { selection, classes, t } = this.props;
        const selectedItem = selection[0];
        const path = selectedItem ? selectedItem.path : "";
        const rootClass = this.state.fullScreen ? `${ classes.root } ${ classes.rootFullWidth }` : classes.root;

        return <DxContext.Consumer>
            {dxContext => (
                <div className={ rootClass } >
                    <Paper className={ classes.previewPaper } elevation={ 0 }>
                        <Query query={ previewQuery } variables={ this.queryVariables(path) }>
                            {({loading, error, data}) => {
                                if (error) {
                                    console.error(error);
                                }

                                if (!loading) {
                                    return this.previewComponent(data);
                                }
                                return null
                            }}
                        </Query>
                    </Paper>
                    <Paper className={ classes.controlsPaper } elevation={ 0 }>
                        <Grid container spacing={0}>
                            <Grid item xs={ 10 } className={ classes.titleBar }>
                                <div className={ classes.contentTitle }>{ selectedItem.displayName ? selectedItem.displayName : selectedItem.name }</div>
                                <PublicationInfo/>
                            </Grid>
                            <Grid item xs={ 2 }>
                                <ShareMenu/>
                                { this.screenModeButtons() }
                            </Grid>
                            <Grid item xs={12}>
                                {/*Element that will contain image controls if an image is the document being previewed*/}
                                <div id={this.state.imageControlElementId} style={{background: 'transparent'}}/>
                            </Grid>
                            <Grid item xs={ 4 }>
                                { selectedItem.isLocked ? this.unlock() : this.lock() }
                            </Grid>
                            <Grid item xs={ 8 }>
                                <Actions menuId={"previewBar"} context={{path: selectedItem.path, displayName: selectedItem.name}}>
                                    {(props) => <CmButton {...props}/>}
                                </Actions>
                                <Actions menuId={"additionalMenu"} context={{path: selectedItem.path, displayName: selectedItem.name}}>
                                    {(props) => <CmIconButton {...props}/>}
                                </Actions>
                            </Grid>
                        </Grid>
                    </Paper>
                </div>
            )}
        </DxContext.Consumer>;
    }

    previewComponent(data) {
        const { classes, t, dxContext } = this.props;
        let displayValue = data && data.jcr ? data.jcr.nodeByPath.renderedContent.output : t('label.contentManager.contentPreview.emptyMessage');
        if (displayValue === "") {
            displayValue = t('label.contentManager.contentPreview.noViewAvailable');
        }
        //If node type is "jnt:file" use pdf viewer
        if (data && data.jcr && data.jcr.nodeByPath.isFile) {
            let file = dxContext.contextPath + '/files/default' + data.jcr.nodeByPath.path;
            if (isPDF(data.jcr.nodeByPath.path)) {
                return <PDFViewer key={data.jcr.nodeByPath.uuid} file={file}/>;
            } else if(isImage(data.jcr.nodeByPath.path)) {
                return <ImageViewer key={data.jcr.nodeByPath.uuid}
                             elementId={this.state.imageControlElementId}
                             file={file}/>;
            } else {
                let type = getFileType(file);
                return <DocumentViewer file={file} type={type}/>
            }
        } else {
            return <div id="previewContent" className={ classes.previewContainer } dangerouslySetInnerHTML={{__html: displayValue}} />
        }
    }

    screenModeButtons() {
        if (this.state.fullScreen) {
            return <IconButton onClick={ this.handleDialogState }><FullscreenExit/></IconButton>
        }
        return <IconButton onClick={ this.handleDialogState }><Fullscreen/></IconButton>
    }

    queryVariables(path) {
        return {
            path: path,
            templateType: "html",
            view: "cm",
            contextConfiguration: "default"
        }
    }

    lock() {
        const { t, selection, layoutQuery, layoutQueryParams } = this.props;
        return <Mutation
            mutation={ lockNode }
            refetchQueries={[{
                query: layoutQuery,
                variables: layoutQueryParams
            }]}>
            {(lockNode) => {
                return <Tooltip title={ t('label.contentManager.contentPreview.lockNode') } placement="top-start">
                    <IconButton onClick={ () => lockNode({ variables: { pathOrId: selection[0].path }}) }><LockOpen/></IconButton>
                </Tooltip>
            }}
        </Mutation>
    }

    unlock() {
        const { t, selection, layoutQuery, layoutQueryParams } = this.props;
        return <Mutation
            mutation={ unlockNode }
            refetchQueries={[{
                query: layoutQuery,
                variables: layoutQueryParams
            }]}>
            {(unlockNode) => {
                return <Tooltip title={ t('label.contentManager.contentPreview.nodeLockedBy', {username: selection[0].lockOwner}) } placement="top-start">
                    <IconButton onClick={ () => unlockNode({ variables: { pathOrId: selection.path }}) }><Lock/></IconButton>
                </Tooltip>
            }}
        </Mutation>
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
    selection: state.selection
}}

ContentPreview = _.flowRight(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, null)
)(ContentPreview);

export default ContentPreview;

ContentPreview.propTypes = {
    layoutQuery: PropTypes.object.isRequired,
    layoutQueryParams: PropTypes.object.isRequired,
    rowSelectionFunc: PropTypes.func.isRequired
};