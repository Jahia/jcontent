import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { ApolloConsumer } from "react-apollo";
import { uploadFile } from './gqlMutations';
import { Mutation } from 'react-apollo';
import { Input, Button, IconButton, List } from "@material-ui/core";
import { Close, ExpandMore, ExpandLess, Fullscreen, FullscreenExit } from "@material-ui/icons";
import {connect} from "react-redux";
import UploadDrawer from './UploadDrawer';
import { panelStates, uploadsStatuses, uploadStatuses, NUMBER_OF_SIMULTANEOUS_UPLOADS } from './constatnts';
import { uploadSeed } from './redux/reducer';
import { setPanelState, setUploads, takeFromQueue, setStatus } from './redux/actions';
import UploadDropZone from './UploadDropZone';
import UploadItem from './UploadItem';
import mimetypes from 'mime-types';
import {batchActions} from 'redux-batched-actions';

const styles = theme => ({
    drawerContent: {
        display: "flex",
        flexDirection: "column",
        transition: "height 0.5s ease 0s"
    },
    contentHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    contentBody: {
        display: "flex",
        justifyContent: "center",
        height: 300,
        overflowY: "auto",
        overflowX: "none"
    },
    drawerContentOrange: {
        "background-color": "#E67D3A"
    },
    drawerContentGreen: {
        "background-color": "#51a522"
    },
    drawerContentRed: {
        "background-color": "#aa0022"
    },
    drawerContentFull: {
        height: 350
    },
    drawerContentPartial: {
        height: 50,
        overflow: 'hidden'
    },
    uploadList: {
        width: "100%"
    }
});

const DRAWER_ANIMATION_TIME = 300;

class Upload extends React.Component {

    constructor(props) {
        super(props);
        this.acceptedFiles = [];
        this.rejectedFiles = [];
        this.client = null;
        this.onFilesSelected = this.onFilesSelected.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.updateUploadsStatus = this.updateUploadsStatus.bind(this);
    }

    componentDidUpdate() {
        this.updateUploadsStatus();
    }

    render() {
        const { classes } = this.props;
        return <UploadDrawer open={ this.isDrawerOpen() } transitionDuration={ this.transitionDuration() }>
                <div className={ this.contentClasses() }>
                    <div className={classes.contentHeader}>
                        { this.headerButton() }
                    </div>
                    <div className={ classes.contentBody }>
                        { this.configureRendering() }
                    </div>
                </div>
            </UploadDrawer>
    }

    configureRendering() {
        const { classes, uploads, acceptedFileTypes } = this.props;
        if (uploads.length === 0) {
            return <UploadDropZone acceptedFileTypes={ this.getMimeTypes(acceptedFileTypes) }
                                   onFilesSelected={ this.onFilesSelected } />
        }
        return <List className={ classes.uploadList } component="nav">
            { this.showUploads() }
        </List>
    }

    onFilesSelected(acceptedFiles, rejectedFiles) {
        console.log(acceptedFiles, rejectedFiles);
        this.acceptedFiles = acceptedFiles;
        this.rejectedFiles = rejectedFiles;
        const uploads = this.acceptedFiles.map((file) => {
            let seed = {
                ...uploadSeed
            };
            seed.id = file.preview;
            return seed;
        });
        this.props.dispatchBatch([
            setUploads(uploads),
            takeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]
        );
    }

    showUploads() {
        return this.props.uploads.map((upload, index) => (
            <UploadItem key={`upload_${index}`}
                        index={ index }
                        file={ this.acceptedFiles[index] }
                        path={ this.props.path }
                        removeFile={ this.removeFile }
                        updateUploadsStatus={ this.updateUploadsStatus }/>
        ));
    }

    removeFile(index) {
        this.acceptedFiles = this.acceptedFiles.filter((file, i) => {
            return i !== index;
        });
    }

    updateUploadsStatus() {
        let us;

        const status = this.uploadStatus();

        if (status === null) {
            us = uploadsStatuses.NOT_STARTED;
        }
        else if (status.uploading !== 0) {
            us = uploadsStatuses.UPLOADING;
        }
        else if (status.error !== 0) {
            us = uploadsStatuses.HAS_ERROR;
        }
        else {
            us = uploadsStatuses.UPLOADED;
        }

        this.props.dispatch(setStatus(us));
    }

    isDrawerOpen() {
        const { panelState } = this.props;
        return panelState === panelStates.VISIBLE || panelState === panelStates.PARTIALLY_VISIBLE;
    }

    contentClasses() {
        const { panelState, status, classes, uploads } = this.props;
        if (status === uploadsStatuses.HAS_ERROR && panelState === panelStates.PARTIALLY_VISIBLE) {
            return `${classes.drawerContent} ${classes.drawerContentPartial} ${classes.drawerContentRed}`;
        }
        if (status === uploadsStatuses.UPLOADING && panelState === panelStates.PARTIALLY_VISIBLE) {
            return `${classes.drawerContent} ${classes.drawerContentPartial} ${classes.drawerContentOrange}`;
        }
        if (status === uploadsStatuses.UPLOADED && panelState === panelStates.PARTIALLY_VISIBLE) {
            return `${classes.drawerContent} ${classes.drawerContentPartial} ${classes.drawerContentGreen}`;
        }
        if (panelState === panelStates.PARTIALLY_VISIBLE) {
            return `${classes.drawerContent} ${classes.drawerContentPartial}`;
        }
        if (uploads.length === 0 && status === uploadsStatuses.NOT_STARTED) {
            return `${classes.drawerContent} ${classes.drawerContentFull} ${classes.drawerContentOrange}`;
        }
        return `${classes.drawerContent} ${classes.drawerContentFull}`;
    }

    headerButton() {
        const { panelState, uploads, status } = this.props;

        if (uploads.length !== 0 && status === uploadsStatuses.NOT_STARTED && panelState === panelStates.VISIBLE) {
            return <IconButton style={{color: "#E67D3A"}} onClick={ () => this.props.dispatch(setPanelState(panelStates.PARTIALLY_VISIBLE)) }>
                <FullscreenExit />
            </IconButton>
        }
        if (uploads.length !== 0 && status === uploadsStatuses.NOT_STARTED && panelState === panelStates.PARTIALLY_VISIBLE) {
            return <IconButton style={{color: "#E67D3A"}} onClick={ () => this.props.dispatch(setPanelState(panelStates.VISIBLE)) }>
                <Fullscreen />
            </IconButton>
        }
        if (status === uploadsStatuses.NOT_STARTED) {
            return <IconButton style={{color: "whitesmoke"}} onClick={ () => this.props.dispatchBatch([setPanelState(panelStates.INVISIBLE), setUploads([])]) }>
                <Close />
            </IconButton>
        }
        if ((status === uploadsStatuses.UPLOADING || status === uploadsStatuses.HAS_ERROR) && panelState === panelStates.VISIBLE) {
            return <IconButton style={{color: "#E67D3A"}} onClick={ () => this.props.dispatch(setPanelState(panelStates.PARTIALLY_VISIBLE)) }>
                <FullscreenExit />
            </IconButton>
        }
        if ((status === uploadsStatuses.UPLOADING || status === uploadsStatuses.HAS_ERROR) && panelState === panelStates.PARTIALLY_VISIBLE) {
            return <IconButton style={{color: "whitesmoke"}} onClick={ () => this.props.dispatch(setPanelState(panelStates.VISIBLE)) }>
                <Fullscreen />
            </IconButton>
        }
        if (status === uploadsStatuses.UPLOADED && panelState === panelStates.VISIBLE) {
            return <IconButton style={{color: "#E67D3A"}} onClick={ () => this.props.dispatchBatch([setPanelState(panelStates.INVISIBLE), setUploads([])]) }>
                <Close />
            </IconButton>
        }
        if (status === uploadsStatuses.UPLOADED && panelStates.PARTIALLY_VISIBLE) {
            return <IconButton style={{color: "whitesmoke"}} onClick={ () => this.props.dispatchBatch([setPanelState(panelStates.INVISIBLE), setUploads([])]) }>
                <Close />
            </IconButton>
        }
    }

    transitionDuration() {
        //Setting to 0 prevents panel from going up when it is in partial state and close button is clicked
        const { panelState, status } = this.props;
        if (status === uploadsStatuses.NOT_STARTED) {
            return DRAWER_ANIMATION_TIME;
        }
        if (status === uploadsStatuses.UPLOADED && panelState.VISIBLE) {
            return DRAWER_ANIMATION_TIME;
        }
        return 0;
    }

    getMimeTypes(acceptedFileTypes) {
        if (acceptedFileTypes) {
            return acceptedFileTypes.map((type) => {
                return mimetypes.lookup(type);
            });
        }
        return undefined;
    }

    uploadStatus() {
        const status = {
            uploading: 0,
            uploaded: 0,
            error: 0,
            total: this.props.uploads.length
        };

        if (this.props.uploads.length > 0) {
            for (let index in this.props.uploads) {
                const upload = this.props.uploads[index];
                switch(upload.status) {
                    case uploadStatuses.QUEUED :
                    case uploadStatuses.UPLOADING : status.uploading += 1;
                        break;
                    case uploadStatuses.UPLOADED : status.uploaded += 1;
                        break;
                    case uploadStatuses.HAS_ERROR : status.error += 1;
                }
            }
        }
        else {
            return null;
        }
        return status;
    }
}

Upload.propTypes = {
    classes: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    acceptedFileTypes: PropTypes.array
};

const mapStateToProps = (state, ownProps) => {
    return state.fileUpload
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch,
        dispatchBatch: (actions) => dispatch(batchActions(actions))
    }
};

export default withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(Upload)
);