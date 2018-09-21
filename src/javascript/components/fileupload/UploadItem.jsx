import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {ApolloConsumer} from "react-apollo";
import { uploadFile } from './gqlMutations';
import { Mutation } from 'react-apollo';
import { Button, CircularProgress, ListItem, ListItemText, Avatar, ListItemSecondaryAction } from "@material-ui/core";
import { CheckCircle, Info,  FiberManualRecord } from "@material-ui/icons";
import {connect} from "react-redux";
import UploadDrawer from './UploadDrawer';
import { panelStates, uploadsStatuses, uploadStatuses, NUMBER_OF_SIMULTANEOUS_UPLOADS } from './constatnts';
import { updateUpload, removeUpload, takeFromQueue } from './redux/actions';
import UploadDropZone from './UploadDropZone';
import mimetypes from 'mime-types';
import {batchActions} from 'redux-batched-actions';

const styles = theme => ({
    progressText: {
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        alignContent: "center",
        justifyItems: "center"
    }
});

class UploadItem extends React.Component {

    constructor(props) {
        super(props);
        this.client = null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.status === uploadStatuses.UPLOADING && prevProps.status !== uploadStatuses.UPLOADING) {
            console.log("Start uploading file");
            const file = this.props.file;
            this.client.mutate({
                mutation: uploadFile,
                variables: {
                    fileHandle: "myFile",
                    file
                }
            }).then((r) => {
                const upload = {
                    id: this.props.id,
                    status: uploadStatuses.UPLOADED,
                    error: null
                };
                this.props.dispatchBatch([updateUpload(upload), takeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]);
            }).catch((e) => {
                const upload = {
                    id: this.props.id,
                    status: uploadStatuses.HAS_ERROR,
                    error: null
                };
                if (e.message.indexOf("ItemExistsException") !== -1) {
                    upload.error = "FILE_EXISTS"
                }
                this.props.dispatchBatch([updateUpload(upload), takeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]);
            });
        }
    }

    render() {
        const { classes, id } = this.props;
        return <ApolloConsumer>{
            client => {
                if (this.client === null) this.client = client;

                return <ListItem button className={classes.listItem} >
                    <Avatar alt="Remy Sharp" src={ id } />
                    <ListItemText primary={ id } />
                    <ListItemText primary={ this.statusText() } />
                    <ListItemSecondaryAction>
                        { this.secondaryActionsList() }
                    </ListItemSecondaryAction>
                </ListItem>
            }
        }</ApolloConsumer>
    }

    statusText() {
        const { classes, status, error } = this.props;
        let text;

        if (status === uploadStatuses.QUEUED) {
            text = <span className={ classes.progressText }>
                <FiberManualRecord/>
                Queued
            </span>
        }
        else if (status === uploadStatuses.UPLOADED) {
            text = <span className={ classes.progressText }>
                <CheckCircle/>
                Uploaded
            </span>
        }
        else if (status === uploadStatuses.HAS_ERROR && error === "FILE_EXISTS") {
            text = <span className={ classes.progressText }>
                <Info/>
                File already exists
            </span>
        }
        else if (status === uploadStatuses.HAS_ERROR) {
            text = <span className={ classes.progressText }>
                <Info/>
                Could not upload
            </span>
        }
        else if (status === uploadStatuses.UPLOADING) {
            text = <span className={ classes.progressText }>
                <CircularProgress size={20}/>
                Uploading ...
            </span>
        }

        return text;
    }

    secondaryActionsList() {
        const { status, error, removeFile, index, dispatch } = this.props;
        const actions = [];
        if (status === uploadStatuses.QUEUED) {
            actions.push(
                <Button key="dontupload"
                        component={"a"}
                        onClick={() => { removeFile(index); dispatch(removeUpload(index))}} >
                    Don't upload
                </Button>
            );
        }
        if (status === uploadStatuses.HAS_ERROR) {
            if (error === "FILE_EXISTS") {
                actions.push(<Button key="rename"
                                     component={"a"}
                                     onClick={() => { removeFile(index); dispatch(removeUpload(index))}} >
                        Rename
                    </Button>,
                    <Button key="overwrite"
                            component={"a"}
                            onClick={() => { removeFile(index); dispatch(removeUpload(index))}} >
                            Overwrite
                    </Button>,
                    <Button key="dontupload"
                            component={"a"}
                            onClick={() => { removeFile(index); dispatch(removeUpload(index))}} >
                        Don't upload
                    </Button>
                )
            }
            else {
                actions.push(<Button key="dontupload"
                                     component={"a"}
                                     onClick={() => { removeFile(index); dispatch(removeUpload(index))}} >
                        Don't upload
                    </Button>,
                    <Button key="retry"
                            component={"a"}
                            onClick={() => { removeFile(index); dispatch(removeUpload(index))}} >
                        Retry
                    </Button>
                )
            }
        }

        return actions;
    }
}

UploadItem.propTypes = {
    classes: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    removeFile: PropTypes.func.isRequired,
    file: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return state.fileUpload.uploads[ownProps.index]
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch,
        dispatchBatch: actions => dispatch(batchActions(actions))
    }
};

export default withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(UploadItem)
);