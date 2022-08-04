import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {batchActions} from 'redux-batched-actions';
import {
    createMissingFolders,
    fileIgnored,
    fileMatchSize,
    getDataTransferItems,
    isDragDataWithFiles,
    onFilesSelected
} from '../Upload/Upload.utils';
import {fileuploadAddUploads, fileuploadSetOverlayTarget} from '../Upload/Upload.redux';
import {withApollo} from 'react-apollo';
import {compose} from '~/utils';
import {UploadRequirementsQuery} from './UploadTransformComponent.gql-queries';
import JContentConstants from '~/JContent/JContent.constants';
import {ACTION_PERMISSIONS} from '../../../actions/actions.constants';
import randomUUID from 'uuid/v4';
import {uploadStatuses} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.constants';

const ACCEPTING_NODE_TYPES = ['jnt:folder', 'jnt:contentFolder'];

async function scan(fileList, uploadMaxSize, uploadMinSize, uploadPath) {
    const files = [];
    const directories = [];

    async function scanFiles(entry) {
        if (entry.isDirectory) {
            directories.push({
                path: uploadPath + entry.fullPath.substring(0, entry.fullPath.indexOf('/' + entry.name)),
                entry
            });
            let directoryReader = entry.createReader();
            const entries = await new Promise((res, rej) => {
                directoryReader.readEntries(res, rej);
            });
            await Promise.all(entries.map(entry => scanFiles(entry)));
        } else {
            const file = await new Promise((res, rej) => {
                entry.file(res, rej);
            });
            if (fileMatchSize(file, uploadMaxSize, uploadMinSize) && !fileIgnored(file)) {
                files.push({
                    path: entry.fullPath ? uploadPath + entry.fullPath.substring(0, entry.fullPath.indexOf('/' + entry.name)) : uploadPath,
                    entry,
                    file
                });
            }
        }
    }

    const entries = fileList.map(f => ({
        file: f,
        webkitEntry: f.webkitGetAsEntry()
    }));

    await Promise.all(entries.map(entry => {
        if (entry.webkitEntry) {
            return scanFiles(entry.webkitEntry);
        }

        if (fileMatchSize(entry.file, uploadMaxSize, uploadMinSize)) {
            files.push({path: uploadPath, file: entry.file});
        }

        return Promise.resolve();
    }));

    return {files, directories};
}

export class UploadTransformComponent extends React.Component {
    constructor(props) {
        super(props);
        // This property avoid to call setState when the component is unmounted, which can happen in the checkPermission function
        this._isMounted = false;
        this.state = {
            allowDrop: false
        };
        this.dragTargets = [];
        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        this.checkPermission();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const {uploadTargetComponent: Component} = this.props;

        if (this.state.allowDrop) {
            return (
                <Component
                    onDragOver={this.onDragOver}
                    onDragEnter={this.onDragEnter}
                    onDragLeave={this.onDragLeave}
                    onDrop={this.onDrop}
                    {...this.generatePropertiesForComponent()}
                />
            );
        }

        return (
            <Component {...this.generatePropertiesForComponent()}/>
        );
    }

    generatePropertiesForComponent() {
        const {
            uploadTargetComponent,
            uploadPath,
            uploadAcceptedFileTypes,
            uploadMinSize,
            uploadMaxSize,
            uploadDispatchBatch,
            uploadSetOverlayTarget,
            client,
            ...props
        } = this.props;
        return props;
    }

    onDragEnter(evt) {
        evt.preventDefault();

        // Count the dropzone and any children that are entered.
        if (this.dragTargets.indexOf(evt.target) === -1) {
            this.dragTargets.push(evt.target);
            this.node = evt.target;
        }

        evt.persist();
        let position = this.getOverlayPosition(evt.currentTarget);
        this.props.uploadSetOverlayTarget(position);
    }

    onDragOver(evt) {
        evt.preventDefault();
        evt.persist();
        return false;
    }

    onDragLeave(evt) {
        evt.preventDefault();
        evt.persist();

        this.dragTargets = this.dragTargets.filter(el => el !== evt.target && this.node.contains(el));
        if (this.dragTargets.length > 0) {
            return;
        }

        this.props.uploadSetOverlayTarget(null);
    }

    onDrop(evt) {
        const {uploadMaxSize, uploadMinSize, uploadPath, mode} = this.props;

        evt.preventDefault();
        evt.persist();
        this.dragTargets = [];

        this.props.uploadSetOverlayTarget(null);
        if (isDragDataWithFiles(evt)) {
            const fileList = getDataTransferItems(evt);
            if (evt.isPropagationStopped()) {
                return;
            }

            const asyncScanAndUpload = async () => {
                const {directories, files} = await scan(fileList, uploadMaxSize, uploadMinSize, uploadPath);
                let acceptedFiles = files;

                if (mode === JContentConstants.mode.MEDIA) {
                    const {conflicts} = await createMissingFolders(this.props.client, directories);

                    if (conflicts.length > 0) {
                        const uploads = conflicts.map(dir => ({
                            status: uploadStatuses.HAS_ERROR,
                            error: 'FOLDER_EXISTS',
                            ...dir,
                            id: randomUUID()
                        }));
                        conflicts.forEach(dir => {
                            acceptedFiles = acceptedFiles.filter(f => !f.path.startsWith(uploadPath + dir.entry.fullPath));
                        });
                        this.props.uploadAddUploads(uploads);
                    }
                }

                onFilesSelected({
                    acceptedFiles,
                    dispatchBatch: this.props.uploadDispatchBatch,
                    type: mode === JContentConstants.mode.MEDIA ? JContentConstants.mode.UPLOAD : JContentConstants.mode.IMPORT
                });
            };

            asyncScanAndUpload().then(() => {});
        }
    }

    async checkPermission() {
        try {
            const result = await this.props.client.query({
                variables: {
                    path: this.props.uploadPath,
                    permittedNodeTypes: ACCEPTING_NODE_TYPES,
                    permission: 'jcr:addChildNodes',
                    sitePermission: ACTION_PERMISSIONS.uploadFilesAction
                },
                query: UploadRequirementsQuery
            });

            if (result.data.jcr.results.hasPermission && result.data.jcr.results.site.hasPermission && result.data.jcr.results.acceptsFiles && this._isMounted) {
                this.setState({
                    allowDrop: true
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Calculates elements position if/when scrolled.
    // Adaptation of https://stackoverflow.com/questions/1236171/how-do-i-calculate-an-elements-position-in-a-scrolled-div
    getOverlayPosition(el) {
        let boundingClientRect = el.getBoundingClientRect();
        let position = {
            x: boundingClientRect.left,
            y: boundingClientRect.top,
            width: boundingClientRect.width,
            height: boundingClientRect.height
        };
        if (el.offsetParent && el.offsetParent.offsetTop === 0) {
            return position;
        }

        position.x = 0;
        position.y = 0;
        while (el && el.offsetParent) {
            position.x += el.offsetLeft - el.offsetParent.scrollLeft || 0;
            position.y += el.offsetTop - el.offsetParent.scrollTop || 0;
            el = el.offsetParent;
        }

        return position;
    }
}

const mapDispatchToProps = dispatch => {
    return {
        uploadAddUploads: uploads => dispatch(fileuploadAddUploads(uploads)),
        uploadDispatchBatch: actions => dispatch(batchActions(actions)),
        uploadSetOverlayTarget: state => dispatch(fileuploadSetOverlayTarget(state))
    };
};

UploadTransformComponent.propTypes = {
    uploadTargetComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
    uploadPath: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    uploadAddUploads: PropTypes.func.isRequired,
    uploadDispatchBatch: PropTypes.func.isRequired,
    uploadSetOverlayTarget: PropTypes.func.isRequired,
    client: PropTypes.object.isRequired,
    uploadAcceptedFileTypes: PropTypes.array,
    uploadMaxSize: PropTypes.number,
    uploadMinSize: PropTypes.number
};

UploadTransformComponent.defaultProps = {
    uploadMaxSize: Infinity,
    uploadMinSize: 0
};

export default compose(
    withApollo,
    connect(null, mapDispatchToProps)
)(UploadTransformComponent);
