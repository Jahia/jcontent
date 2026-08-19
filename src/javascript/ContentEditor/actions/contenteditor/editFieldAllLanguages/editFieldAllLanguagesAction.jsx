import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import {useFormikContext} from 'formik';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {filterFieldSets} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Sections';
import {EditFieldAllLanguagesModal} from './EditFieldAllLanguagesModal';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {CloseConfirmationDialog} from '~/ContentEditor/CloseConfirmationDialog';
import {isDirty} from '~/ContentEditor/utils';

const MODAL_KEY = 'editFieldAllLanguagesModal';

// Current language first (it's the source rows get copied from), then the rest alphabetically by code.
const orderLanguagesForModal = (languages, currentLanguageCode) => {
    const currentLanguage = languages.find(language => language.language === currentLanguageCode);
    const otherLanguages = languages
        .filter(language => language.language !== currentLanguageCode)
        .sort((a, b) => a.language.localeCompare(b.language));

    return currentLanguage ? [currentLanguage, ...otherLanguages] : otherLanguages;
};

export const EditFieldAllLanguagesActionComponent = ({render: Render, field, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const formik = useFormikContext();
    const editorContext = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();
    // Set by LanguageFieldRow on every row it mounts, so this action hides itself when it is
    // already rendering inside one of this modal's own rows instead of opening a second modal.
    const {allLanguagesEditContext, confirmationDialog} = useContentEditorConfigContext();
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const isPasswordField = Boolean(field.selectorOptions?.find(option => option.name === 'password'));
    const isVisible = !allLanguagesEditContext?.enabled &&
        editorContext.mode !== 'create' &&
        field.i18n &&
        !isPasswordField &&
        editorContext.siteInfo.languages.length > 1;

    const closeModal = () => componentRenderer.destroy(MODAL_KEY);

    const openModal = () => {
        // The SEO fields (page title, description, ...) are worth translating too, but only on nodes
        // that are actually rendered as a page. The section is hidden by default in nt_base, unhidden
        // per node type, and gated by the viewSeoTab permission - requiring section.visible on top of
        // the node type keeps the switcher in step with the editor's own SEO tab.
        const isRenderedAsPage = Boolean(editorContext.nodeData.isRenderedAsPage);
        const switchableSections = (sections || []).filter(section =>
            section.name === 'content' ||
            (section.name === 'seo' && isRenderedAsPage && section.visible));

        // Mirrors exactly what Section/FieldSet render for those sections: filterFieldSets drops
        // hidden/empty/not-yet-activated fieldSets, the dynamic-fieldSet activation check matches
        // FieldSet's own `activatedFieldSet`, and field.visible drops individually hidden fields -
        // so the switcher never lists a field the user wouldn't otherwise see in the editor.
        // Password fields can't be edited through this modal (see isPasswordField above) either.
        const switchableFields = switchableSections.flatMap(section =>
            filterFieldSets(section.fieldSets)
                .filter(fieldSet => !fieldSet.dynamic || Boolean(formik.values[fieldSet.name]))
                .flatMap(fieldSet => fieldSet.fields)
                .filter(sectionField => sectionField.visible && !sectionField.selectorOptions?.find(option => option.name === 'password')));

        componentRenderer.render(MODAL_KEY, EditFieldAllLanguagesModal, {
            field,
            fields: switchableFields,
            uuid: editorContext.nodeData.uuid,
            languages: orderLanguagesForModal(editorContext.siteInfo.languages, editorContext.lang),
            editorContext,
            onSaved: (savedField, savedValuesByLanguage) => {
                // The row for the language currently open in the main editor isn't loaded there -
                // reflect what was just saved immediately, instead of waiting for a language switch.
                if (Object.prototype.hasOwnProperty.call(savedValuesByLanguage, editorContext.lang)) {
                    formik.setFieldValue(savedField.name, savedValuesByLanguage[editorContext.lang]);
                }
            },
            onClose: closeModal
        });
    };

    // The modal reads the field's values straight from the repository, so anything typed in the
    // editor and not saved yet would neither show up there nor survive a save made from it. Ask the
    // same way leaving the editor with unsaved changes does.
    const hasUnsavedEditorChanges = isDirty(formik, editorContext.i18nContext || {});

    const handleClick = () => {
        if (hasUnsavedEditorChanges && confirmationDialog) {
            formik.validateForm();
            setIsConfirmationOpen(true);
        } else {
            openModal();
        }
    };

    const handleConfirmation = data => {
        // On discard the editor stays open behind the modal - put its form back to what was saved,
        // so it stops showing values the modal is about to contradict. On save the dialog's own
        // button has already submitted the form by the time this runs.
        if (data?.discard) {
            formik.resetForm();
            editorContext.resetI18nContext();
        }

        openModal();
    };

    return (
        <>
            {confirmationDialog && (
                <CloseConfirmationDialog
                    isOpen={isConfirmationOpen}
                    titleKey="jcontent:label.contentEditor.edit.action.editAllLanguages.unsavedChanges.title"
                    messageKey="jcontent:label.contentEditor.edit.action.editAllLanguages.unsavedChanges.message"
                    actionCallback={handleConfirmation}
                    onCloseDialog={() => setIsConfirmationOpen(false)}
                />
            )}
            <Render
                {...otherProps}
                isVisible={isVisible}
                enabled={!field.readOnly && !editorContext.nodeData.lockedAndCannotBeEdited && editorContext.nodeData.hasWritePermission}
                onClick={handleClick}
            />
        </>
    );
};

EditFieldAllLanguagesActionComponent.propTypes = {
    render: PropTypes.func.isRequired,
    field: FieldPropTypes.isRequired
};

export const editFieldAllLanguagesAction = {
    component: EditFieldAllLanguagesActionComponent
};
