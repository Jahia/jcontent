import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {batchActions} from "redux-batched-actions/lib/index";
import {fileAccepted, fileMatchSize, getDataTransferItems,
    isDragDataWithFiles, getMimeTypes, onFilesSelected } from './utils';
import {setPanelState} from "./redux/actions";
import {panelStates} from "./constatnts";
import { withApollo } from "react-apollo";
import { UploadRequirementsQuery } from "./gqlQueries";
import _ from "lodash";

class UploadTransformComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.dragTargets = [];
        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);

    }

    render() {
        const { uploadTargetComponent: Component } = this.props;
        return (
            <Component
                onDragOver={ this.onDragOver }
                onDragEnter={ this.onDragEnter }
                onDragLeave={ this.onDragLeave }
                onDrop={ this.onDrop }
                { ...this.generatePropertiesForComponent() }
            />
        );
    }

    generatePropertiesForComponent() {
        const props = { ...this.props };
        delete props.uploadTargetComponent;
        delete props.uploadPath;
        delete props.uploadAcceptedFileTypes;
        delete props.uploadMinSize;
        delete props.uploadMaxSize;
        delete props.uploadDispatchBatch;

        if (this.state.isDragActive) {
            if (!props.style) {
                props.style = {};
            }
            props.style.filter = "blur(3px)";
        }

        return props;
    }

    onDragEnter(evt) {
        const { client, uploadPath } = this.props;

        evt.preventDefault();

        // Count the dropzone and any children that are entered.
        if (this.dragTargets.indexOf(evt.target) === -1) {
            this.dragTargets.push(evt.target);
            this.node = evt.target;
        }

        evt.persist();

        if (isDragDataWithFiles(evt)) {
            Promise.resolve(getDataTransferItems(evt)).then(draggedFiles => {
                if (evt.isPropagationStopped()) {
                    return
                }

                this.setState({
                    draggedFiles,
                    // Do not rely on files for the drag state. It doesn't work in Safari.
                    isDragActive: true
                });

                client.query({
                    variables: {
                        path: uploadPath,
                        permission: "jcr:addChildNodes"
                    },
                    query: UploadRequirementsQuery
                }).then(data => console.log(data)).catch(error => console.log(error));
            });
        }
    }

    onDragOver(evt) {
        // eslint-disable-line class-methods-use-this
        evt.preventDefault();
        evt.persist();

        return false;
    }

    onDragLeave(evt) {
        evt.preventDefault();
        evt.persist();

        this.dragTargets = this.dragTargets.filter(el => el !== evt.target && this.node.contains(el));
        if (this.dragTargets.length > 0) {
            return
        }

        this.setState({
            isDragActive: false,
            draggedFiles: []
        });
    }

    onDrop(evt) {
        const { uploadAcceptedFileTypes, uploadMaxSize, uploadMinSize, uploadPath } = this.props;
        const accept = getMimeTypes(uploadAcceptedFileTypes);

        evt.preventDefault();
        evt.persist();
        this.dragTargets = [];

        // Reset drag state
        this.setState({
            isDragActive: false,
            draggedFiles: []
        });

        if (isDragDataWithFiles(evt)) {
            Promise.resolve(getDataTransferItems(evt)).then(fileList => {
                const acceptedFiles = [];
                const rejectedFiles = [];

                if (evt.isPropagationStopped()) {
                    return
                }

                fileList.forEach(file => {
                    if (
                        fileAccepted(file, accept) &&
                        fileMatchSize(file, uploadMaxSize, uploadMinSize)
                    ) {
                        acceptedFiles.push(file)
                    } else {
                        rejectedFiles.push(file)
                    }
                });
                onFilesSelected(
                    acceptedFiles,
                    rejectedFiles,
                    this.props.uploadDispatchBatch,
                    { path: uploadPath },
                    [setPanelState(panelStates.VISIBLE)]
                );
            })
        }
    }
}

UploadTransformComponent.propTypes = {
    uploadTargetComponent: PropTypes.oneOfType([PropTypes.element.isRequired, PropTypes.func.isRequired]),
    uploadPath: PropTypes.string.isRequired,
    uploadAcceptedFileTypes: PropTypes.array,
    uploadMaxSize: PropTypes.number,
    uploadMinSize: PropTypes.number
};

UploadTransformComponent.defaultProps = {
    uploadMaxSize: Infinity,
    uploadMinSize: 0
};

const mapDispatchToProps = (dispatch) => {
    return {
        uploadDispatchBatch: (actions) => dispatch(batchActions(actions))
    }
};

export default _.flowRight(
    withApollo,
    connect(null, mapDispatchToProps))(UploadTransformComponent);