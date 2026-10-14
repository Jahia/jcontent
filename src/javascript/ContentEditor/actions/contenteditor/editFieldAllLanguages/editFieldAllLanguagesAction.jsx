import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {useFormikContext} from 'formik';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {filterFieldSets} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Sections';
import {EditFieldAllLanguagesModal} from './EditFieldAllLanguagesModal';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';

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
    const {allLanguagesEditContext} = useContentEditorConfigContext();

    const isPasswordField = Boolean(field.selectorOptions?.find(option => option.name === 'password'));
    const isVisible = !allLanguagesEditContext?.enabled &&
        editorContext.mode !== 'create' &&
        field.i18n &&
        !isPasswordField &&
        editorContext.siteInfo.languages.length > 1;

    const closeModal = () => componentRenderer.destroy(MODAL_KEY);

    const openModal = () => {
        // Mirrors exactly what Section/FieldSet render for the "content" section: filterFieldSets
        // drops hidden/empty/not-yet-activated fieldSets, the dynamic-fieldSet activation check
        // matches FieldSet's own `activatedFieldSet`, and field.visible drops individually hidden
        // fields - so the switcher never lists a field the user wouldn't otherwise see in this tab.
        // Password fields can't be edited through this modal (see isPasswordField above) either.
        const contentSection = (sections || []).find(section => section.name === 'content');
        const switchableFields = contentSection ?
            filterFieldSets(contentSection.fieldSets)
                .filter(fieldSet => !fieldSet.dynamic || Boolean(formik.values[fieldSet.name]))
                .flatMap(fieldSet => fieldSet.fields)
                .filter(sectionField => sectionField.visible && !sectionField.selectorOptions?.find(option => option.name === 'password')) :
            [];

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

    return (
        <Render
            {...otherProps}
            isVisible={isVisible}
            enabled={!field.readOnly && !editorContext.nodeData.lockedAndCannotBeEdited && editorContext.nodeData.hasWritePermission}
            onClick={openModal}
        />
    );
};

EditFieldAllLanguagesActionComponent.propTypes = {
    render: PropTypes.func.isRequired,
    field: FieldPropTypes.isRequired
};

export const editFieldAllLanguagesAction = {
    component: EditFieldAllLanguagesActionComponent
};
