import React from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {compose} from '~/utils';
import {withApollo} from '@apollo/react-hoc';
import {uploadStatuses} from '../Upload.constants';
import {withTranslation} from 'react-i18next';
import SecondaryActionsList from './SecondaryActionsList';
import Status from './Status';
import EditButton from './EditButton';
import {registry} from '@jahia/ui-extender';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './UploadItem.scss';

const UPLOAD_DELAY = 200;

export class UploadItem extends React.Component {
    constructor(props) {
        super(props);
        this.client = null;
        this.state = {
            userChosenName: null,
            anchorEl: null,
            component: null,
            uuid: null
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
            // If type folder do something check for conflict and call create folder and not upload file
            this.doUploadAndStatusUpdate();
            this.props.updateUploadsStatus();
        }
    }

    render() {
        const {t, file, entry} = this.props;

        const fileName = this.getFileName();
        const isNameSizeValid = fileName && fileName.length <= contextJsParameters.config.maxNameSize;
        const isNameCharsValid = fileName.match(JContentConstants.namingInvalidCharactersRegexp) === null;
        let errMsg = '';

        if (!isNameSizeValid) {
            errMsg = t('jcontent:label.contentManager.fileUpload.fileNameSizeExceedLimit', {maxNameSize: contextJsParameters.config.maxNameSize});
        }

        if (!isNameCharsValid) {
            errMsg = t('jcontent:label.contentManager.fileUpload.invalidChars');
        }

        return (
            <div className={styles.listItem}>
                <Typography className={styles.fileNameText}>
                    {fileName}
                </Typography>
                <SecondaryActionsList
                    {...this.props}
                    showRenameDialog={e => this.setState({
                        anchorEl: e.currentTarget
                    })}
                    doUploadAndStatusUpdate={this.doUploadAndStatusUpdate}
                />
                <div className={styles.grow}/>
                <Status {...this.props}/>
                {this.state.component}
                {file && <EditButton {...this.props} uuid={this.state.uuid}/>}
                <Dialog open={this.state.anchorEl !== null}>
                    <DialogTitle>
                        {t('jcontent:label.contentManager.fileUpload.dialogRenameTitle')}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t('jcontent:label.contentManager.fileUpload.dialogRenameText')}
                        </DialogContentText>
                        <TextField
                            fullWidth
                            autoFocus
                            error={Boolean(errMsg)}
                            label={t('jcontent:label.contentManager.fileUpload.newName')}
                            type="text"
                            id="rename-dialog-text"
                            name={t('jcontent:label.contentManager.fileUpload.dialogRenameExample')}
                            helperText={errMsg}
                            defaultValue={file ? file.name : entry.name}
                            onChange={e => this.setState({userChosenName: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button label={t('jcontent:label.contentManager.fileUpload.dialogRenameCancel')} data-cm-role="rename-dialog-cancel" size="big" onClick={() => this.setState({anchorEl: null})}/>
                        <Button label={t('jcontent:label.contentManager.fileUpload.dialogRename')} data-cm-role="rename-dialog" size="big" color="accent" isDisabled={Boolean(errMsg)} onClick={() => this.setState({anchorEl: null}, () => this.changeStatusToUploading())}/>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    doUploadAndStatusUpdate(type = this.props.type) {
        const upload = {
            id: this.props.id,
            status: null,
            error: null,
            path: this.props.path,
            type: this.props.type,
            uuid: null
        };
        try {
            this.handleUpload(type).then(uploadReturnObj => {
                upload.status = uploadStatuses.UPLOADED;
                upload.uuid = uploadReturnObj.uuid;

                setTimeout(() => {
                    this.props.uploadFile(upload);
                    this.props.updateUploadsStatus();
                    const {component, uuid} = uploadReturnObj;
                    if (typeof component !== 'undefined' && component !== null && React.isValidElement(component)) {
                        this.setState({component: component});
                    }

                    if (typeof uuid !== 'undefined' && uuid !== null) {
                        this.setState({uuid: uuid});
                    }
                }, UPLOAD_DELAY);
            }).catch(e => {
                // Server side errors
                upload.status = uploadStatuses.HAS_ERROR;

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
        } catch (error) {
            // Client side errors
            upload.status = uploadStatuses.HAS_ERROR;
            upload.error = error.message;

            setTimeout(() => {
                this.props.uploadFile(upload);
                this.props.updateUploadsStatus();
            }, UPLOAD_DELAY);
        }
    }

    handleUpload(type) {
        const {file, path, client} = this.props;
        if (type === 'import') {
            return registry.get('fileUpload', 'import').handleUpload({path, file, client});
        }

        if (type === 'replace') {
            let newPath = `${path}/${this.getFileName()}`;
            return registry.get('fileUpload', 'replace').handleUpload({path: newPath, file, client});
        }

        if (type === 'replaceWith') {
            return registry.get('fileUpload', 'replace').handleUpload({path, file, client});
        }

        const filename = this.getFileName();
        return registry.get('fileUpload', 'default').handleUpload({path, file, filename, client});
    }

    getFileName() {
        return (this.state.userChosenName ? this.state.userChosenName : (this.props.file ? this.props.file.name : this.props.entry.name));
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
    updateUploadsStatus: PropTypes.func.isRequired,
    file: PropTypes.object,
    entry: PropTypes.object,
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
    withTranslation(),
    withApollo
)(UploadItem);
