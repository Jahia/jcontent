import React from 'react';
import PropTypes from 'prop-types';
import {Snackbar} from '@material-ui/core';
import {Button, Close} from '@jahia/moonstone';
import {connect} from 'react-redux';
import {NUMBER_OF_SIMULTANEOUS_UPLOADS, uploadsStatuses, uploadStatuses} from './Upload.constants';
import {
    fileuploadRemoveUpload,
    fileuploadSetStatus,
    fileuploadSetUploads,
    fileuploadTakeFromQueue,
    fileuploadUpdateUpload
} from './Upload.redux';
import UploadItem from './UploadItem';
import {compose} from '~/utils';
import UploadHeader from './UploadHeader';
import {batchActions} from 'redux-batched-actions';
import styles from './Upload.scss';

const SNACKBAR_CLOSE_TIMEOUT = 8000;

export class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.client = null;
        this.closeTimeout = null;
        this.updateUploadsStatus = this.updateUploadsStatus.bind(this);
        this.handleCloseSnackBar = this.handleCloseSnackBar.bind(this);
        this.clearCloseTimeout = this.clearCloseTimeout.bind(this);
        this.overlayStyle = {
            active: {
                display: 'flex',
                position: 'absolute',
                backgroundColor: 'var(--color-white)',
                opacity: '0.9',
                pointerEvents: 'none',
                'z-index': '9999'
            },
            inactive: {
                display: 'none',
                pointerEvents: 'none'
            }
        };
    }

    componentDidUpdate() {
        this.updateUploadsStatus();
        const uploadStatus = this.uploadStatus();
        if (this.props.uploadUpdateCallback) {
            this.props.uploadUpdateCallback(uploadStatus);
        }

        if (uploadStatus && uploadStatus.error === 0 && uploadStatus.uploading === 0 && uploadStatus.uploaded > 0) {
            this.closeTimeout = setTimeout(() => {
                this.clearCloseTimeout();
                this.handleCloseSnackBar();
            }, SNACKBAR_CLOSE_TIMEOUT);
        }
    }

    clearCloseTimeout() {
        if (this.closeTimeout !== null) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }
    }

    handleCloseSnackBar() {
        this.closePanelAndClearUploads();
        this.updateUploadsStatus();
    }

    render() {
        let {uploads, updateUpload, uploadFile, removeUploadFromQueue} = this.props;

        return (
            <Snackbar open={uploads.length > 0} classes={{root: styles.snackBar}}>
                <React.Fragment>
                    <UploadHeader status={this.uploadStatus()}/>
                    <div className={styles.snackBarScroll}>
                        {uploads.map((upload, index) => (
                            <UploadItem
                                    key={upload.id}
                                    index={index}
                                    updateUploadsStatus={this.updateUploadsStatus}
                                    updateUpload={updateUpload}
                                    uploadFile={uploadFile}
                                    removeUploadFromQueue={removeUploadFromQueue}
                                    {...upload}
                                />
                            ))}
                    </div>
                    <Button isReversed
                            variant="ghost"
                            size="small"
                            data-cm-role="upload-close-button"
                            icon={<Close/>}
                            className={styles.closeButton}
                            onClick={this.handleCloseSnackBar}/>
                </React.Fragment>
            </Snackbar>
        );
    }

    updateUploadsStatus() {
        let us;

        const status = this.uploadStatus();

        if (!status) {
            us = uploadsStatuses.NOT_STARTED;
        } else if (status.uploading > 0) {
            us = uploadsStatuses.UPLOADING;
        } else if (status.error > 0) {
            us = uploadsStatuses.HAS_ERROR;
        } else {
            us = uploadsStatuses.UPLOADED;
        }

        if (us !== this.props.status) {
            this.props.setStatus(us);
        }
    }

    closePanelAndClearUploads() {
        // Files.acceptedFiles = [];
        this.props.clearUploads();
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

                if (upload.type === 'import') {
                    status.type = 'import';
                }
            });
        } else {
            return null;
        }

        return status;
    }
}

const mapStateToProps = (state, ownProps) => {
    if (ownProps.statePartName) {
        return state[ownProps.statePartName];
    }

    return {
        status: state.jcontent.fileUpload.status,
        uploads: state.jcontent.fileUpload.uploads
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setStatus: s => dispatch(fileuploadSetStatus(s)),
        clearUploads: () => dispatch(fileuploadSetUploads([])),
        updateUpload: upload => dispatch(fileuploadUpdateUpload(upload)),
        uploadFile: upload => {
            dispatch(batchActions([fileuploadUpdateUpload(upload), fileuploadTakeFromQueue(NUMBER_OF_SIMULTANEOUS_UPLOADS)]));
        },
        removeUploadFromQueue: index => dispatch(fileuploadRemoveUpload(index))

    };
};

Upload.propTypes = {
    setStatus: PropTypes.func.isRequired,
    clearUploads: PropTypes.func.isRequired,
    status: PropTypes.string,
    uploads: PropTypes.array.isRequired,
    uploadPath: PropTypes.string,
    uploadUpdateCallback: PropTypes.func.isRequired,
    updateUpload: PropTypes.func.isRequired,
    uploadFile: PropTypes.func.isRequired,
    removeUploadFromQueue: PropTypes.func.isRequired
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps)
)(Upload);
