import React from 'react';
import {withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';
import {withApollo} from 'react-apollo';
import {uploadFile, uploadImage, updateFileContent} from './gqlMutations';
import {Button, CircularProgress, ListItem, ListItemText, Avatar, ListItemSecondaryAction, Popover, TextField} from '@material-ui/core';
import {CheckCircle, Info, FiberManualRecord, InsertDriveFile} from '@material-ui/icons';
import {connect} from 'react-redux';
import {uploadStatuses, NUMBER_OF_SIMULTANEOUS_UPLOADS, RENAME_MODE} from './constants';
import {updateUpload, removeUpload, takeFromQueue} from './redux/actions';
import {batchActions} from 'redux-batched-actions';
import {isImageFile} from '../filesGrid/filesGridUtils';
import {translate} from 'react-i18next';
import _ from 'lodash';
import {ellipsizeText} from '../utils';

const styles = () => ({
    progressText: {
        display: 'flex',
        justifyContent: 'start',
        alignItems: 'center',
        alignContent: 'center',
        justifyItems: 'center'
    },
    fileNameText: {
        width: 350,
        // MaxWidth: 350,
        '& span': {
            color: '#555'
        }
    },
    statusIcon: {
        marginRight: 10
    },
    statusIconRed: {
        marginRight: 10,
        color: '#aa0022'
    },
    statusIconGreen: {
        marginRight: 10,
        color: '#51a522'
    },
    statusIconOrange: {
        marginRight: 10,
        color: '#E67D3A'
    },
    renameField: {
        marginLeft: 5,
        marginRight: 5,
        width: 250
    },
    actionButton: {
        color: '#555'
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
            this.doUploadAndStatusUpdate(false);
            this.props.updateUploadsStatus();
        }
    }

    render() {
        const {classes, file, t} = this.props;
        const open = Boolean(this.state.anchorEl);
        return (
            <ListItem className={classes.listItem}>
                { this.avatar() }
                <ListItemText className={classes.fileNameText} primary={ellipsizeText(this.getFileName(), 60)}/>
                <ListItemText className={classes.fileNameText} primary={this.statusText()}/>
                <ListItemSecondaryAction>
                    { this.secondaryActionsList() }
                </ListItemSecondaryAction>
                <Popover
                    open={open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}
                    onClose={this.hideChangeNamePopover}
                    >
                    <TextField
                        label={t('label.contentManager.fileUpload.newName')}
                        className={`${classes.textField} ${classes.renameField}`}
                        type="text"
                        name="newName"
                        margin="normal"
                        variant="outlined"
                        defaultValue={file.name}
                        onKeyUp={this.rename}
                    />
                </Popover>
            </ListItem>
        );
    }

    rename(e) {
        if (RENAME_MODE === 'AUTOMATIC') {
            const {file} = this.props;
            // Note that this may have issues, better strategy would be to generate name first
            this.setState({
                userChosenName: file.name.replace('.', '-1.')
            }, () => {
                this.changeStatusToUploading();
            });
        } else if (RENAME_MODE === 'MANUAL') {
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

    doUploadAndStatusUpdate(replace) {
        let promise = (replace ? this.updateFileContent() : this.uploadFile());
        promise.then(() => {
            const upload = {
                id: this.props.id,
                status: uploadStatuses.UPLOADED,
                error: null,
                path: this.props.path
            };
            setTimeout(() => {
                this.props.dispatchBatch([
                    updateUpload(upload),
                    takeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)
                ]).then(() => {
                    this.props.updateUploadsStatus();
                });
            }, UPLOAD_DELAY);
        }).catch(e => {
            const upload = {
                id: this.props.id,
                status: uploadStatuses.HAS_ERROR,
                error: null,
                path: this.props.path
            };
            if (e.message.indexOf('ItemExistsException') !== -1) {
                upload.error = 'FILE_EXISTS';
            }
            setTimeout(() => {
                this.props.dispatchBatch([
                    updateUpload(upload),
                    takeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)
                ]).then(() => {
                    this.props.updateUploadsStatus();
                });
            }, UPLOAD_DELAY);
        });
    }

    uploadFile() {
        const {file, path, client} = this.props;
        const variables = {
            fileHandle: file,
            nameInJCR: this.getFileName(),
            path: path,
            mimeType: file.type
        };

        if (isImageFile(file.name)) {
            return client.mutate({
                mutation: uploadImage,
                variables: variables
            });
        }

        return client.mutate({
            mutation: uploadFile,
            variables: variables
        });
    }

    updateFileContent() {
        const {file, path, client} = this.props;

        return client.mutate({
            mutation: updateFileContent,
            variables: {
                path: `${path}/${this.getFileName()}`,
                mimeType: file.type,
                fileHandle: file
            }
        });
    }

    getFileName() {
        return (this.state.userChosenName ? this.state.userChosenName : this.props.file.name);
    }

    statusText() {
        const {classes, status, error, t} = this.props;
        let text;

        if (status === uploadStatuses.QUEUED) {
            text = (
                <span className={classes.progressText}>
                    <FiberManualRecord className={classes.statusIcon}/>
                    {t('label.contentManager.fileUpload.queued')}
                </span>
            );
        } else if (status === uploadStatuses.UPLOADED) {
            text = (
                <span className={classes.progressText}>
                    <CheckCircle className={classes.statusIconGreen}/>
                    {t('label.contentManager.fileUpload.uploaded')}
                </span>
            );
        } else if (status === uploadStatuses.HAS_ERROR && error === 'FILE_EXISTS') {
            text = (
                <span className={classes.progressText}>
                    <Info className={classes.statusIconRed}/>
                    {t('label.contentManager.fileUpload.exists')}
                </span>
            );
        } else if (status === uploadStatuses.HAS_ERROR) {
            text = (
                <span className={classes.progressText}>
                    <Info className={classes.statusIconRed}/>
                    {t('label.contentManager.fileUpload.failed')}
                </span>
            );
        } else if (status === uploadStatuses.UPLOADING) {
            text = (
                <span className={classes.progressText}>
                    <CircularProgress size={20} className={classes.statusIconOrange}/>
                    {t('label.contentManager.fileUpload.uploading')}
                </span>
            );
        }

        return text;
    }

    secondaryActionsList() {
        const {status, error, removeFile, index, dispatch, t, classes} = this.props;
        const actions = [];
        if (status === uploadStatuses.QUEUED) {
            actions.push(
                <Button
                    key="dontupload"
                    className={classes.actionButton}
                    component="a"
                    onClick={() => {
                        removeFile(index);
                        dispatch(removeUpload(index));
                        this.props.updateUploadsStatus();
                    }}
                    >
                    {t('label.contentManager.fileUpload.dontUpload')}
                </Button>
            );
        }
        if (status === uploadStatuses.HAS_ERROR) {
            if (error === 'FILE_EXISTS') {
                if (RENAME_MODE === 'AUTOMATIC') {
                    actions.push(
                        <Button
                            key="rename"
                            className={classes.actionButton}
                            component="a"
                            onClick={e => {
                                this.rename(e);
                            }}
                            >
                            {t('label.contentManager.fileUpload.rename')}
                        </Button>
                    );
                } else if (RENAME_MODE === 'MANUAL') {
                    actions.push(
                        <Button
                            key="rename"
                            className={classes.actionButton}
                            component="a"
                            onClick={e => {
                                this.showChangeNamePopover(e);
                            }}
                            >
                            {t('label.contentManager.fileUpload.rename')}
                        </Button>
                    );
                }
                actions.push(
                    <Button
                        key="overwrite"
                        className={classes.actionButton}
                        component="a"
                        onClick={() => {
                            this.doUploadAndStatusUpdate(true);
                        }}
                        >
                        {t('label.contentManager.fileUpload.replace')}
                    </Button>,
                    <Button
                        key="dontupload"
                        className={classes.actionButton}
                        component="a"
                        onClick={() => {
                            removeFile(index);
                            dispatch(removeUpload(index));
                        }}
                        >
                        {t('label.contentManager.fileUpload.dontUpload')}
                    </Button>
                );
            } else {
                actions.push(
                    <Button
                        key="dontupload"
                        className={classes.actionButton}
                        component="a"
                        onClick={() => {
                            removeFile(index);
                            dispatch(removeUpload(index));
                        }}
                        >
                        {t('label.contentManager.fileUpload.dontUpload')}
                    </Button>,
                    <Button
                        key="retry"
                        className={classes.actionButton}
                        component="a"
                        onClick={() => {
                            this.doUploadAndStatusUpdate(false);
                        }}
                        >
                        {t('label.contentManager.fileUpload.retry')}
                    </Button>
                );
            }
        }

        return actions;
    }

    showChangeNamePopover(e) {
        this.setState({
            anchorEl: e.currentTarget
        });
    }

    hideChangeNamePopover() {
        this.setState({
            anchorEl: null
        });
    }

    changeStatusToUploading() {
        const upload = {
            id: this.props.id,
            status: uploadStatuses.UPLOADING,
            error: null,
            path: this.props.path
        };
        this.props.dispatch(updateUpload(upload));
    }

    avatar() {
        const {file} = this.props;
        if (isImageFile(file.name)) {
            return <Avatar alt={file.name} src={file.preview}/>;
        }
        return (
            <Avatar>
                <InsertDriveFile/>
            </Avatar>
        );
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
    return state.fileUpload.uploads[ownProps.index];
};

const mapDispatchToProps = dispatch => {
    return {
        dispatch: dispatch,
        dispatchBatch: actions => {
            return new Promise(resolve => {
                dispatch(batchActions(actions));
                resolve();
            });
        }
    };
};

export default _.flowRight(
    withStyles(styles),
    translate(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(UploadItem);
