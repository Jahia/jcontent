import React from 'react';
import PropTypes from 'prop-types';
import {compose, Mutation, Query} from 'react-apollo';
import {connect} from 'react-redux';
import ImageEdition from './ImageEdition';
import {ImageQuery} from './ImageEdition.gql-queries';
import {getImageMutation} from './ImageEdition.gql-mutations';
import ConfirmSaveDialog from './ConfirmSaveDialog';
import SaveAsDialog from './SaveAsDialog';
import UnsavedChangesDialog from './UnsavedChangesDialog';
import DxContext from '../DxContext';

class ImageEditionContainer extends React.Component {
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
            ts: new Date().getTime()
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
                transforms: ([{
                    op: 'rotateImage',
                    args: {
                        angle: rotations * 90
                    }
                }])
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
        if (result.jcr.mutateNode.transformImage.node.path === this.props.path) {
            this.undoChanges();
            this.setState(() => ({
                ts: new Date().getTime()
            }));
        }
        this.handleClose();
    }

    render() {
        const {path} = this.props;
        const {rotations, width, height, transforms, confirmCloseOpen, confirmSaveOpen, saveAsOpen, ts, name} = this.state;

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
                                    {({data, loading}) => {
                                        if (!loading && data.jcr) {
                                            return (
                                                <>
                                                    <ImageEdition
                                                        node={data.jcr.nodeByPath}
                                                        dxContext={dxContext}
                                                        ts={ts}
                                                        rotations={rotations}
                                                        width={width}
                                                        height={height}
                                                        rotate={this.rotate}
                                                        resize={this.resize}
                                                        undoChanges={this.undoChanges}
                                                        saveChanges={withName => this.setState({
                                                            confirmSaveOpen: !withName,
                                                            saveAsOpen: withName
                                                        })}
                                                        onBackNavigation={this.onBackNavigation}
                                                        onCloseDialog={this.onCloseDialog}
                                                    />
                                                    <ConfirmSaveDialog
                                                        open={confirmSaveOpen}
                                                        handleSave={() => mutation({variables: {path}})}
                                                        handleClose={this.handleClose}
                                                    />
                                                    <SaveAsDialog
                                                        open={saveAsOpen}
                                                        name={newName}
                                                        handleSave={() => mutation({variables: {path, name: newName.trim()}})}
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

ImageEditionContainer.propTypes = {
    path: PropTypes.string.isRequired
};

let mapStateToProps = state => ({
    path: state.path
});

export default compose(
    connect(mapStateToProps, null),
)(ImageEditionContainer);
