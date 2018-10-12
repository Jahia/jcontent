import React from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import {ApolloConsumer} from "react-apollo";
import { uploadFile, uploadImage, removeFile } from './gqlMutations';
import { Button, CircularProgress, ListItem, ListItemText, Avatar, ListItemSecondaryAction, Popover, TextField } from "@material-ui/core";
import { CheckCircle, Info,  FiberManualRecord, InsertDriveFile } from "@material-ui/icons";
import {connect} from "react-redux";
import { uploadStatuses, NUMBER_OF_SIMULTANEOUS_UPLOADS, RENAME_MODE } from './constatnts';
import { updateUpload, removeUpload, takeFromQueue } from './redux/actions';
import {batchActions} from 'redux-batched-actions';
import isImage from 'is-image';
import {translate} from "react-i18next";
import _ from 'lodash';

const styles = theme => ({
    progressText: {
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        alignContent: "center",
        justifyItems: "center"
    },
    fileNameText: {
        maxWidth: 600,
        '& span' : {
            color: "#555"
        }
    },
    statusIcon: {
        marginRight: 10
    },
    statusIconRed: {
        marginRight: 10,
        color: "#aa0022"
    },
    statusIconGreen: {
        marginRight: 10,
        color: "#51a522"
    },
    statusIconOrange: {
        marginRight: 10,
        color: "#E67D3A"
    },
    renameField: {
        marginLeft: 5,
        marginRight: 5,
        width: 250
    },
    actionButton: {
        color: "#555"
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
        this.replaceFile = this.replaceFile.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.status === uploadStatuses.UPLOADING && prevProps.status !== uploadStatuses.UPLOADING) {
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

                return <ListItem className={classes.listItem}>
                    { this.avatar() }
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
                            defaultValue={ file.name }
                            onKeyUp={ this.rename }
                        />
                    </Popover>
                </ListItem>
            }
        }</ApolloConsumer>
    }

    rename(e) {
        if (RENAME_MODE === "AUTOMATIC") {
            const { file } = this.props;
            //Note that this may have issues, better strategy would be to generate name first
            this.setState({
                userChosenName: file.name.replace(".", "-1.")
            }, () => {
                this.changeStatusToUploading();
            })
        }
        else if (RENAME_MODE === "MANUAL") {
            if (e.keyCode === 13) {
                this.setState({
                    userChosenName: e.target.value,
                    anchorEl: null
                }, () => {
                    this.changeStatusToUploading();
                });
            }
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
                ...variables,
                mimeType: file.type
            }
        });
    }

    statusText() {
        const { classes, status, error, t } = this.props;
        let text;

        if (status === uploadStatuses.QUEUED) {
            text = <span className={ classes.progressText }>
                <FiberManualRecord className={ classes.statusIcon }/>
                {t("label.contentManager.fileUpload.queued")}
            </span>
        }
        else if (status === uploadStatuses.UPLOADED) {
            text = <span className={ classes.progressText }>
                <CheckCircle className={ classes.statusIconGreen }/>
                {t("label.contentManager.fileUpload.uploaded")}
            </span>
        }
        else if (status === uploadStatuses.HAS_ERROR && error === "FILE_EXISTS") {
            text = <span className={ classes.progressText }>
                <Info className={ classes.statusIconRed }/>
                {t("label.contentManager.fileUpload.exists")}
            </span>
        }
        else if (status === uploadStatuses.HAS_ERROR) {
            text = <span className={ classes.progressText }>
                <Info className={ classes.statusIconRed }/>
                {t("label.contentManager.fileUpload.failed")}
            </span>
        }
        else if (status === uploadStatuses.UPLOADING) {
            text = <span className={ classes.progressText }>
                <CircularProgress size={20} className={ classes.statusIconOrange }/>
                {t("label.contentManager.fileUpload.uploading")}
            </span>
        }

        return text;
    }

    secondaryActionsList() {
        const { status, error, removeFile, index, dispatch, t, classes } = this.props;
        const actions = [];
        if (status === uploadStatuses.QUEUED) {
            actions.push(
                <Button key="dontupload"
                        className={ classes.actionButton }
                        component={"a"}
                        onClick={() => {
                            removeFile(index);
                            dispatch(removeUpload(index));
                            this.props.updateUploadsStatus();
                        }} >
                    {t("label.contentManager.fileUpload.dontUpload")}
                </Button>
            );
        }
        if (status === uploadStatuses.HAS_ERROR) {
            if (error === "FILE_EXISTS") {
                if (RENAME_MODE === "AUTOMATIC") {
                    actions.push(<Button key="rename"
                                         className={ classes.actionButton }
                                         component={"a"}
                                         onClick={(e) => { this.rename(e)}} >
                        {t("label.contentManager.fileUpload.rename")}
                    </Button>);
                }
                else if (RENAME_MODE === "MANUAL") {
                    actions.push(<Button key="rename"
                                         className={ classes.actionButton }
                                         component={"a"}
                                         onClick={(e) => { this.showChangeNamePopover(e)}} >
                        {t("label.contentManager.fileUpload.rename")}
                    </Button>)
                }
                actions.push(
                    <Button key="overwrite"
                            className={ classes.actionButton }
                            component={"a"}
                            onClick={ this.replaceFile } >
                        {t("label.contentManager.fileUpload.replace")}
                    </Button>,
                    <Button key="dontupload"
                            className={ classes.actionButton }
                            component={"a"}
                            onClick={() => {
                                removeFile(index);
                                dispatch(removeUpload(index));
                            }} >
                        {t("label.contentManager.fileUpload.dontUpload")}
                    </Button>
                )
            }
            else {
                actions.push(<Button key="dontupload"
                                     className={ classes.actionButton }
                                     component={"a"}
                                     onClick={() => {
                                         removeFile(index);
                                         dispatch(removeUpload(index));
                                     }} >
                        {t("label.contentManager.fileUpload.dontUpload")}
                    </Button>,
                    <Button key="retry"
                            className={ classes.actionButton }
                            component={"a"}
                            onClick={() => {
                                this.doUploadAndStatusUpdate()
                            }} >
                        {t("label.contentManager.fileUpload.retry")}
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

    replaceFile() {
        const { file, path } = this.props;
        this.client.mutate({
            mutation: removeFile,
            variables: {
                pathOrId: path + "/" + file.name
            }
        }).then(() => {
            this.changeStatusToUploading()
        }).catch((e) => {
            console.error(e);
        })
    }

    changeStatusToUploading() {
        const upload = {
            id: this.props.id,
            status: uploadStatuses.UPLOADING,
            error: null
        };
        this.props.dispatch(updateUpload(upload));
    }

    avatar() {
        const { file } = this.props;
        if (isImage(file.name)) {
            return <Avatar alt={ file.name } src={ file.preview } />
        }
        return <Avatar>
            <InsertDriveFile/>
        </Avatar>
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

export default _.flowRight(
    withStyles(styles),
    translate(),
    connect(mapStateToProps, mapDispatchToProps))(UploadItem);