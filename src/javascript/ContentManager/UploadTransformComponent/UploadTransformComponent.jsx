import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {batchActions} from 'redux-batched-actions/lib/index';
import {fileAccepted, fileMatchSize, getDataTransferItems,
    isDragDataWithFiles, getMimeTypes, onFilesSelected} from '../Upload/Upload.utils';
import {setPanelState, setOverlayTarget} from '../Upload/Upload.redux-actions';
import {panelStates} from '../Upload/Upload.constants';
import {withApollo, compose} from 'react-apollo';
import {UploadRequirementsQuery} from './UploadTransformComponent.gql-queries';

const ACCEPTING_NODE_TYPES = ['jnt:folder'];

export class UploadTransformComponent extends React.Component {
    constructor(props) {
        super(props);
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
        this.checkPermission();
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
        const {uploadAcceptedFileTypes, uploadMaxSize, uploadMinSize, uploadPath} = this.props;
        const accept = getMimeTypes(uploadAcceptedFileTypes);

        evt.preventDefault();
        evt.persist();
        this.dragTargets = [];

        this.props.uploadSetOverlayTarget(null);
        if (isDragDataWithFiles(evt)) {
            Promise.resolve(getDataTransferItems(evt)).then(fileList => {
                const acceptedFiles = [];

                if (evt.isPropagationStopped()) {
                    return;
                }

                fileList.forEach(file => {
                    if (
                        fileAccepted(file, accept) &&
                        fileMatchSize(file, uploadMaxSize, uploadMinSize)
                    ) {
                        acceptedFiles.push(file);
                    }
                });
                onFilesSelected(
                    acceptedFiles,
                    this.props.uploadDispatchBatch,
                    {path: uploadPath},
                    [setPanelState(panelStates.VISIBLE)]
                );
            });
        }
    }

    async checkPermission() {
        try {
            const result = await this.props.client.query({
                variables: {
                    path: this.props.uploadPath,
                    permittedNodeTypes: ACCEPTING_NODE_TYPES,
                    permission: 'jcr:addChildNodes'
                },
                query: UploadRequirementsQuery
            });

            if (result.data.jcr.results.hasPermission && result.data.jcr.results.acceptsFiles) {
                this.setState({
                    allowDrop: true
                });
            }
        } catch (e) {
            // Console.log(this.props.uploadPath);
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

UploadTransformComponent.propTypes = {
    uploadTargetComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
    uploadPath: PropTypes.string.isRequired,
    uploadAcceptedFileTypes: PropTypes.array,
    uploadMaxSize: PropTypes.number,
    uploadMinSize: PropTypes.number
};

UploadTransformComponent.defaultProps = {
    uploadAcceptedFileTypes: null,
    uploadMaxSize: Infinity,
    uploadMinSize: 0
};

const mapDispatchToProps = dispatch => {
    return {
        uploadDispatchBatch: actions => dispatch(batchActions(actions)),
        uploadSetOverlayTarget: state => dispatch(setOverlayTarget(state))
    };
};

export default compose(
    withApollo,
    connect(null, mapDispatchToProps))(UploadTransformComponent);
