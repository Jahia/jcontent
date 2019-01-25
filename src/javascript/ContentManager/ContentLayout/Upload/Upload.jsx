import React from 'react';
import {CircularProgress, IconButton, Snackbar, Typography, withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';
import {CheckCircle, Close, Info} from '@material-ui/icons';
import {connect} from 'react-redux';
import {uploadsStatuses, uploadStatuses} from './Upload.constants';
import {setStatus, setUploads} from './Upload.redux-actions';
import UploadItem from './UploadItem';
import {batchActions} from 'redux-batched-actions';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import {files, onFilesSelected} from './Upload.utils';
import classNames from 'classnames';

const styles = theme => ({
    headerText: {
        display: 'block',
        color: theme.palette.text.contrastText
    },
    contentColor: {
        color: theme.palette.text.contrastText,
        display: 'inline-block',
        marginLeft: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2
    },
    statusIcon: {
        marginRight: theme.spacing.unit,
        display: 'inline-block',
        marginLeft: theme.spacing.unit * 4,
        marginTop: theme.spacing.unit * 2
    },
    closeButton: {
        marginBottom: theme.spacing.unit * 10,
        color: theme.palette.text.contrastText,
        position: 'absolute',
        top: 0,
        right: 0
    },
    snackBar: {
        backgroundColor: theme.palette.background.dark,
        bottom: theme.spacing.unit * 4,
        display: 'block',
        width: 800
    }
});

export class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.client = null;
        this.onFilesSelected = this.onFilesSelected.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.updateUploadsStatus = this.updateUploadsStatus.bind(this);
        this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
        this.overlayStyle = {
            active: {
                display: 'block',
                position: 'absolute',
                backgroundColor: props.theme.palette.secondary.main,
                opacity: '0.4',
                pointerEvents: 'none'
            },
            inactive: {
                display: 'none',
                pointerEvents: 'none'
            }
        };
    }

    componentDidUpdate() {
        this.updateUploadsStatus();
        if (this.props.uploadUpdateCallback) {
            this.props.uploadUpdateCallback(this.uploadStatus());
        }
    }

    handleCloseSnackBar() {
        this.closePanelAndClearUploads();
        this.updateUploadsStatus();
    }

    render() {
        let {classes} = this.props;
        return (
            <React.Fragment>
                <Snackbar open={this.props.uploads.length > 0} classes={{root: classes.snackBar}}>
                    <React.Fragment>
                        {this.headerText()}
                        {this.props.uploads.map((upload, index) => (
                            <UploadItem key={upload.id}
                                        index={index}
                                        file={files.acceptedFiles[index]}
                                        removeFile={this.removeFile}
                                        updateUploadsStatus={this.updateUploadsStatus}/>
                        ))}
                        <IconButton className={classes.closeButton} onClick={this.handleCloseSnackBar}>
                            <Close/>
                        </IconButton>
                    </React.Fragment>
                </Snackbar>
                <div style={this.generateOverlayStyle()}/>
            </React.Fragment>
        );
    }

    onFilesSelected(acceptedFiles) {
        onFilesSelected(acceptedFiles, this.props.dispatchBatch, {path: this.props.path});
    }

    removeFile(index) {
        files.acceptedFiles = files.acceptedFiles.filter((file, i) => {
            return i !== index;
        });
    }

    updateUploadsStatus() {
        let us;

        const status = this.uploadStatus();

        if (!status) {
            us = uploadsStatuses.NOT_STARTED;
        } else if (status.uploading !== 0) {
            us = uploadsStatuses.UPLOADING;
        } else if (status.error !== 0) {
            us = uploadsStatuses.HAS_ERROR;
        } else {
            us = uploadsStatuses.UPLOADED;
        }

        this.props.dispatch(setStatus(us));
    }

    closePanelAndClearUploads() {
        files.acceptedFiles = [];
        this.props.dispatch(setUploads([]));
    }

    uploadStatus() {
        const status = {
            uploading: 0,
            uploaded: 0,
            error: 0,
            total: this.props.uploads.length
        };

        if (this.props.uploads.length > 0) {
            this.props.uploads.forEach(upload => {
                switch (upload.status) {
                    case uploadStatuses.UPLOADED:
                        status.uploaded += 1;
                        break;
                    case uploadStatuses.HAS_ERROR:
                        status.error += 1;
                        break;
                    default:
                        status.uploading += 1;
                }
            });
        } else {
            return null;
        }
        return status;
    }

    headerText() {
        const {classes, t} = this.props;
        const status = this.uploadStatus();

        if (!status) {
            return null;
        }

        if (status.uploading !== 0) {
            return (
                <div className={classNames(classes.headerText)}>
                    <CircularProgress size={40}
                                      className={classes.statusIcon}/>
                    <Typography gutterBottom
                                className={classes.contentColor}
                                color="textSecondary"
                                data-cm-role="upload-status-uploading"
                    >
                        {t('label.contentManager.fileUpload.uploadingMessage', {uploaded: status.uploaded, total: status.total})}
                    </Typography>
                    { (status.error !== 0) &&
                        <Typography gutterBottom className={classes.contentColor}>
                            {t('label.contentManager.fileUpload.uploadingActionMessage')}
                        </Typography>
                    }
                </div>
            );
        }
        if (status.error !== 0) {
            return (
                <div className={classNames(classes.headerText)}>
                    <Info className={classNames(classes.statusIcon)}/>
                    <Typography gutterBottom
                                className={classes.contentColor}
                                data-cm-role="upload-status-error"
                    >
                        {t('label.contentManager.fileUpload.errorMessage')}
                    </Typography>
                </div>
            );
        }

        return (
            <div className={classNames(classes.headerText)}>
                <CheckCircle className={classNames(classes.statusIcon)}/>
                <Typography gutterBottom
                            className={classes.contentColor}
                            data-cm-role="upload-status-success"
                >
                    {t('label.contentManager.fileUpload.successfulUploadMessage', {count: status.total, number: status.total})}
                </Typography>
            </div>
        );
    }

    generateOverlayStyle() {
        let {overlayTarget} = this.props;
        if (overlayTarget !== null && overlayTarget.path === this.props.uploadPath) {
            return Object.assign({}, this.overlayStyle.active, {
                top: overlayTarget.y,
                left: overlayTarget.x,
                width: overlayTarget.width,
                height: overlayTarget.height
            });
        }
        return this.overlayStyle.inactive;
    }
}

Upload.propTypes = {
    classes: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    uploadUpdateCallback: PropTypes.func
};

Upload.defaultProps = {
    uploadUpdateCallback: () => {}
};

const mapStateToProps = (state, ownProps) => {
    if (ownProps.statePartName) {
        return state[ownProps.statePartName];
    }
    return state.fileUpload;
};

const mapDispatchToProps = dispatch => {
    return {
        dispatch: dispatch,
        dispatchBatch: actions => dispatch(batchActions(actions))
    };
};

export default compose(
    withStyles(styles, {withTheme: true}),
    translate(),
    connect(mapStateToProps, mapDispatchToProps))(Upload);
