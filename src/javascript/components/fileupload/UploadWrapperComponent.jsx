import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {batchActions} from "redux-batched-actions/lib/index";
import { fileAccepted, fileMatchSize, getDataTransferItems, isDragDataWithFiles, getMimeTypes } from './utils';


class UploadWrapperComponent extends React.Component {

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

        if (this.state.isDragActive) {
            if (!props.style) {
                props.style = {};
            }
            props.style.filter = "blur(5px)";
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

        // try {
        //     // The file dialog on Chrome allows users to drag files from the dialog onto
        //     // the dropzone, causing the browser the crash when the file dialog is closed.
        //     // A drop effect of 'none' prevents the file from being dropped
        //     evt.dataTransfer.dropEffect = this.isFileDialogActive ? 'none' : 'copy' // eslint-disable-line no-param-reassign
        // } catch (err) {
        //     // continue regardless of error
        // }

        return false;
    }

    onDragLeave(evt) {
        evt.preventDefault();
        evt.persist();

        // Only deactivate once the dropzone and all children have been left.
        this.dragTargets = this.dragTargets.filter(el => el !== evt.target && this.node.contains(el));
        if (this.dragTargets.length > 0) {
            return
        }

        // Clear dragging files state
        this.setState({
            isDragActive: false,
            draggedFiles: []
        });
    }

    onDrop(evt) {
        const {
            multiple,
            acceptedFileTypes
        } = this.props;

        const accept = getMimeTypes(acceptedFileTypes);

        // Stop default browser behavior
        evt.preventDefault();

        // Persist event for later usage
        evt.persist();

        // Reset the counter along with the drag on a drop.
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
                        fileMatchSize(file, this.props.maxSize, this.props.minSize)
                    ) {
                        acceptedFiles.push(file)
                    } else {
                        rejectedFiles.push(file)
                    }
                });

                if (!multiple && acceptedFiles.length > 1) {
                    // if not in multi mode add any extra accepted files to rejected.
                    // This will allow end users to easily ignore a multi file drop in "single" mode.
                    rejectedFiles.push(...acceptedFiles.splice(0))
                }

                // Update `acceptedFiles` and `rejectedFiles` state
                // This will make children render functions receive the appropriate
                // values
                // this.setState({ acceptedFiles, rejectedFiles }, () => {
                //     if (onDrop) {
                //         onDrop.call(this, acceptedFiles, rejectedFiles, evt)
                //     }
                //
                //     if (rejectedFiles.length > 0 && onDropRejected) {
                //         onDropRejected.call(this, rejectedFiles, evt)
                //     }
                //
                //     if (acceptedFiles.length > 0 && onDropAccepted) {
                //         onDropAccepted.call(this, acceptedFiles, evt)
                //     }
                // })

                console.log(acceptedFiles, rejectedFiles);
            })
        }
    }
}

UploadWrapperComponent.propTypes = {
    component: PropTypes.element.isRequired,
    acceptedFileTypes: PropTypes.array,
    multiple: true
};

const mapStateToProps = (state, ownProps) => {
    if (ownProps.statePartName) {
        return state[ownProps.statePartName];
    }
    return state.fileUpload
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch,
        dispatchBatch: (actions) => dispatch(batchActions(actions))
    }
};

export default connect()(UploadWrapperComponent);