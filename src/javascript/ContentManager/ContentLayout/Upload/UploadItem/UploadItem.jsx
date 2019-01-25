import React from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
    withStyles
} from '@material-ui/core';
import PropTypes from 'prop-types';
import {compose, withApollo} from 'react-apollo';
import {updateFileContent, uploadFile} from './UploadItem.gql-mutations';
import {CheckCircle, FiberManualRecord, Info} from '@material-ui/icons';
import {connect} from 'react-redux';
import {NUMBER_OF_SIMULTANEOUS_UPLOADS, uploadStatuses} from '../Upload.constants';
import {removeUpload, takeFromQueue, updateUpload} from '../Upload.redux-actions';
import {batchActions} from 'redux-batched-actions';
import {translate} from 'react-i18next';

const styles = theme => ({
    listItem: {
        color: theme.palette.text.contrastText,
        display: 'flex',
        alignItems: 'center',
        height: 32
    },
    grow: {
        flex: 1
    },
    fileNameText: {
        width: 220,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    statusIcon: {
        marginRight: theme.spacing.unit
    },
    actionButton: {
        color: theme.palette.text.contrastText,
        margin: '8 0'
    },
    progressText: {
        whiteSpace: 'nowrap'
    }
});

const UPLOAD_DELAY = 500;

export class UploadItem extends React.Component {
    constructor(props) {
        super(props);
        this.client = null;
        this.state = {
            userChosenName: null,
            anchorEl: null
        };

        this.showRenameDialog = this.showRenameDialog.bind(this);
        this.hideRenameDialog = this.hideRenameDialog.bind(this);
        this.rename = this.rename.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.status === uploadStatuses.UPLOADING && prevProps.status !== uploadStatuses.UPLOADING) {
            this.doUploadAndStatusUpdate(false);
            this.props.updateUploadsStatus();
        }
    }

    onChangeName(e) {
        this.setState({
            userChosenName: e.target.value
        });
    }

    render() {
        const {classes, t, file} = this.props;
        return (
            <div className={classes.listItem}>
                <Typography variant="subtitle2"
                            color="inherit"
                            className={classes.fileNameText}
                >{this.getFileName()}
                </Typography>
                {this.secondaryActionsList()}
                <div className={classes.grow}/>
                {this.statusText()}
                <Dialog open={this.state.anchorEl !== null}>
                    <DialogTitle>{t('label.contentManager.fileUpload.dialogRenameTitle')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t('label.contentManager.fileUpload.dialogRenameText')}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            label={t('label.contentManager.fileUpload.newName')}
                            type="text"
                            name={t('label.contentManager.fileUpload.dialogRenameExample')}
                            defaultValue={file.name}
                            onChange={event => this.onChangeName(event)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="default" onClick={this.hideRenameDialog}>
                            {t('label.contentManager.fileUpload.dialogRenameCancel')}
                        </Button>
                        <Button variant="contained" color="primary" onClick={this.rename}>
                            {t('label.contentManager.fileUpload.dialogRename')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    rename() {
        this.setState({
            anchorEl: null
        }, () => {
            this.changeStatusToUploading();
        });
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

            if (e.message.indexOf('FileSizeLimitExceededException') !== -1) {
                upload.error = 'INCORRECT_SIZE';
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
                <React.Fragment>
                    <FiberManualRecord className={classes.statusIcon} color="inherit"/>
                    <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                        {t('label.contentManager.fileUpload.queued')}
                    </Typography>
                </React.Fragment>
            );
        } else if (status === uploadStatuses.UPLOADED) {
            text = (
                <React.Fragment>
                    <CheckCircle className={classes.statusIcon} color="inherit"/>
                    <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                        {t('label.contentManager.fileUpload.uploaded')}
                    </Typography>
                </React.Fragment>
            );
        } else if (status === uploadStatuses.HAS_ERROR && error === 'FILE_EXISTS') {
            text = (
                <React.Fragment>
                    <Info className={classes.statusIcon} color="inherit"/>
                    <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                        {t('label.contentManager.fileUpload.exists')}
                    </Typography>
                </React.Fragment>
            );
        } else if (status === uploadStatuses.HAS_ERROR && error === 'INCORRECT_SIZE') {
            text = (
                <React.Fragment>
                    <Info className={classes.statusIcon} color="inherit"/>
                    <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                        {t('label.contentManager.fileUpload.cannotStore', {maxUploadSize: contextJsParameters.maxUploadSize})}
                    </Typography>
                </React.Fragment>
            );
        } else if (status === uploadStatuses.HAS_ERROR) {
            text = (
                <React.Fragment>
                    <Info className={classes.statusIcon} color="inherit"/>
                    <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                        {t('label.contentManager.fileUpload.failed')}
                    </Typography>
                </React.Fragment>
            );
        } else if (status === uploadStatuses.UPLOADING) {
            text = (
                <React.Fragment>
                    <CircularProgress size={20} className={classes.statusIcon} color="inherit"/>
                    <Typography variant="subtitle2" className={classes.progressText} color="inherit">
                        {t('label.contentManager.fileUpload.uploading')}
                    </Typography>
                </React.Fragment>
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
                    size="small"
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
                actions.push(
                    <Button
                        key="rename"
                        className={classes.actionButton}
                        component="a"
                        size="small"
                        onClick={e => {
                            this.showRenameDialog(e);
                        }}
                    >
                        {t('label.contentManager.fileUpload.rename')}
                    </Button>
                );

                actions.push(
                    <Button
                        key="overwrite"
                        className={classes.actionButton}
                        component="a"
                        size="small"
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
                        size="small"
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
                        size="small"
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
                        size="small"
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

    showRenameDialog(e) {
        this.setState({
            anchorEl: e.currentTarget
        });
    }

    hideRenameDialog() {
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

export default compose(
    withStyles(styles),
    translate(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(UploadItem);
