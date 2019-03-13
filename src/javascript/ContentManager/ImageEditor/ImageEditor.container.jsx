import React from 'react';
import PropTypes from 'prop-types';
import {compose, Mutation, Query} from 'react-apollo';
import {connect} from 'react-redux';
import ImageEditor from './ImageEditor';
import {ImageQuery} from './ImageEditor.gql-queries';
import {getImageMutation} from './ImageEditor.gql-mutations';
import ConfirmSaveDialog from './ConfirmSaveDialog';
import SaveAsDialog from './SaveAsDialog';
import UnsavedChangesDialog from './UnsavedChangesDialog';
import DxContext from '../DxContext';
import {cmGoto} from '../ContentManager.redux-actions';
import {refetchContentListData} from '../ContentManager.refetches';

export class ImageEditorContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmSaveOpen: false,
            saveAsOpen: false,
            confirmCloseOpen: false,
            rotations: 0,
            width: null,
            height: null,
            transforms: [],
            name: null,
            ts: new Date().getTime(),
            confirmSaved: false,
            editing: true
        };

        this.rotate = this.rotate.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.undoChanges = this.undoChanges.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.resize = this.resize.bind(this);
        this.onBackNavigation = this.onBackNavigation.bind(this);
        this.onCompleted = this.onCompleted.bind(this);
    }

    onBackNavigation(dirty) {
        if (dirty) {
            this.setState({
                confirmCloseOpen: true
            });
        } else {
            window.history.back();
        }
    }

    rotate(val) {
        this.setState(state => {
            // Keep rotations with values between -1 and 2 (-90, 0, 90, 180)
            let rotations = ((state.rotations + val + 5) % 4) - 1;
            return {
                rotations: rotations,
                transforms: (rotations !== 0 ? [{
                    op: 'rotateImage',
                    args: {
                        angle: rotations * 90
                    }
                }] : [])
            };
        });
    }

    resize({width, height}) {
        this.setState(() => ({
            width,
            height,
            transforms: ([{
                op: 'resizeImage',
                args: {
                    height: height,
                    width: width
                }
            }])
        }));
    }

    undoChanges() {
        this.setState(() => ({
            rotations: 0,
            width: null,
            height: null,
            transforms: []
        }));
    }

    handleClose() {
        this.setState({
            confirmSaveOpen: false,
            saveAsOpen: false,
            confirmCloseOpen: false
        });
    }

    handleChangeName({target: {value}}) {
        if (/^[^/\\*:]+$/.test(value)) {
            this.setState({
                name: value
            });
        }
    }

    onCompleted(result) {
        let {path, site, language, editImage, refreshData} = this.props;
        let newPath = result.jcr.mutateNode.transformImage.node.path;
        this.undoChanges();
        if (newPath === path) {
            this.setState(() => ({
                ts: new Date().getTime(),
                confirmSaved: true
            }));
        } else {
            editImage(site, language, newPath);
        }
        this.handleClose();
        refreshData();
    }

    render() {
        const {path} = this.props;
        const {rotations, width, height, transforms, confirmCloseOpen, confirmSaveOpen, saveAsOpen, ts, name, confirmSaved, editing} = this.state;

        let newName = name;
        if (!newName) {
            newName = path.substring(path.lastIndexOf('/') + 1);
            newName = newName.substring(0, newName.lastIndexOf('.') + 1) + 'copy' + newName.substring(newName.lastIndexOf('.'));
        }

        return (
            <DxContext.Consumer>
                {dxContext => (
                    <Mutation mutation={getImageMutation(transforms)}
                              refetchQueries={() => ['ImageQuery']}
                              onCompleted={this.onCompleted}
                    >
                        {mutation => {
                            return (
                                <Query query={ImageQuery} variables={{path: path}}>
                                    {({data, loading, error}) => {
                                        if (!loading && !error && data.jcr) {
                                            return (
                                                <>
                                                    <ImageEditor
                                                        node={data.jcr.nodeByPath}
                                                        dxContext={dxContext}
                                                        ts={ts}
                                                        rotations={rotations}
                                                        width={width}
                                                        height={height}
                                                        confirmSaved={confirmSaved}
                                                        editing={editing}
                                                        rotate={this.rotate}
                                                        resize={this.resize}
                                                        undoChanges={this.undoChanges}
                                                        closeFeedback={() => this.setState({
                                                            confirmSaved: false
                                                        })}
                                                        saveChanges={withName => this.setState({
                                                            confirmSaveOpen: !withName,
                                                            saveAsOpen: withName
                                                        })}
                                                        closeEditingToast={() => this.setState({
                                                            editing: false
                                                        })}
                                                        onBackNavigation={this.onBackNavigation}
                                                    />
                                                    <ConfirmSaveDialog
                                                        open={confirmSaveOpen}
                                                        handleSave={() => mutation({variables: {path}})}
                                                        handleClose={this.handleClose}
                                                    />
                                                    <SaveAsDialog
                                                        open={saveAsOpen}
                                                        name={newName}
                                                        handleSave={() => {
                                                            mutation({variables: {path, name: newName.trim()}});
                                                            this.setState({
                                                                editing: true
                                                            });
                                                        }}
                                                        handleClose={this.handleClose}
                                                        onChangeName={this.handleChangeName}
                                                    />
                                                    <UnsavedChangesDialog
                                                        open={confirmCloseOpen}
                                                        onClose={this.handleClose}
                                                    />

                                                </>
                                            );
                                        }
                                        return false;
                                    }}
                                </Query>
                            );
                        }}
                    </Mutation>
                )}
            </DxContext.Consumer>
        );
    }
}

ImageEditorContainer.propTypes = {
    path: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
    path: state.path,
    site: state.site,
    language: state.language
});

const mapDispatchToProps = dispatch => ({
    editImage: (site, language, path) => dispatch(cmGoto({site, language, mode: 'image-edit', path})),
    refreshData: () => dispatch(refetchContentListData)
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
)(ImageEditorContainer);
