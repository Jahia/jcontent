import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    withStyles
} from '@material-ui/core';
import {Button, Typography} from '@jahia/design-system-kit';
import {compose, withApollo} from 'react-apollo';
import {importContent, updateFileContent, uploadFile} from './UploadItem.gql-mutations';
import {uploadStatuses} from '../Upload.constants';
import {translate} from 'react-i18next';
import SecondaryActionsList from './SecondaryActionsList';
import Status from './Status';

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

        this.doUploadAndStatusUpdate = this.doUploadAndStatusUpdate.bind(this);
    }

    // Dependent on timing conditions, sometimes the component is mounted when the upload item has entered the UPLOADING state already.
    componentDidMount() {
        if (this.props.status === uploadStatuses.UPLOADING) {
            this.doUploadAndStatusUpdate();
            this.props.updateUploadsStatus();
        }
    }

    // And sometimes the upload item enters the UPLOADING state when the component has already been mounted.
    componentDidUpdate(prevProps) {
        if (this.props.status === uploadStatuses.UPLOADING && prevProps.status !== uploadStatuses.UPLOADING) {
            this.doUploadAndStatusUpdate();
            this.props.updateUploadsStatus();
        }
    }

    render() {
        const {classes, t, file} = this.props;
        return (
            <div className={classes.listItem}>
                <Typography variant="zeta" color="inherit" className={classes.fileNameText}>
                    {this.getFileName()}
                </Typography>
                <SecondaryActionsList
                    {...this.props}
                    showRenameDialog={e => this.setState({
                        anchorEl: e.currentTarget
                    })}
                    doUploadAndStatusUpdate={this.doUploadAndStatusUpdate}
                />
                <div className={classes.grow}/>
                <Status {...this.props}/>
                <Dialog open={this.state.anchorEl !== null}>
                    <DialogTitle>
                        {t('label.contentManager.fileUpload.dialogRenameTitle')}
                    </DialogTitle>
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
                            onChange={e => this.setState({userChosenName: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="secondary" onClick={() => this.setState({anchorEl: null})}>
                            {t('label.contentManager.fileUpload.dialogRenameCancel')}
                        </Button>
                        <Button variant="primary" data-cm-role="upload-rename-button" onClick={() => this.setState({anchorEl: null}, () => this.changeStatusToUploading())}>
                            {t('label.contentManager.fileUpload.dialogRename')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    doUploadAndStatusUpdate(type = this.props.type) {
        this.handleUpload(type).then(() => {
            const upload = {
                id: this.props.id,
                status: uploadStatuses.UPLOADED,
                error: null,
                path: this.props.path,
                type: this.props.type
            };
            setTimeout(() => {
                this.props.uploadFile(upload);
                this.props.updateUploadsStatus();
            }, UPLOAD_DELAY);
        }).catch(e => {
            const upload = {
                id: this.props.id,
                status: uploadStatuses.HAS_ERROR,
                error: null,
                path: this.props.path,
                type: this.props.type
            };

            if (e.message.indexOf('GqlJcrWrongInputException') !== -1) {
                upload.error = 'WRONG_INPUT';
            }

            if (e.message.indexOf('ItemExistsException') !== -1) {
                upload.error = 'FILE_EXISTS';
            }

            if (e.message.indexOf('FileSizeLimitExceededException') !== -1) {
                upload.error = 'INCORRECT_SIZE';
            }

            setTimeout(() => {
                this.props.uploadFile(upload);
                this.props.updateUploadsStatus();
            }, UPLOAD_DELAY);
        });
    }

    handleUpload(type) {
        const {file, path, client} = this.props;

        if (type === 'import') {
            return client.mutate({
                mutation: importContent,
                variables: {
                    path: `${path}`,
                    fileHandle: file
                }
            });
        }

        if (type === 'replace') {
            return client.mutate({
                mutation: updateFileContent,
                variables: {
                    path: `${path}/${this.getFileName()}`,
                    mimeType: file.type,
                    fileHandle: file
                }
            });
        }

        if (type === 'replaceWith') {
            return client.mutate({
                mutation: updateFileContent,
                variables: {
                    path: `${path}`,
                    mimeType: file.type,
                    fileHandle: file
                }
            });
        }

        return client.mutate({
            mutation: uploadFile,
            variables: {
                fileHandle: file,
                nameInJCR: this.getFileName(),
                path: path,
                mimeType: file.type
            }
        });
    }

    getFileName() {
        return (this.state.userChosenName ? this.state.userChosenName : this.props.file.name);
    }

    changeStatusToUploading() {
        const upload = {
            id: this.props.id,
            status: uploadStatuses.UPLOADING,
            error: null,
            path: this.props.path
        };
        this.props.updateUpload(upload);
    }
}

UploadItem.propTypes = {
    classes: PropTypes.object.isRequired,
    removeFile: PropTypes.func.isRequired,
    updateUploadsStatus: PropTypes.func.isRequired,
    file: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string,
    id: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    client: PropTypes.object.isRequired,
    updateUpload: PropTypes.func.isRequired,
    uploadFile: PropTypes.func.isRequired,
    removeUploadFromQueue: PropTypes.func.isRequired
};

export default compose(
    withStyles(styles),
    translate(),
    withApollo,
)(UploadItem);
