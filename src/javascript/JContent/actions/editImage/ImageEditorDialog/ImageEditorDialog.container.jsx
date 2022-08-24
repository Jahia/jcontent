import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Mutation, useApolloClient} from 'react-apollo';
import ImageEditorDialog from './ImageEditorDialog';
import {getImageMutation} from './ImageEditorDialog.gql-mutations';
import ConfirmSaveDialog from './ConfirmSaveDialog';
import SaveAsDialog from './SaveAsDialog';
import UnsavedChangesDialog from './UnsavedChangesDialog';
import {refetchTypes, triggerRefetch} from '../../../JContent.refetches';
import Feedback from './Feedback';

const getBox = ({width, cropParams, height, top, left, originalWidth, originalHeight}) => {
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

    return {width, height, top, left};
};

export const ImageEditorDialogContainer = ({path, onExit}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
    const [imageSize, setImageSize] = useState({
        originalWidth: 1,
        originalHeight: 1
    });
    const [operations, setOperations] = useState({
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
            left: 0,
            aspect: 1
        },
        transforms: []
    });
    const [saveAsOpen, setSaveAsOpen] = useState(false);
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState(path);
    const [name, setName] = useState(null);
    const [ts, setTs] = useState(new Date().getTime());
    const [snackBarMessage, setSnackBarMessage] = useState(null);
    const [isNameValid, setIsNameValid] = useState(true);

    const client = useApolloClient();

    const onClose = () => {
        let dirty = operations.resizeParams.dirty || operations.rotationParams.dirty || operations.cropParams.dirty;
        if (dirty) {
            setConfirmCloseOpen(true);
        } else {
            setIsOpen(false);
            onExit();
        }
    };

    const onImageLoaded = image => {
        setImageSize({
            originalWidth: image.naturalWidth,
            originalHeight: image.naturalHeight
        });
        setOperations(previousState => ({
            ...previousState,
            resizeParams: {
                dirty: false,
                keepRatio: true,
                width: image.naturalWidth,
                height: image.naturalHeight
            },
            cropParams: {
                ...previousState.cropParams,
                aspect: image.naturalWidth / image.naturalHeight
            }
        }));
    };

    const rotate = val => {
        setOperations(previousState => {
            // Keep rotations with values between -1 and 2 (-90, 0, 90, 180)
            let rotations = ((previousState.rotationParams.rotations + val + 5) % 4) - 1;
            return {
                ...previousState,
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
    };

    const resize = ({width, height, keepRatio}) => {
        if (keepRatio === false) {
            setSnackBarMessage('jcontent:label.contentManager.editImage.ratioUnlocked');
        } else if (keepRatio === true) {
            setSnackBarMessage('jcontent:label.contentManager.editImage.ratioLocked');
        }

        setOperations(previousState => {
            if (typeof keepRatio === 'undefined') {
                keepRatio = previousState.resizeParams.keepRatio;
            }

            const {originalHeight, originalWidth} = imageSize;
            if (keepRatio && typeof width !== 'undefined') {
                height = Math.round(keepRatio && originalHeight && originalWidth ? width * originalHeight / originalWidth : previousState.resizeParams.height);
            } else if (keepRatio && typeof height !== 'undefined') {
                width = Math.round(keepRatio && originalHeight && originalWidth ? height * originalWidth / originalHeight : previousState.resizeParams.width);
            } else if (keepRatio) {
                height = Math.round(previousState.resizeParams.width * originalHeight / originalWidth);
            }

            width = typeof width === 'undefined' ? previousState.resizeParams.width : width;
            height = typeof height === 'undefined' ? previousState.resizeParams.height : height;

            return ({
                ...previousState,
                resizeParams: {
                    dirty: width && height && (imageSize.originalWidth !== width || imageSize.originalHeight !== height),
                    width: width || '',
                    height: height || '',
                    keepRatio: keepRatio
                },
                transforms: ([{
                    op: 'resizeImage',
                    args: {
                        height: height,
                        width: width
                    }
                }])
            });
        });
    };

    const crop = ({width, height, top, left, aspect}) => {
        if (aspect === true) {
            setSnackBarMessage('jcontent:label.contentManager.editImage.ratioLocked');
        } else if (aspect === false) {
            setSnackBarMessage('jcontent:label.contentManager.editImage.ratioUnlocked');
        }

        setOperations(previousState => {
            if (aspect === true) {
                aspect = (previousState.cropParams.width || imageSize.originalWidth) / (previousState.cropParams.height || imageSize.originalHeight);
            } else if (aspect === false) {
                aspect = null;
            } else {
                aspect = previousState.cropParams.aspect;
            }

            if (aspect && width) {
                height = width / aspect;
            } else if (aspect && height) {
                width = height * aspect;
            }

            const box = getBox({width, cropParams: previousState.cropParams, height, top, left, originalWidth: imageSize.originalWidth, originalHeight: imageSize.originalHeight});
            width = box.width;
            height = box.height;
            top = box.top;
            left = box.left;

            return {
                ...previousState,
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
                }])
            };
        });
    };

    const undoChanges = () => {
        setOperations({
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
                aspect: imageSize.originalWidth / imageSize.originalHeight
            }
        });
    };

    const handleChangeName = ({target: {value}}) => {
        if (value) {
            const isNameValid = value.match(/[\\/:*?"<>|]/g) === null;
            setIsNameValid(isNameValid);
            setName(value);
        }
    };

    const onCompleted = result => {
        let newPath = result.jcr.mutateNode.transformImage.node.path;
        undoChanges();
        if (newPath === path) {
            setTs(new Date().getTime());
        }

        setSnackBarMessage('jcontent:label.contentManager.editImage.savedMessage');

        setConfirmSaveOpen(false);
        setSaveAsOpen(false);
        setCurrentPath(newPath);

        triggerRefetch(refetchTypes.CONTENT_DATA);
        client.cache.flushNodeEntryByPath(path);
    };

    const onError = e => {
        setSnackBarMessage(e.message);
    };

    let newName = name;
    if (!newName) {
        newName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
        newName = newName.substring(0, newName.lastIndexOf('.') + 1) + 'copy' + newName.substring(newName.lastIndexOf('.'));
    }

    return (
        <Mutation mutation={getImageMutation(operations.transforms)}
                  refetchQueries={() => ['ImageQuery']}
                  onCompleted={onCompleted}
                  onError={onError}
        >
            {mutation => (
                <>
                    <ImageEditorDialog
                        isOpen={isOpen}
                        ts={ts}
                        path={currentPath}
                        originalWidth={imageSize.originalWidth}
                        originalHeight={imageSize.originalHeight}
                        rotationParams={operations.rotationParams}
                        resizeParams={operations.resizeParams}
                        cropParams={operations.cropParams}
                        undoChanges={undoChanges}
                        saveChanges={withName => {
                            setConfirmSaveOpen(!withName);
                            setSaveAsOpen(withName);
                        }}
                        onImageLoaded={onImageLoaded}
                        onRotate={rotate}
                        onResize={resize}
                        onCrop={crop}
                        onClose={onClose}
                    />
                    <ConfirmSaveDialog
                        isOpen={confirmSaveOpen}
                        handleSave={() => mutation({variables: {path: currentPath}})}
                        handleClose={() => setConfirmSaveOpen(false)}
                    />
                    <SaveAsDialog
                        isOpen={saveAsOpen}
                        name={newName}
                        isNameValid={isNameValid}
                        handleSave={() => {
                            mutation({variables: {path: currentPath, name: newName.trim()}});
                            setSnackBarMessage({
                                key: 'jcontent:label.contentManager.editImage.editingMessage',
                                params: {imageName: newName}
                            });
                        }}
                        handleClose={() => setSaveAsOpen(false)}
                        onChangeName={handleChangeName}
                    />
                    <UnsavedChangesDialog
                        isOpen={confirmCloseOpen}
                        onBack={() => {
                            setConfirmCloseOpen(false);
                            setIsOpen(false);
                            onExit();
                        }}
                        onClose={() => setConfirmCloseOpen(false)}
                    />

                    <Feedback isOpen={Boolean(snackBarMessage)}
                              messageKey={snackBarMessage}
                              autoHideDuration={10000}
                              anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'center'
                              }}
                              onClose={() => setSnackBarMessage(null)}
                    />
                </>
            )}
        </Mutation>
    );
};

ImageEditorDialogContainer.propTypes = {
    path: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

export default ImageEditorDialogContainer;
