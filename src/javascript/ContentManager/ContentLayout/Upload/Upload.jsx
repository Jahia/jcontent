import React from 'react';
import {CircularProgress, IconButton, List, Typography, withStyles} from '@material-ui/core';
import PropTypes from 'prop-types';
import {CheckCircle, Close, Fullscreen, FullscreenExit, Info} from '@material-ui/icons';
import {connect} from 'react-redux';
import UploadDrawer from './UploadDrawer';
import {panelStates, uploadsStatuses, uploadStatuses} from './Upload.constants';
import {setPanelState, setStatus, setUploads} from './Upload.redux-actions';
import UploadDropZone from './UploadDropZone';
import UploadItem from './UploadItem';
import {batchActions} from 'redux-batched-actions';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import {files, getMimeTypes, onFilesSelected} from './Upload.utils';
import classNames from 'classnames';

const styles = theme => ({
    drawerContent: {
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.5s ease 0s'
    },
    contentHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        padding: '0 ' + theme.spacing.unit + 'px',
        ...theme.mixins.toolbar
    },
    buttonHolder: {
        marginBottom: '15px',
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end'
    },
    headerText: {
        marginBottom: '15px',
        display: 'flex',
        flex: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    justifyCenter: {
        justifyContent: 'center'
    },
    contentBody: {
        display: 'flex',
        justifyContent: 'center',
        height: 300,
        overflowY: 'auto',
        overflowX: 'none'
    },
    drawerContentOrange: {
        backgroundColor: theme.palette.secondary.main,
        '&$drawerContentPartial': {
            '& $contentColor': {
                color: theme.palette.getContrastText(theme.palette.secondary.main)
            },
            '& $buttonHolder': {
                '& button': {
                    color: theme.palette.getContrastText(theme.palette.secondary.main)
                }
            }
        }
    },
    drawerContentGreen: {
        backgroundColor: theme.palette.valid.main,
        '&$drawerContentPartial': {
            '& $contentColor': {
                color: theme.palette.getContrastText(theme.palette.valid.main)
            },
            '& $buttonHolder': {
                '& button': {
                    color: theme.palette.getContrastText(theme.palette.valid.main)
                }
            }
        }
    },
    drawerContentRed: {
        backgroundColor: theme.palette.error.main,
        '&$drawerContentPartial': {
            '& $contentColor': {
                color: theme.palette.getContrastText(theme.palette.error.main)
            },
            '& $buttonHolder': {
                '& button': {
                    color: theme.palette.getContrastText(theme.palette.error.main)
                }
            }
        }
    },
    contentColor: {
        color: theme.palette.text.secondary
    },
    drawerContentFull: {
        height: 350
    },
    drawerContentPartial: {
        height: 50,
        overflow: 'hidden'
    },
    uploadList: {
        width: '100%'
    },
    statusIconRed: {
        marginRight: theme.spacing.unit,
        color: theme.palette.error.main
    },
    statusIconGreen: {
        marginRight: theme.spacing.unit,
        color: theme.palette.valid.main
    },
    statusIconOrange: {
        marginRight: theme.spacing.unit,
        color: theme.palette.secondary.main
    },
    statusErrorText: {
        marginLeft: theme.spacing.unit
    }
});

const DRAWER_ANIMATION_TIME = 300;

export class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.client = null;
        this.onFilesSelected = this.onFilesSelected.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.updateUploadsStatus = this.updateUploadsStatus.bind(this);
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

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <UploadDrawer open={this.isDrawerOpen()} transitionDuration={this.transitionDuration()}>
                    <div className={this.contentClasses()}>
                        <div className={classes.contentHeader}>
                            { this.headerText() }
                            { this.headerButton() }
                        </div>
                        <div className={classes.contentBody}>
                            { this.configureRendering() }
                        </div>
                    </div>
                </UploadDrawer>
                <div style={this.generateOverlayStyle()}/>
            </React.Fragment>
        );
    }

    configureRendering() {
        const {classes, uploads, acceptedFileTypes} = this.props;
        if (uploads.length === 0) {
            return (
                <UploadDropZone acceptedFileTypes={getMimeTypes(acceptedFileTypes)}
                                onFilesSelected={this.onFilesSelected}/>
            );
        }
        return (
            <List className={classes.uploadList} component="nav">
                { this.showUploads() }
            </List>
        );
    }

    onFilesSelected(acceptedFiles) {
        onFilesSelected(acceptedFiles, this.props.dispatchBatch, {path: this.props.path});
    }

    showUploads() {
        return this.props.uploads.map((upload, index) => (
            <UploadItem key={upload.id}
                        index={index}
                        file={files.acceptedFiles[index]}
                        removeFile={this.removeFile}
                        updateUploadsStatus={this.updateUploadsStatus}/>
        ));
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

    isDrawerOpen() {
        const {panelState} = this.props;
        return panelState === panelStates.VISIBLE || panelState === panelStates.PARTIALLY_VISIBLE;
    }

    contentClasses() {
        const {panelState, status, classes, uploads} = this.props;
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
        const {panelState, status, classes} = this.props;

        if (status === uploadsStatuses.NOT_STARTED || status === uploadsStatuses.UPLOADED) {
            return (
                <div className={classes.buttonHolder}>
                    <IconButton color={(status === uploadsStatuses.UPLOADED && panelState === panelStates.VISIBLE) ? 'secondary' : 'default'} data-cm-role="upload-close-button" onClick={() => this.closePanelAndClearUploads()}>
                        <Close/>
                    </IconButton>
                </div>
            );
        }

        return (
            <div className={classes.buttonHolder}>
                <IconButton color={(panelState === panelStates.VISIBLE) ? 'secondary' : 'default'}
                            onClick={() => {
                                    const newState = (panelState === panelStates.PARTIALLY_VISIBLE) ? panelStates.VISIBLE : panelStates.PARTIALLY_VISIBLE;
                                    this.props.dispatch(setPanelState(newState));
                                }
                            }
                >
                    {(panelState === panelStates.VISIBLE) ?
                        <FullscreenExit/> :
                        <Fullscreen/>
                    }
                </IconButton>
            </div>
        );
    }

    closePanelAndClearUploads() {
        files.acceptedFiles = [];
        this.props.dispatchBatch([setPanelState(panelStates.INVISIBLE), setUploads([])]);
    }

    transitionDuration() {
        // Setting to 0 prevents panel from going up when it is in partial state and close button is clicked
        const {panelState, status} = this.props;
        if (status === uploadsStatuses.NOT_STARTED) {
            return DRAWER_ANIMATION_TIME;
        }
        if (status === uploadsStatuses.UPLOADED && panelState.VISIBLE) {
            return DRAWER_ANIMATION_TIME;
        }
        return 0;
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
        const {panelState, classes, t} = this.props;
        const status = this.uploadStatus();

        if (!status) {
            return null;
        }

        let isPartiallyVisible = (panelState === panelStates.PARTIALLY_VISIBLE);
        if (status.uploading !== 0) {
            return (
                <Typography variant="h3"
                            className={classNames(classes.headerText, isPartiallyVisible && classes.justifyCenter)}
                >
                    <CircularProgress size={isPartiallyVisible ? 20 : 40}
                                      className={classNames(classes.statusIconOrange, isPartiallyVisible && classes.contentColor)}/>
                    <Typography gutterBottom={!isPartiallyVisible}
                                className={classNames(isPartiallyVisible && classes.contentColor)}
                                color="textSecondary"
                                data-cm-role="upload-status-uploading"
                    >
                        {t('label.contentManager.fileUpload.uploadingMessage', {uploaded: status.uploaded, total: status.total})}
                    </Typography>
                    { (!isPartiallyVisible && status.error !== 0) &&
                        <Typography gutterBottom color="textSecondary">
                            {t('label.contentManager.fileUpload.uploadingActionMessage')}
                        </Typography>
                    }
                </Typography>
            );
        }
        if (status.error !== 0) {
            return (
                <Typography variant="h3"
                            className={classNames(classes.headerText, isPartiallyVisible && classes.justifyCenter)}
                >
                    <Info className={classNames(classes.statusIconRed, isPartiallyVisible && classes.contentColor)}
                          fontSize={isPartiallyVisible ? 'default' : 'large'}/>
                    <Typography gutterBottom={!isPartiallyVisible}
                                className={classNames(isPartiallyVisible && classes.contentColor)}
                                color="textSecondary"
                                data-cm-role="upload-status-error"
                    >
                        {t('label.contentManager.fileUpload.errorMessage')}
                    </Typography>
                    <Typography gutterBottom={!isPartiallyVisible}
                                className={classNames(classes.statusErrorText, isPartiallyVisible && classes.contentColor)}
                                color="textSecondary"
                    >
                        {isPartiallyVisible ?
                            <a className={classes.contentColor}
                               href="#"
                               onClick={() => this.props.dispatch(setPanelState(panelStates.VISIBLE))}
                            >
                                {t('label.contentManager.fileUpload.errorActionMessage')}
                            </a> :
                            t('label.contentManager.fileUpload.errorActionMessage')
                        }
                    </Typography>
                </Typography>
            );
        }

        return (
            <Typography variant="h3"
                        className={classNames(classes.headerText, isPartiallyVisible && classes.justifyCenter)}
            >
                <CheckCircle className={classNames(classes.statusIconGreen, isPartiallyVisible && classes.contentColor)}
                             fontSize={isPartiallyVisible ? 'default' : 'large'}/>
                <Typography gutterBottom={!isPartiallyVisible}
                            className={classNames(isPartiallyVisible && classes.contentColor)}
                            color="textSecondary"
                            data-cm-role="upload-status-success"
                >
                    {t('label.contentManager.fileUpload.successfulUploadMessage', {count: status.total, number: status.total})}
                </Typography>
            </Typography>
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
    acceptedFileTypes: PropTypes.array,
    uploadUpdateCallback: PropTypes.func
};

Upload.defaultProps = {
    acceptedFileTypes: null,
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
