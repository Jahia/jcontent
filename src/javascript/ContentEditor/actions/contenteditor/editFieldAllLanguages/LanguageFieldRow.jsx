import React, {useCallback, useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {Formik, useFormikContext} from 'formik';
import {useTranslation} from 'react-i18next';
import {IconButton} from '@material-ui/core';
import {Chip, Typography, Visibility} from '@jahia/moonstone';
import {ContentEditorConfigContextProvider, ContentEditorContext, ContentEditorSectionContextProvider} from '~/ContentEditor/contexts';
import {FieldContainer} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field/Field.container';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {CopyFromSourceLanguageIcon} from './CopyFromSourceLanguageIcon';
import {LanguageRowActions, findRowActions} from './LanguageRowActions';
import {hasValue} from './editFieldAllLanguages.utils';
import styles from './EditFieldAllLanguagesModal.scss';

// Reports this row's live value up to the modal (for the languages-filled counter) as it changes,
// without lifting each row's isolated Formik state into the parent.
const FieldValueWatcher = ({fieldName, onValueChange}) => {
    const {values} = useFormikContext();

    useEffect(() => {
        onValueChange(values[fieldName]);
    }, [fieldName, onValueChange, values]);

    return null;
};

FieldValueWatcher.propTypes = {
    fieldName: PropTypes.string.isRequired,
    onValueChange: PropTypes.func.isRequired
};

// Every row but the source language's drops the field name/description/badges/3-dots menu, so
// language code + field + copy icon fit on one compact line instead of repeating the full header
// on every row.
const COMPACT_INPUT_CONTEXT = {
    displayLabels: false,
    displayBadges: false,
    displayActions: false,
    displayDescription: false
};

export const LanguageFieldRow = React.forwardRef(({field, language, value, originalValue, isReadOnly, editorContext, isSourceLanguage, sourceLanguageCode, hasSourceValue, getValue, getSourceValue, onValueChange, onSetValue, onCopyFromSourceLanguage}, formikRef) => {
    const {t} = useTranslation('jcontent');
    const rowField = useMemo(() => ({...field, readOnly: isReadOnly}), [field, isReadOnly]);

    // A mandatory field that already had a value can't be saved back to empty (server-side
    // constraint) - warn as soon as the user clears it here, instead of letting them hit Save
    // and get a generic "content cannot be saved" error.
    const [showMandatoryClearedWarning, setShowMandatoryClearedWarning] = useState(false);
    const repositoryValue = originalValue === undefined ? value : originalValue;
    const handleValueChange = useCallback(currentValue => {
        onValueChange(currentValue);
        setShowMandatoryClearedWarning(field.mandatory && hasValue(field, repositoryValue) && !hasValue(field, currentValue));
    }, [field, repositoryValue, onValueChange]);

    const rowConfig = useMemo(() => ({
        lang: language.language,
        count: 0,
        // Tells editFieldAllLanguagesAction it is already rendering inside one of this modal's own
        // rows, so it doesn't offer to open a second modal from within the first.
        allLanguagesEditContext: {enabled: true}
    }), [language.language]);

    const rowEditorContext = useMemo(() => ({...editorContext, lang: language.language}), [editorContext, language.language]);

    const showCopyButton = !isSourceLanguage && !isReadOnly;
    // Registrations happen once at module init, long before this modal can be opened, so reading the
    // registry during render is stable - it only decides whether the actions container is needed at all.
    const hasRowActions = findRowActions().length > 0;

    return (
        <div className={styles.languageRow} data-sel-role={`edit-all-languages-row-${language.language}`}>
            <div className={styles.languageLabel} title={language.uiLanguageDisplayName || language.localizedDisplayName}>
                <Typography weight="bold">{language.language.toUpperCase()}</Typography>
                {isReadOnly && (
                    <Chip
                        className={styles.readOnlyBadge}
                        data-sel-role={`edit-all-languages-row-readonly-${language.language}`}
                        label={t('jcontent:label.contentEditor.readOnly')}
                        icon={<Visibility/>}
                        color="accent"
                    />
                )}
            </div>
            <div className={styles.languageFieldRow}>
                <div className={styles.languageField}>
                    {showMandatoryClearedWarning && (
                        <Typography
                            className={styles.mandatoryClearedWarning}
                            data-sel-role={`edit-all-languages-mandatory-warning-${language.language}`}
                        >
                            {t('jcontent:label.contentEditor.edit.action.editAllLanguages.mandatoryFieldCleared')}
                        </Typography>
                    )}
                    <Formik innerRef={formikRef} initialValues={{[field.name]: value}} onSubmit={() => {}}>
                        <>
                            <FieldValueWatcher fieldName={field.name} onValueChange={handleValueChange}/>
                            <ContentEditorConfigContextProvider config={rowConfig}>
                                <ContentEditorContext.Provider value={rowEditorContext}>
                                    <ContentEditorSectionContextProvider formSections={[]}>
                                        <FieldContainer field={rowField} inputContext={isSourceLanguage ? undefined : COMPACT_INPUT_CONTEXT}/>
                                    </ContentEditorSectionContextProvider>
                                </ContentEditorContext.Provider>
                            </ContentEditorConfigContextProvider>
                        </>
                    </Formik>
                </div>
                {(showCopyButton || hasRowActions) && (
                    <div className={styles.languageActions}>
                        {showCopyButton && (
                            <IconButton
                                data-sel-role={`edit-all-languages-copy-${language.language}`}
                                title={t('jcontent:label.contentEditor.edit.action.editAllLanguages.copyFromSourceLanguage', {language: sourceLanguageCode.toUpperCase()})}
                                aria-label={t('jcontent:label.contentEditor.edit.action.editAllLanguages.copyFromSourceLanguage', {language: sourceLanguageCode.toUpperCase()})}
                                onClick={onCopyFromSourceLanguage}
                            >
                                <CopyFromSourceLanguageIcon size="small"/>
                            </IconButton>
                        )}
                        <LanguageRowActions
                            field={field}
                            language={language.language}
                            sourceLanguage={sourceLanguageCode}
                            isSourceLanguage={isSourceLanguage}
                            isReadOnly={isReadOnly}
                            hasSourceValue={hasSourceValue}
                            nodeUuid={editorContext.nodeData.uuid}
                            editorContext={editorContext}
                            getValue={getValue}
                            getSourceValue={getSourceValue}
                            onSetValue={onSetValue}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});

LanguageFieldRow.displayName = 'LanguageFieldRow';

LanguageFieldRow.propTypes = {
    field: FieldPropTypes.isRequired,
    language: PropTypes.shape({
        language: PropTypes.string.isRequired,
        uiLanguageDisplayName: PropTypes.string,
        localizedDisplayName: PropTypes.string
    }).isRequired,
    value: PropTypes.any,
    /** What the repository holds for this language, when `value` is a not-yet-saved edit restored on field switch */
    originalValue: PropTypes.any,
    isReadOnly: PropTypes.bool,
    editorContext: PropTypes.object.isRequired,
    isSourceLanguage: PropTypes.bool,
    sourceLanguageCode: PropTypes.string.isRequired,
    hasSourceValue: PropTypes.bool,
    getValue: PropTypes.func.isRequired,
    getSourceValue: PropTypes.func.isRequired,
    onValueChange: PropTypes.func.isRequired,
    onSetValue: PropTypes.func.isRequired,
    onCopyFromSourceLanguage: PropTypes.func.isRequired
};
