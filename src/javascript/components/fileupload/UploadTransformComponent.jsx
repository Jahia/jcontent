import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {batchActions} from "redux-batched-actions/lib/index";
import {fileAccepted, fileMatchSize, getDataTransferItems, isDragDataWithFiles, getMimeTypes, onFilesSelected } from './utils';
import {setPanelState} from "./redux/actions";
import {panelStates} from "./constatnts";


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
        const { component: Component } = this.props;
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
        delete props.component;
        delete props.uploadPath;

        if (this.state.isDragActive) {
            if (!props.style) {
                props.style = {};
            }
            props.style.filter = "blur(3px)";
        }

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

        if (isDragDataWithFiles(evt)) {
            Promise.resolve(getDataTransferItems(evt)).then(draggedFiles => {
                if (evt.isPropagationStopped()) {
                    return
                }

                this.setState({
                    draggedFiles,
                    // Do not rely on files for the drag state. It doesn't work in Safari.
                    isDragActive: true
                })
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
        const { acceptedFileTypes, maxSize, minSize, uploadPath } = this.props;
        const accept = getMimeTypes(acceptedFileTypes);

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
                        fileMatchSize(file, maxSize, minSize)
                    ) {
                        acceptedFiles.push(file)
                    } else {
                        rejectedFiles.push(file)
                    }
                });
                onFilesSelected(
                    acceptedFiles,
                    rejectedFiles,
                    this.props.dispatchBatch,
                    { path: uploadPath },
                    [setPanelState(panelStates.VISIBLE)]
                );
            })
        }
    }
}

UploadTransformComponent.propTypes = {
    component: PropTypes.element.isRequired,
    acceptedFileTypes: PropTypes.array,
    uploadPath: PropTypes.string.isRequired,
    maxSize: PropTypes.number,
    minSize: PropTypes.number
};

UploadTransformComponent.defaultProps = {
    maxSize: Infinity,
    minSize: 0
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch,
        dispatchBatch: (actions) => dispatch(batchActions(actions))
    }
};

export default connect(null, mapDispatchToProps)(UploadTransformComponent);