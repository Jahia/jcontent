import React, {useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useApolloClient, useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, ChevronLeft, ChevronRight, Chip, Dropdown, Loader, Typography} from '@jahia/moonstone';
import {FieldValuesByLanguageQuery, buildFieldsFilledLanguagesQuery} from './editFieldAllLanguages.gql-queries';
import {adaptRowValue, buildPropertyMutation, hasValue, hasValueChanged} from './editFieldAllLanguages.utils';
import {SavePropertiesMutation} from '~/ContentEditor/ContentEditor/updateNode/updateNode.gql-mutation';
import {LanguageFieldRow} from './LanguageFieldRow';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {truncate} from '~/utils';
import styles from './EditFieldAllLanguagesModal.scss';

const DIALOG_TITLE_MAX_LENGTH = 50;

export const EditFieldAllLanguagesModal = ({field, fields, uuid, languages, editorContext, onSaved, onClose}) => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const [isSaving, setIsSaving] = useState(false);
    const [filledLanguages, setFilledLanguages] = useState({});
    const [activeField, setActiveField] = useState(field);
    // Rows unmount when the user switches field, and their values are only read back at save time.
    // Whatever was typed for a field left behind is kept here, keyed by field name, so Save writes
    // every field the user touched instead of only the last one.
    const [pendingFields, setPendingFields] = useState({});
    const formikRefs = useRef({});

    const languageCodes = useMemo(() => languages.map(language => language.language), [languages]);

    // A language the node has no translation for cannot hold a value for any i18n field, and the
    // editor already knows which those are - querying them would be guaranteed-empty reads.
    const countableLanguages = useMemo(() => {
        const translationLanguages = editorContext.nodeData.translationLanguages;
        return translationLanguages ? languageCodes.filter(code => translationLanguages.includes(code)) : languageCodes;
    }, [languageCodes, editorContext.nodeData.translationLanguages]);

    const countableFieldNames = useMemo(
        () => fields.filter(candidateField => candidateField.i18n).map(candidateField => candidateField.propertyName),
        [fields]
    );

    const fieldsFilledLanguagesQuery = useMemo(() => buildFieldsFilledLanguagesQuery(countableLanguages), [countableLanguages]);

    // Deliberately not tied to activeField: this is one small request per modal opening, not per field
    // switch. It is also never awaited - the switcher renders without counts until it resolves.
    const {data: filledLanguagesData} = useQuery(fieldsFilledLanguagesQuery, {
        variables: {uuid, names: countableFieldNames},
        skip: countableLanguages.length === 0 || countableFieldNames.length === 0,
        fetchPolicy: 'network-only'
    });

    // A property only shows up in a language's result when that language holds a value for it, so a
    // field missing everywhere is filled in no language - hence seeding every name at zero. Stays
    // undefined until the query resolves, so the switcher shows plain labels rather than a wrong zero.
    const filledCountByPropertyName = useMemo(() => {
        const node = filledLanguagesData?.jcr?.nodeById;
        if (!node) {
            return undefined;
        }

        const counts = {};
        countableFieldNames.forEach(propertyName => {
            counts[propertyName] = 0;
        });
        countableLanguages.forEach((language, index) => {
            (node[`l${index}`] || []).forEach(property => {
                counts[property.name] = (counts[property.name] || 0) + 1;
            });
        });

        return counts;
    }, [filledLanguagesData, countableLanguages, countableFieldNames]);

    const filledLanguageCount = Object.values(filledLanguages).filter(Boolean).length;

    const fieldOptions = useMemo(() => fields.map(candidateField => {
        // The active field's rows are mounted and report their value live, which also covers edits
        // not saved yet - more accurate than what the repository returned when the modal opened.
        const pending = pendingFields[candidateField.name];
        let filledCount;
        if (candidateField.name === activeField.name) {
            filledCount = filledLanguageCount;
        } else if (pending) {
            filledCount = Object.values(pending.values).filter(pendingValue => hasValue(candidateField, pendingValue)).length;
        } else {
            filledCount = filledCountByPropertyName?.[candidateField.propertyName];
        }

        return {
            label: candidateField.i18n && filledCount !== undefined ?
                t('jcontent:label.contentEditor.edit.action.editAllLanguages.fieldOptionLabel', {
                    fieldName: candidateField.displayName,
                    filled: filledCount,
                    total: languages.length
                }) :
                candidateField.displayName,
            value: candidateField.name,
            description: candidateField.mandatory ? t('jcontent:label.contentEditor.edit.validation.required') : undefined,
            isDisabled: !candidateField.i18n,
            attributes: {'data-sel-role': `edit-all-languages-field-option-${candidateField.name}`}
        };
    }), [fields, t, activeField.name, filledLanguageCount, filledCountByPropertyName, pendingFields, languages.length]);

    const switchToField = nextField => {
        if (nextField && nextField.name !== activeField.name) {
            const changes = collectChanges(activeField);
            setPendingFields(previous => {
                const next = {...previous};
                if (changes.propertiesToSave.length > 0 || changes.propertiesToDelete.length > 0) {
                    next[activeField.name] = {field: activeField, values: collectRowValues(activeField), changes};
                } else {
                    // Edited back to what the repository holds: nothing left to carry over.
                    delete next[activeField.name];
                }

                return next;
            });

            setActiveField(nextField);
            // Counts and formik refs are for the previous field's rows, about to unmount.
            setFilledLanguages({});
            formikRefs.current = {};
        }
    };

    const handleFieldSwitch = (event, option) => {
        switchToField(fields.find(candidateField => candidateField.name === option.value));
    };

    // The previous/next arrows walk the same subset the dropdown lets the user pick: non-i18n fields
    // are listed but disabled there, so stepping onto one would land on a field this modal cannot edit.
    const navigableFields = useMemo(() => fields.filter(candidateField => candidateField.i18n), [fields]);
    const activeFieldIndex = navigableFields.findIndex(candidateField => candidateField.name === activeField.name);
    const hasPreviousField = activeFieldIndex > 0;
    const hasNextField = activeFieldIndex !== -1 && activeFieldIndex < navigableFields.length - 1;

    // Single read/write path into a row's isolated Formik state, shared by the copy button and by
    // whatever actions other modules contribute to a row (see LanguageRowActions). Values are read
    // on demand rather than mirrored in state here, so typing in one row doesn't re-render the others.
    const getRowValue = languageCode => formikRefs.current[languageCode]?.values[activeField.name];

    const setRowValue = (languageCode, value) => {
        formikRefs.current[languageCode]?.setFieldValue(activeField.name, value);
    };

    const handleCopyFromSourceLanguage = targetLanguageCode => {
        if (formikRefs.current[languages[0].language] && formikRefs.current[targetLanguageCode]) {
            setRowValue(targetLanguageCode, getRowValue(languages[0].language));
        }
    };

    // Only updates state (and re-renders) when a row's filled/empty status actually flips, so the
    // effect in each row's FieldValueWatcher doesn't retrigger itself via a fresh onValueChange prop.
    const handleFieldValueChange = (languageCode, value) => {
        const filled = hasValue(activeField, value);
        setFilledLanguages(previous => (previous[languageCode] === filled ? previous : {...previous, [languageCode]: filled}));
    };

    const {data, loading, error} = useQuery(FieldValuesByLanguageQuery, {
        variables: {
            uuidOrPath: uuid,
            fieldName: activeField.propertyName,
            multiple: Boolean(activeField.multiple),
            languages: languageCodes
        },
        fetchPolicy: 'network-only'
    });

    const valuesByLanguageCode = useMemo(() => {
        const map = {};
        (data?.forms?.fieldValuesByLanguage || []).forEach(entry => {
            map[entry.language] = entry;
        });
        return map;
    }, [data]);

    // Reads every row of the given field as it currently stands, for restoring it if the user comes back.
    const collectRowValues = targetField => {
        const values = {};
        languages.forEach(language => {
            const formik = formikRefs.current[language.language];
            if (formik) {
                values[language.language] = formik.values[targetField.name];
            }
        });

        return values;
    };

    // Diffs the field's live rows against the repository and turns what changed into mutation entries.
    const collectChanges = targetField => {
        const propertiesToSave = [];
        const propertiesToDelete = [];
        const savedValuesByLanguage = {};

        languages.forEach(language => {
            const formik = formikRefs.current[language.language];
            const languageValue = valuesByLanguageCode[language.language];
            if (!formik || !languageValue || languageValue.readOnly) {
                return;
            }

            const originalValue = adaptRowValue(targetField, languageValue);
            const currentValue = formik.values[targetField.name];
            if (!hasValueChanged(targetField, originalValue, currentValue)) {
                return;
            }

            const mutationEntry = buildPropertyMutation(targetField, language.language, currentValue);
            if (mutationEntry.toSave) {
                propertiesToSave.push(mutationEntry.toSave);
            } else {
                propertiesToDelete.push(mutationEntry.toDelete);
            }

            savedValuesByLanguage[language.language] = currentValue;
        });

        return {propertiesToSave, propertiesToDelete, savedValuesByLanguage};
    };

    const handleSave = async () => {
        // The active field is read from its live rows; every other touched field from what was kept
        // when the user navigated away from it.
        const allChanges = [
            ...Object.values(pendingFields).filter(pending => pending.field.name !== activeField.name),
            {field: activeField, changes: collectChanges(activeField)}
        ];

        const propertiesToSave = allChanges.flatMap(entry => entry.changes.propertiesToSave);
        const propertiesToDelete = allChanges.flatMap(entry => entry.changes.propertiesToDelete);

        if (propertiesToSave.length === 0 && propertiesToDelete.length === 0) {
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            await client.mutate({
                mutation: SavePropertiesMutation,
                variables: {
                    uuid,
                    propertiesToSave,
                    propertiesToDelete,
                    mixinsToAdd: [],
                    mixinsToDelete: [],
                    shouldModifyChildren: false,
                    childrenOrder: [],
                    shouldRename: false,
                    newName: '',
                    wipInfo: {},
                    shouldSetWip: false
                }
            });

            client.cache.flushNodeEntryById(uuid);
            allChanges.forEach(entry => onSaved(entry.field, entry.changes.savedValuesByLanguage));
            onClose();
        } catch (submitError) {
            console.error(submitError);
            notificationContext.notify(t('jcontent:label.contentEditor.edit.action.save.error'), ['closeButton', 'noAutomaticClose']);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog
            open
            maxWidth={false}
            classes={{paper: styles.dialog}}
            aria-labelledby="dialog-editAllLanguages"
            data-sel-role="dialog-edit-all-languages"
            onClose={onClose}
        >
            <DialogTitle id="dialog-editAllLanguages">
                <Typography variant="heading">
                    {t('jcontent:label.contentEditor.edit.action.editAllLanguages.dialogTitle', {
                        contentName: truncate(editorContext.nodeData.displayName, DIALOG_TITLE_MAX_LENGTH),
                        contentType: editorContext.nodeData.primaryNodeType.displayName
                    })}
                </Typography>
            </DialogTitle>
            <div className={styles.fieldSwitcherRow}>
                <Typography className={styles.fieldSwitcherLabel}>
                    {t('jcontent:label.contentEditor.edit.action.editAllLanguages.fieldSwitcherLabel')}
                </Typography>
                <Button
                    data-sel-role="edit-all-languages-previous-field"
                    variant="ghost"
                    icon={<ChevronLeft/>}
                    isDisabled={!hasPreviousField}
                    title={t('jcontent:label.contentEditor.edit.action.editAllLanguages.previousField')}
                    aria-label={t('jcontent:label.contentEditor.edit.action.editAllLanguages.previousField')}
                    onClick={() => switchToField(navigableFields[activeFieldIndex - 1])}
                />
                <Dropdown
                    data-sel-role="edit-all-languages-field-switcher"
                    data={fieldOptions}
                    value={activeField.name}
                    size="medium"
                    onChange={handleFieldSwitch}
                />
                <Button
                    data-sel-role="edit-all-languages-next-field"
                    variant="ghost"
                    icon={<ChevronRight/>}
                    isDisabled={!hasNextField}
                    title={t('jcontent:label.contentEditor.edit.action.editAllLanguages.nextField')}
                    aria-label={t('jcontent:label.contentEditor.edit.action.editAllLanguages.nextField')}
                    onClick={() => switchToField(navigableFields[activeFieldIndex + 1])}
                />
                {activeField.mandatory && (
                    <Chip
                        data-sel-role="edit-all-languages-mandatory-badge"
                        label={t('jcontent:label.contentEditor.edit.validation.required')}
                        color="accent"
                    />
                )}
                <Typography className={styles.languageCounter} data-sel-role="edit-all-languages-counter">
                    {t('jcontent:label.contentEditor.edit.action.editAllLanguages.languageCounter', {
                        filled: filledLanguageCount,
                        total: languages.length
                    })}
                </Typography>
            </div>
            <DialogContent className={styles.modalBody}>
                {loading && <Loader/>}
                {error && (
                    <Typography className={styles.error}>
                        {t('jcontent:label.contentEditor.error.queryingContent', {details: error.message || ''})}
                    </Typography>
                )}
                {!loading && !error && languages.map((language, index) => (
                    <LanguageFieldRow
                        key={`${activeField.name}-${language.language}`}
                        ref={el => {
                            formikRefs.current[language.language] = el;
                        }}
                        field={activeField}
                        language={language}
                        editorContext={editorContext}
                        value={pendingFields[activeField.name] && language.language in pendingFields[activeField.name].values ?
                            pendingFields[activeField.name].values[language.language] :
                            adaptRowValue(activeField, valuesByLanguageCode[language.language])}
                        originalValue={adaptRowValue(activeField, valuesByLanguageCode[language.language])}
                        isReadOnly={Boolean(valuesByLanguageCode[language.language]?.readOnly)}
                        isSourceLanguage={index === 0}
                        sourceLanguageCode={languages[0].language}
                        hasSourceValue={Boolean(filledLanguages[languages[0].language])}
                        getValue={() => getRowValue(language.language)}
                        getSourceValue={() => getRowValue(languages[0].language)}
                        onValueChange={value => handleFieldValueChange(language.language, value)}
                        onSetValue={value => setRowValue(language.language, value)}
                        onCopyFromSourceLanguage={() => handleCopyFromSourceLanguage(language.language)}
                    />
                ))}
            </DialogContent>
            <DialogActions>
                <Button
                    label={t('jcontent:label.contentEditor.edit.action.editAllLanguages.btnCancel')}
                    color="default"
                    size="big"
                    disabled={isSaving}
                    onClick={onClose}
                />
                <Button
                    label={t('jcontent:label.contentEditor.edit.action.editAllLanguages.btnSave')}
                    color="accent"
                    size="big"
                    isLoading={isSaving}
                    disabled={isSaving || loading || Boolean(error)}
                    data-sel-role="edit-all-languages-save"
                    onClick={handleSave}
                />
            </DialogActions>
        </Dialog>
    );
};

EditFieldAllLanguagesModal.propTypes = {
    field: FieldPropTypes.isRequired,
    fields: PropTypes.arrayOf(FieldPropTypes).isRequired,
    uuid: PropTypes.string.isRequired,
    languages: PropTypes.array.isRequired,
    editorContext: PropTypes.object.isRequired,
    onSaved: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};
