import React from 'react';
import PropTypes from 'prop-types';
import {Snackbar, withStyles} from '@material-ui/core';
import {IconButton} from '@jahia/ds-mui-theme';
import {Close} from '@material-ui/icons';
import {connect} from 'react-redux';
import {uploadsStatuses, uploadStatuses} from './Upload.constants';
import {setStatus, setUploads} from './Upload.redux-actions';
import UploadItem from './UploadItem';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import {files} from './Upload.utils';
import UploadHeader from './UploadHeader';

const styles = theme => ({
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0
    },
    snackBar: {
        backgroundColor: theme.palette.background.dark,
        bottom: theme.spacing.unit * 4,
        display: 'block',
        width: 800,
        padding: 24
    },
    snackBarScroll: {
        maxHeight: '150px',
        overflow: 'auto'
    }
});

export class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.client = null;
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
        let {classes, uploads} = this.props;

        return (
            <React.Fragment>
                <Snackbar open={uploads.length > 0} classes={{root: classes.snackBar}}>
                    <React.Fragment>
                        <UploadHeader status={this.uploadStatus()}/>
                        <div className={classes.snackBarScroll}>
                            {uploads.map((upload, index) => (
                                <UploadItem
                                    key={upload.id}
                                    type={upload.type}
                                    index={index}
                                    file={files.acceptedFiles[index]}
                                    removeFile={this.removeFile}
                                    updateUploadsStatus={this.updateUploadsStatus}
                                />
                            ))}
                        </div>
                        <IconButton color="inverted" size="compact" data-cm-role="upload-close-button" icon={<Close/>} className={classes.closeButton} onClick={this.handleCloseSnackBar}/>
                    </React.Fragment>
                </Snackbar>
                <div style={this.generateOverlayStyle()}/>
            </React.Fragment>
        );
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
        if (us !== this.props.status) {
            this.props.setStatus(us);
        }
    }

    closePanelAndClearUploads() {
        files.acceptedFiles = [];
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

const mapStateToProps = (state, ownProps) => {
    if (ownProps.statePartName) {
        return state[ownProps.statePartName];
    }
    return {
        status: state.fileUpload.status,
        uploads: state.fileUpload.uploads,
        overlayTarget: state.fileUpload.overlayTarget
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setStatus: s => dispatch(setStatus(s)),
        clearUploads: () => dispatch(setUploads([]))
    };
};

Upload.propTypes = {
    theme: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    setStatus: PropTypes.func.isRequired,
    clearUploads: PropTypes.func.isRequired,
    status: PropTypes.string,
    uploads: PropTypes.array.isRequired,
    uploadPath: PropTypes.string,
    overlayTarget: PropTypes.object,
    uploadUpdateCallback: PropTypes.func.isRequired
};

export default compose(
    withStyles(styles, {withTheme: true}),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(Upload);
