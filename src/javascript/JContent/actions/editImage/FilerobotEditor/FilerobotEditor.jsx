import React, {Suspense, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Button, Loader, Modal, ModalBody, ModalFooter, ModalHeader, Typography} from '@jahia/moonstone';
import JContentConstants from '~/JContent/JContent.constants';
import {useSaveEditedImage} from './useSaveEditedImage';
import {filerobotTheme} from './filerobotTheme';
import SaveAsDialog from './SaveAsDialog';
import styles from './FilerobotEditor.scss';

// Lazy chunk: the Filerobot editor (plus konva/styled-components) is only fetched
// on the first "Image editor" click, keeping the jcontent remote entry small.
const FilerobotImageEditor = React.lazy(() => import('react-filerobot-image-editor'));

// Values of the TABS constant of react-filerobot-image-editor, inlined so the
// eager chunk does not need to import the library.
const TABS_IDS = ['Adjust', 'Annotate', 'Watermark', 'Filters', 'Finetune', 'Resize'];

// Locales react-filerobot-image-editor ships translations for; anything else
// falls back to English rather than an untranslated UI.
const FILEROBOT_LANGUAGES = ['en', 'fr', 'de', 'it', 'pt', 'es', 'nl', 'pl', 'ro'];

// Rendering scale for the exported canvas. Filerobot re-renders the design at the
// image's full resolution and multiplies it by this ratio (Konva.pixelRatio), so
// anything above 1 would inflate the saved dimensions — e.g. a resize to 400px
// would store a 1600px image with the Filerobot default of 4. Keep it at 1 so the
// stored image matches the edited dimensions exactly.
const SAVING_PIXEL_RATIO = 1;

const isNameValid = name => {
    const maxNameSize = window.contextJsParameters?.config?.maxNameSize || 128;
    return name.trim().length > 0 &&
        name.trim().length <= maxNameSize &&
        !name.match(JContentConstants.namingInvalidCharactersRegexp);
};

export const FilerobotEditor = ({path, mimeType, onExit}) => {
    const {t} = useTranslation('jcontent');
    // Content language for the new node's jcr:title on Save as; fall back to the UI
    // language then English so the (non-null) $lang mutation variable is always set.
    const language = useSelector(state => state.language) || window.contextJsParameters?.uilang || 'en';
    const {format, save, saveAs} = useSaveEditedImage(path, mimeType, language);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isDirty, setDirty] = useState(false);
    const [isSaveAsOpen, setSaveAsOpen] = useState(false);
    const [saveAsName, setSaveAsName] = useState('');

    // Filerobot populates .current with its getCurrentImgData function once mounted.
    // Combined with removeSaveButton, this lets us drive saving from our own buttons —
    // the editor's own save dialog is never shown and the export format always matches
    // the file's original format.
    const getImgDataRef = useRef(null);

    // The JCR path prop is not URI-encoded, so the node name is used verbatim
    // (decoding it would throw on legal names containing '%').
    const nodeName = path.substring(path.lastIndexOf('/') + 1);
    // Same-origin (cookie auth) and cache-busted so the latest binary is always loaded.
    const source = useMemo(
        () => window.contextJsParameters.contextPath +
            '/files/default' +
            path.replace(/[^/]/g, encodeURIComponent) +
            '?ts=' + Date.now(),
        [path]
    );

    const getEditedCanvas = () => {
        const getData = getImgDataRef.current;
        if (typeof getData !== 'function') {
            return null;
        }

        try {
            const result = getData({name: nodeName, extension: format.extension}, SAVING_PIXEL_RATIO);
            return result?.imageData?.imageCanvas || null;
        } catch (e) {
            console.error('[jcontent] could not read edited image', e);
            return null;
        }
    };

    const runSave = saveFn => {
        const canvas = getEditedCanvas();
        if (!canvas) {
            setError(t('jcontent:label.contentManager.editImage.saveError'));
            return;
        }

        setSaving(true);
        setError(null);
        saveFn(canvas)
            .then(() => onExit())
            .catch(e => {
                console.error('[jcontent] could not save edited image', e);
                setError(e.message);
                setSaving(false);
            });
    };

    const openSaveAs = () => {
        // Suggest "<base>-copy.<ext>" — extension follows the export format.
        const dotIndex = nodeName.lastIndexOf('.');
        const base = dotIndex > 0 ? nodeName.substring(0, dotIndex) : nodeName;
        setSaveAsName(`${base}-copy.${format.extension}`);
        setSaveAsOpen(true);
    };

    const uilang = window.contextJsParameters.uilang;

    return (
        <Modal
            isOpen
            size="large"
            className={styles.editorModal}
            onOpenChange={open => {
                if (!open) {
                    onExit();
                }
            }}
        >
            <>
                <ModalHeader title={`${t('jcontent:label.contentManager.editImage.title')} — ${nodeName}`}/>
                <ModalBody className={styles.editorBody}>
                    <div className={styles.editorCanvas} data-cm-role="image-editor-dialog">
                        <Suspense fallback={<div className={styles.loader}><Loader size="big"/></div>}>
                            <FilerobotImageEditor
                                removeSaveButton
                                source={source}
                                theme={filerobotTheme}
                                getCurrentImgDataFnRef={getImgDataRef}
                                previewPixelRatio={window.devicePixelRatio || 1}
                                savingPixelRatio={SAVING_PIXEL_RATIO}
                                tabsIds={TABS_IDS}
                                defaultTabId="Resize"
                                language={FILEROBOT_LANGUAGES.includes(uilang) ? uilang : 'en'}
                                onModify={() => setDirty(true)}
                                onClose={closingReason => {
                                    if (closingReason !== 'after-saving') {
                                        onExit();
                                    }
                                }}
                            />
                        </Suspense>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <div className={styles.footer}>
                        {error && (
                            <Typography variant="caption" className={styles.footerError}>
                                {t('jcontent:label.contentManager.editImage.saveError')}: {error}
                            </Typography>
                        )}
                        <Button
                            size="big"
                            variant="ghost"
                            label={t('jcontent:label.contentManager.editImage.cancel')}
                            isDisabled={saving}
                            data-cm-role="image-editor-cancel"
                            className={error ? undefined : styles.footerSpacer}
                            onClick={() => onExit()}
                        />
                        <Button
                            size="big"
                            variant="ghost"
                            label={t('jcontent:label.contentManager.editImage.saveAs')}
                            isDisabled={saving}
                            data-cm-role="image-save-as-button"
                            onClick={openSaveAs}
                        />
                        <Button
                            size="big"
                            color="accent"
                            label={t('jcontent:label.contentManager.editImage.save')}
                            isDisabled={saving || !isDirty}
                            isLoading={saving}
                            data-cm-role="image-save-button"
                            onClick={() => runSave(save)}
                        />
                    </div>
                </ModalFooter>
                <SaveAsDialog
                    isOpen={isSaveAsOpen}
                    name={saveAsName}
                    isNameValid={isNameValid(saveAsName)}
                    handleClose={() => setSaveAsOpen(false)}
                    handleSave={() => {
                        setSaveAsOpen(false);
                        runSave(canvas => saveAs(canvas, saveAsName.trim()));
                    }}
                    onChangeName={e => setSaveAsName(e.target.value)}
                />
            </>
        </Modal>
    );
};

FilerobotEditor.propTypes = {
    path: PropTypes.string.isRequired,
    mimeType: PropTypes.string,
    onExit: PropTypes.func.isRequired
};

export default FilerobotEditor;
