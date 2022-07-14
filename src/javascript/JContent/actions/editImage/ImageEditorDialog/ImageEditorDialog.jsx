import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {TwoColumnsContent} from '@jahia/design-system-kit';
import ImageEditorPreview from './ImageEditorPreview';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import RotatePanel from './RotatePanel';
import ResizePanel from './ResizePanel';
import CropPanel from './CropPanel';
import {Button, Chip, Edit, Tab, TabItem, Typography} from '@jahia/moonstone';
import ImageEditorActions from './ImageEditorActions';
import styles from './ImageEditorDialog.scss';
import ContentStatuses from '~/JContent/ContentRoute/ContentStatuses';

const PANELS = {
    ROTATE: 0,
    RESIZE: 1,
    CROP: 2
};

export const ImageEditorDialog = ({
    isOpen,
    path,
    ts,
    originalWidth,
    originalHeight,
    resizeParams,
    rotationParams,
    cropParams,
    onResize,
    onRotate,
    onCrop,
    onClose,
    onImageLoaded,
    saveChanges,
    undoChanges
}) => {
    const [currentPanel, setCurrentPanel] = useState(PANELS.ROTATE);
    const {t} = useTranslation('jcontent');
    let dirty = resizeParams.dirty || rotationParams.dirty || cropParams.dirty;
    let name = path.substr(path.lastIndexOf('/') + 1);
    let changesFeedback = dirty ? t('jcontent:label.contentManager.editImage.unsavedChanges') : '';

    return (
        <Dialog fullWidth
                maxWidth="lg"
                open={isOpen}
                aria-labelledby="form-dialog-title"
                classes={{paper: styles.root}}
                onClose={onClose}
        >
            <DialogTitle disableTypography id="form-dialog-title" classes={{root: 'flexRow alignCenter'}}>
                <Typography variant="heading">Edit {name}</Typography>
                <div className={styles.contentStatuses}>
                    {<ContentStatuses nodePath={path}/>}
                    {changesFeedback && <Chip className={styles.chip} icon={<Edit/>} label={changesFeedback} color="warning"/> }
                </div>
            </DialogTitle>
            <DialogContent classes={{root: 'flexRow ' + styles.dialogContent}}>
                <TwoColumnsContent classes={{left: styles.left, right: styles.right, root: styles.twoCols}}
                                   rightCol={<ImageEditorPreview isCropExpanded={currentPanel === PANELS.CROP}
                                                                 path={path}
                                                                 ts={ts}
                                                                 cropParams={cropParams}
                                                                 rotationParams={rotationParams}
                                                                 resizeParams={resizeParams}
                                                                 originalWidth={originalWidth}
                                                                 originalHeight={originalHeight}
                                                                 onCrop={onCrop}
                                                                 onImageLoaded={onImageLoaded}/>}
                >
                    <>
                        <Tab>
                            <TabItem size="big"
                                     data-cm-role="rotate-panel"
                                     isSelected={currentPanel === PANELS.ROTATE}
                                     isDisabled={resizeParams.dirty || cropParams.dirty}
                                     label={t('jcontent:label.contentManager.editImage.rotate')}
                                     onClick={() => !resizeParams.dirty && !cropParams.dirty && setCurrentPanel(PANELS.ROTATE)}
                            />
                            <TabItem size="big"
                                     data-cm-role="resize-panel"
                                     isSelected={currentPanel === PANELS.RESIZE}
                                     isDisabled={rotationParams.dirty || cropParams.dirty}
                                     label={t('jcontent:label.contentManager.editImage.resize')}
                                     onClick={() => !rotationParams.dirty && !cropParams.dirty && setCurrentPanel(PANELS.RESIZE)}
                            />
                            <TabItem size="big"
                                     data-cm-role="crop-panel"
                                     isSelected={currentPanel === PANELS.CROP}
                                     isDisabled={resizeParams.dirty || rotationParams.dirty}
                                     label={t('jcontent:label.contentManager.editImage.crop')}
                                     onClick={() => !resizeParams.dirty && !rotationParams.dirty && setCurrentPanel(PANELS.CROP)}
                            />
                        </Tab>
                        <div className={styles.content}>
                            {currentPanel === PANELS.ROTATE && (
                                <RotatePanel onRotate={onRotate}/>
                        )}
                            {currentPanel === PANELS.RESIZE && (
                                <ResizePanel originalWidth={originalWidth}
                                             originalHeight={originalHeight}
                                             resizeParams={resizeParams}
                                             onResize={onResize}
                            />
                        )}
                            {currentPanel === PANELS.CROP && (
                                <CropPanel cropParams={cropParams}
                                           onCrop={onCrop}
                            />
                        )}
                        </div>
                        <ImageEditorActions isDirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                    </>
                </TwoColumnsContent>
            </DialogContent>
            <DialogActions classes={{root: styles.actions}}>
                <Button
                        data-sel-role="cancel-button"
                        variant="ghost"
                        size="big"
                        label={t('jcontent:label.contentManager.editImage.close')}
                        onClick={onClose}
                    />
            </DialogActions>
        </Dialog>
    );
};

ImageEditorDialog.propTypes = {
    isOpen: PropTypes.bool,
    path: PropTypes.string,
    ts: PropTypes.number.isRequired,
    originalWidth: PropTypes.number,
    originalHeight: PropTypes.number,
    resizeParams: PropTypes.object.isRequired,
    rotationParams: PropTypes.object.isRequired,
    cropParams: PropTypes.object,
    onResize: PropTypes.func.isRequired,
    onRotate: PropTypes.func.isRequired,
    onCrop: PropTypes.func.isRequired,
    onImageLoaded: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    saveChanges: PropTypes.func.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default ImageEditorDialog;
