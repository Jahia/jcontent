import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {ApolloConsumer} from "react-apollo";
import { uploadFile, uploadImage } from './gqlMutations';
import { Mutation } from 'react-apollo';
import { Button, CircularProgress, ListItem, ListItemText, Avatar, ListItemSecondaryAction, Popover, TextField } from "@material-ui/core";
import { CheckCircle, Info,  FiberManualRecord } from "@material-ui/icons";
import {connect} from "react-redux";
import UploadDrawer from './UploadDrawer';
import { panelStates, uploadsStatuses, uploadStatuses, NUMBER_OF_SIMULTANEOUS_UPLOADS } from './constatnts';
import { updateUpload, removeUpload, takeFromQueue } from './redux/actions';
import UploadDropZone from './UploadDropZone';
import mimetypes from 'mime-types';
import {batchActions} from 'redux-batched-actions';
import isImage from 'is-image';

const styles = theme => ({
    progressText: {
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        alignContent: "center",
        justifyItems: "center"
    },
    fileNameText: {
        maxWidth: 600
    },
    statusIcon: {
        marginRight: 10
    },
    renameField: {
        marginLeft: 5,
        marginRight: 5
    }
});

const UPLOAD_DELAY = 500;

class UploadItem extends React.Component {

    constructor(props) {
        super(props);
        this.client = null;
        this.state = {
            userChosenName: null,
            anchorEl: null
        };

        this.showChangeNamePopover = this.showChangeNamePopover.bind(this);
        this.hideChangeNamePopover = this.hideChangeNamePopover.bind(this);
        this.rename = this.rename.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.status === uploadStatuses.UPLOADING && prevProps.status !== uploadStatuses.UPLOADING) {
            console.log("Start uploading file");
            this.doUploadAndStatusUpdate();
            this.props.updateUploadsStatus()
        }
    }

    render() {
        const { classes, id, file } = this.props;
        const open = Boolean(this.state.anchorEl);

        return <ApolloConsumer>{
            client => {
                if (this.client === null) this.client = client;

                return <ListItem button className={classes.listItem}>
                    <Avatar alt="Remy Sharp" src={ id } />
                    <ListItemText className={ classes.fileNameText } primary={ this.state.userChosenName ? this.state.userChosenName : file.name } />
                    <ListItemText className={ classes.fileNameText } primary={ this.statusText() } />
                    <ListItemSecondaryAction>
                        { this.secondaryActionsList() }
                    </ListItemSecondaryAction>
                    <Popover
                        open={ open }
                        anchorEl={ this.state.anchorEl }
                        onClose={this.hideChangeNamePopover}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                    >
                        <TextField
                            label="New name"
                            className={ `${classes.textField} ${classes.renameField}`}
                            type="text"
                            name="newName"
                            margin="normal"
                            variant="outlined"
                            onKeyUp={ this.rename }
                        />
                    </Popover>
                </ListItem>
            }
        }</ApolloConsumer>
    }

    rename(e) {
        if (e.keyCode === 13) {
            this.setState({
                userChosenName: e.target.value,
                anchorEl: null
            }, () => {
                const upload = {
                    id: this.props.id,
                    status: uploadStatuses.UPLOADING,
                    error: null
                };
                this.props.dispatch(updateUpload(upload));
            });
        }
    }

    doUploadAndStatusUpdate() {
        this.uploadFile().then((r) => {
            const upload = {
                id: this.props.id,
                status: uploadStatuses.UPLOADED,
                error: null
            };
            setTimeout(() => {
                this.props.dispatchBatch([
                    updateUpload(upload),
                    takeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]).then(() => {
                    this.props.updateUploadsStatus();
                });
            }, UPLOAD_DELAY);
        }).catch((e) => {
            const upload = {
                id: this.props.id,
                status: uploadStatuses.HAS_ERROR,
                error: null
            };
            if (e.message.indexOf("ItemExistsException") !== -1) {
                upload.error = "FILE_EXISTS"
            }
            setTimeout(() => {
                this.props.dispatchBatch([
                    updateUpload(upload),
                    takeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]).then(() => {
                    this.props.updateUploadsStatus();
                });
            }, UPLOAD_DELAY);
        });
    }

    uploadFile() {
        const { file } = this.props;
        const variables = {
            fileHandle: file,
            nameInJCR: this.state.userChosenName ? this.state.userChosenName : file.name,
            path: this.props.path
        };

        if (isImage(file.name)) {
            return this.client.mutate({
                mutation: uploadImage,
                variables: {
                    ...variables,
                    mimeType: file.type
                }
            });
        }

        return this.client.mutate({
            mutation: uploadFile,
            variables: {
                ...variables
            }
        });
    }

    statusText() {
        const { classes, status, error } = this.props;
        let text;

        if (status === uploadStatuses.QUEUED) {
            text = <span className={ classes.progressText }>
                <FiberManualRecord className={ classes.statusIcon }/>
                Queued
            </span>
        }
        else if (status === uploadStatuses.UPLOADED) {
            text = <span className={ classes.progressText }>
                <CheckCircle className={ classes.statusIcon }/>
                Uploaded
            </span>
        }
        else if (status === uploadStatuses.HAS_ERROR && error === "FILE_EXISTS") {
            text = <span className={ classes.progressText }>
                <Info className={ classes.statusIcon }/>
                File already exists
            </span>
        }
        else if (status === uploadStatuses.HAS_ERROR) {
            text = <span className={ classes.progressText }>
                <Info className={ classes.statusIcon }/>
                Could not upload
            </span>
        }
        else if (status === uploadStatuses.UPLOADING) {
            text = <span className={ classes.progressText }>
                <CircularProgress size={20} className={ classes.statusIcon }/>
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
                        onClick={() => {
                            removeFile(index);
                            dispatch(removeUpload(index));
                            this.props.updateUploadsStatus();
                        }} >
                    Don't upload
                </Button>
            );
        }
        if (status === uploadStatuses.HAS_ERROR) {
            if (error === "FILE_EXISTS") {
                actions.push(<Button key="rename"
                                     component={"a"}
                                     onClick={(e) => { this.showChangeNamePopover(e)}} >
                        Rename
                    </Button>,
                    <Button key="overwrite"
                            component={"a"}
                            onClick={() => { removeFile(index); dispatch(removeUpload(index))}} >
                            Overwrite
                    </Button>,
                    <Button key="dontupload"
                            component={"a"}
                            onClick={() => {
                                removeFile(index);
                                dispatch(removeUpload(index));
                            }} >
                        Don't upload
                    </Button>
                )
            }
            else {
                actions.push(<Button key="dontupload"
                                     component={"a"}
                                     onClick={() => {
                                         removeFile(index);
                                         dispatch(removeUpload(index));
                                     }} >
                        Don't upload
                    </Button>,
                    <Button key="retry"
                            component={"a"}
                            onClick={() => {
                                this.doUploadAndStatusUpdate()
                            }} >
                        Retry
                    </Button>
                )
            }
        }

        return actions;
    }

    showChangeNamePopover(e) {
        this.setState({
            anchorEl: e.currentTarget
        })
    }

    hideChangeNamePopover() {
        this.setState({
            anchorEl: null
        })
    }
}

UploadItem.propTypes = {
    classes: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    removeFile: PropTypes.func.isRequired,
    updateUploadsStatus: PropTypes.func.isRequired,
    file: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return state.fileUpload.uploads[ownProps.index]
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch,
        dispatchBatch: actions => {
                return new Promise((resolve, reject) => {
                    dispatch(batchActions(actions));
                    resolve()
                })
        }
    }
};

export default withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(UploadItem)
);