import React from 'react';
import PropTypes from 'prop-types';
import {compose, Mutation, Query} from 'react-apollo';
import {connect} from 'react-redux';
import ImageEdition from './ImageEdition';
import {ImageQuery} from './ImageEdition.gql-queries';
import {getImageMutation} from './ImageEdition.gql-mutations';
import ConfirmSaveDialog from './ConfirmSaveDialog';
import SaveAsDialog from './SaveAsDialog';

class ImageEditionContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmOpen: false,
            saveAsOpen: false,
            rotations: 0,
            width: null,
            height: null,
            transforms: [],
            openConfirmDialog: false,
            name: null,
            ts: new Date().getTime()
        };

        this.rotate = this.rotate.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.undoChanges = this.undoChanges.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.resize = this.resize.bind(this);
        this.onBackNavigation = this.onBackNavigation.bind(this);
        this.onCloseDialog = this.onCloseDialog.bind(this);
        this.onCompleted = this.onCompleted.bind(this);
    }

    onBackNavigation(dirty) {
        if (dirty) {
            this.setState({
                openConfirmDialog: true
            });
        } else {
            window.history.back();
        }
    }

    onCloseDialog() {
        this.setState({
            openConfirmDialog: false
        });
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
            confirmOpen: false,
            saveAsOpen: false
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
        const {rotations, width, height, transforms, openConfirmDialog, confirmOpen, saveAsOpen, ts, name} = this.state;

        let newName = name;
        if (!newName) {
            newName = path.substring(path.lastIndexOf('/') + 1);
            newName = newName.substring(0, newName.lastIndexOf('.') + 1) + 'copy' + newName.substring(newName.lastIndexOf('.'));
        }

        return (
            <Mutation mutation={getImageMutation(transforms)} refetchQueries={() => ['ImageQuery']} onCompleted={this.onCompleted}>
                {mutation => {
                    return (
                        <Query query={ImageQuery} variables={{path: path}}>
                            {({data, loading}) => {
                                if (!loading && data.jcr) {
                                    return (
                                        <>
                                            <ImageEdition
                                                node={data.jcr.nodeByPath}
                                                ts={ts}
                                                rotations={rotations}
                                                width={width}
                                                height={height}
                                                openConfirmDialog={openConfirmDialog}
                                                rotate={this.rotate}
                                                resize={this.resize}
                                                undoChanges={this.undoChanges}
                                                saveAsChanges={() => this.setState({saveAsOpen: true})}
                                                saveChanges={() => this.setState({confirmOpen: true})}
                                                onBackNavigation={this.onBackNavigation}
                                                onCloseDialog={this.onCloseDialog}
                                            />
                                            <ConfirmSaveDialog
                                                open={confirmOpen}
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
                                        </>
                                    );
                                }
                                return false;
                            }}
                        </Query>
                    );
                }}
            </Mutation>
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
