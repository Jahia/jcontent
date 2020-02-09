import React from 'react';
import PropTypes from 'prop-types';
import {compose, Mutation} from 'react-apollo';
import {connect} from 'react-redux';
import ImageEditor from './ImageEditor';
import {getImageMutation} from './ImageEditor.gql-mutations';
import ConfirmSaveDialog from './ConfirmSaveDialog';
import SaveAsDialog from './SaveAsDialog';
import UnsavedChangesDialog from './UnsavedChangesDialog';
import {DxContext} from '@jahia/react-material';
import {cmGoto} from '../JContent.redux';
import {refetchContentListData} from '../JContent.refetches';
import Feedback from './Feedback';

export class ImageEditorContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmSaveOpen: false,
            saveAsOpen: false,
            confirmCloseOpen: false,
            transforms: [],
            name: null,
            ts: new Date().getTime(),
            originalWidth: 1,
            originalHeight: 1,
            rotationParams: {
                dirty: false,
                rotations: 0
            },
            resizeParams: {
                dirty: false,
                keepRatio: true,
                width: null,
                height: null
            },
            cropParams: {
                dirty: false,
                top: 0,
                left: 0
            },
            snackBarMessage: null,
            isNameValid: true
        };

        this.handleClose = this.handleClose.bind(this);
        this.undoChanges = this.undoChanges.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);

        this.rotate = this.rotate.bind(this);
        this.resize = this.resize.bind(this);
        this.crop = this.crop.bind(this);

        this.onBackNavigation = this.onBackNavigation.bind(this);
        this.onCompleted = this.onCompleted.bind(this);
        this.onImageLoaded = this.onImageLoaded.bind(this);
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

    onImageLoaded(image) {
        this.setState(prevState => ({
            originalWidth: image.naturalWidth,
            originalHeight: image.naturalHeight,
            cropParams: {
                aspect: image.naturalWidth / image.naturalHeight,
                ...prevState.cropParams
            }
        }));
    }

    rotate(val) {
        this.setState(previousState => {
            // Keep rotations with values between -1 and 2 (-90, 0, 90, 180)
            let rotations = ((previousState.rotationParams.rotations + val + 5) % 4) - 1;
            return {
                rotationParams: {
                    dirty: rotations !== 0,
                    rotations: rotations
                },
                transforms: (rotations === 0 ? [] : [{
                    op: 'rotateImage',
                    args: {
                        angle: rotations * 90
                    }
                }])
            };
        });
    }

    resize({width, height, keepRatio}) {
        this.setState(({resizeParams, originalHeight, originalWidth}) => {
            let snackBarMessage = null;
            if (keepRatio === false) {
                snackBarMessage = 'label.contentManager.editImage.ratioUnlocked';
            } else if (keepRatio === true) {
                snackBarMessage = 'label.contentManager.editImage.ratioLocked';
            } else {
                keepRatio = resizeParams.keepRatio;
            }

            if (keepRatio && width) {
                height = Math.round(keepRatio && originalHeight && originalWidth ? width * originalHeight / originalWidth : (resizeParams.height || originalHeight));
            } else if (keepRatio && height) {
                width = Math.round(keepRatio && originalHeight && originalWidth ? height * originalWidth / originalHeight : (resizeParams.width || originalWidth));
            } else if (keepRatio) {
                height = Math.round(resizeParams.width * originalHeight / originalWidth);
            }

            width = width || resizeParams.width;
            height = height || resizeParams.height;

            return ({
                resizeParams: {
                    dirty: (width && originalWidth !== width) || (height && originalHeight !== height),
                    width,
                    height,
                    keepRatio: keepRatio
                },
                transforms: ([{
                    op: 'resizeImage',
                    args: {
                        height: height,
                        width: width
                    }
                }]),
                snackBarMessage: snackBarMessage
            });
        });
    }

    crop({width, height, top, left, aspect}) {
        this.setState(({cropParams, originalHeight, originalWidth}) => {
            let snackBarMessage = null;
            if (aspect === true) {
                aspect = (cropParams.width || originalWidth) / (cropParams.height || originalHeight);
                snackBarMessage = 'label.contentManager.editImage.ratioLocked';
            } else if (aspect === false) {
                aspect = null;
                snackBarMessage = 'label.contentManager.editImage.ratioUnlocked';
            } else {
                aspect = cropParams.aspect;
            }

            if (aspect && width) {
                height = width / aspect;
            } else if (aspect && height) {
                width = height * aspect;
            }

            width = width || cropParams.width;
            height = height || cropParams.height;
            top = top || cropParams.top;
            left = left || cropParams.left;
            if (width > originalWidth) {
                width = originalWidth;
            }

            if (height > originalHeight) {
                height = originalHeight;
            }

            if (width && left + width > originalWidth) {
                left = originalWidth - width;
            }

            if (height && top + height > originalHeight) {
                top = originalHeight - height;
            }

            return {
                cropParams: {
                    dirty: Boolean(height || width || top || left),
                    width,
                    height,
                    top,
                    left,
                    aspect
                },
                transforms: ([{
                    op: 'cropImage',
                    args: {
                        height: height && Math.round(height),
                        width: width && Math.round(width),
                        top: top && Math.round(top),
                        left: left && Math.round(left)
                    }
                }]),
                snackBarMessage: snackBarMessage
            };
        });
    }

    undoChanges() {
        this.setState(previousState => ({
            transforms: [],
            rotationParams: {
                dirty: false,
                rotations: 0
            },
            resizeParams: {
                dirty: false,
                width: null,
                height: null,
                keepRatio: true
            },
            cropParams: {
                dirty: false,
                top: 0,
                left: 0,
                height: null,
                width: null,
                aspect: previousState.originalWidth / previousState.originalHeight
            }
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
        if (value) {
            const isNameValid = value.match(/[\\/:*?"<>|]/g) === null;
            this.setState({
                isNameValid: isNameValid,
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
                snackBarMessage: 'label.contentManager.editImage.savedMessage'
            }));
        } else {
            editImage(site, language, newPath);
        }

        this.handleClose();
        refreshData();
    }

    render() {
        const {path} = this.props;
        const {
            transforms, confirmCloseOpen, confirmSaveOpen, saveAsOpen, ts, name, snackBarMessage,
            rotationParams, resizeParams, cropParams, originalWidth, originalHeight, isNameValid
        } = this.state;
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
                        {mutation => (
                            <>
                                <ImageEditor
                                    dxContext={dxContext}
                                    ts={ts}
                                    path={path}
                                    originalWidth={originalWidth}
                                    originalHeight={originalHeight}
                                    rotationParams={rotationParams}
                                    resizeParams={resizeParams}
                                    cropParams={cropParams}
                                    undoChanges={this.undoChanges}
                                    saveChanges={withName => this.setState({
                                        confirmSaveOpen: !withName,
                                        saveAsOpen: withName
                                    })}
                                    onImageLoaded={this.onImageLoaded}
                                    onRotate={this.rotate}
                                    onResize={this.resize}
                                    onCrop={this.crop}
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
                                    isNameValid={isNameValid}
                                    handleSave={() => {
                                        mutation({variables: {path, name: newName.trim()}});
                                        this.setState({
                                            snackBarMessage: {key: 'label.contentManager.editImage.editingMessage', params: {imageName: newName}}
                                        });
                                    }}
                                    handleClose={this.handleClose}
                                    onChangeName={this.handleChangeName}
                                />
                                <UnsavedChangesDialog
                                    open={confirmCloseOpen}
                                    onBack={() => {
                                        this.undoChanges();
                                        this.handleClose();
                                        window.history.back();
                                    }}
                                    onClose={this.handleClose}
                                />

                                <Feedback open={Boolean(snackBarMessage)}
                                          messageKey={snackBarMessage}
                                          anchorOrigin={{
                                              vertical: 'bottom',
                                              horizontal: 'center'
                                          }}
                                          onClose={() => this.setState({snackBarMessage: null})}
                                />
                            </>
                        )}
                    </Mutation>
                )}
            </DxContext.Consumer>
        );
    }
}

const mapStateToProps = state => ({
    path: state.jcontent.path,
    site: state.site,
    language: state.language
});

const mapDispatchToProps = dispatch => ({
    editImage: (site, language, path) => dispatch(cmGoto({site, language, mode: 'image-edit', path})),
    refreshData: () => dispatch(refetchContentListData)
});

ImageEditorContainer.propTypes = {
    path: PropTypes.string.isRequired,
    site: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    editImage: PropTypes.func.isRequired,
    refreshData: PropTypes.func.isRequired
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps)
)(ImageEditorContainer);
