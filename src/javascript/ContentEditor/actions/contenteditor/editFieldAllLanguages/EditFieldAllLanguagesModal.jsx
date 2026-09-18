import React, {useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useApolloClient, useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Chip, Dropdown, Loader, Typography} from '@jahia/moonstone';
import {FieldValuesByLanguageQuery} from './editFieldAllLanguages.gql-queries';
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
    const formikRefs = useRef({});

    const languageCodes = useMemo(() => languages.map(language => language.language), [languages]);

    const fieldOptions = useMemo(() => fields.map(candidateField => ({
        label: candidateField.displayName,
        value: candidateField.name,
        description: candidateField.mandatory ? t('jcontent:label.contentEditor.edit.validation.required') : undefined,
        isDisabled: !candidateField.i18n,
        attributes: {'data-sel-role': `edit-all-languages-field-option-${candidateField.name}`}
    })), [fields, t]);

    const handleFieldSwitch = (event, option) => {
        const nextField = fields.find(candidateField => candidateField.name === option.value);
        if (nextField && nextField.name !== activeField.name) {
            setActiveField(nextField);
            // Counts and formik refs are for the previous field's rows, about to unmount.
            setFilledLanguages({});
            formikRefs.current = {};
        }
    };

    const handleCopyFromSourceLanguage = targetLanguageCode => {
        const sourceFormik = formikRefs.current[languages[0].language];
        const targetFormik = formikRefs.current[targetLanguageCode];
        if (sourceFormik && targetFormik) {
            targetFormik.setFieldValue(activeField.name, sourceFormik.values[activeField.name]);
        }
    };

    // Only updates state (and re-renders) when a row's filled/empty status actually flips, so the
    // effect in each row's FieldValueWatcher doesn't retrigger itself via a fresh onValueChange prop.
    const handleFieldValueChange = (languageCode, value) => {
        const filled = hasValue(activeField, value);
        setFilledLanguages(previous => (previous[languageCode] === filled ? previous : {...previous, [languageCode]: filled}));
    };

    const filledLanguageCount = Object.values(filledLanguages).filter(Boolean).length;

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

    const handleSave = async () => {
        const propertiesToSave = [];
        const propertiesToDelete = [];
        const savedValuesByLanguage = {};

        languages.forEach(language => {
            const formik = formikRefs.current[language.language];
            const languageValue = valuesByLanguageCode[language.language];
            if (!formik || !languageValue || languageValue.readOnly) {
                return;
            }

            const originalValue = adaptRowValue(activeField, languageValue);
            const currentValue = formik.values[activeField.name];
            if (!hasValueChanged(activeField, originalValue, currentValue)) {
                return;
            }

            const mutationEntry = buildPropertyMutation(activeField, language.language, currentValue);
            if (mutationEntry.toSave) {
                propertiesToSave.push(mutationEntry.toSave);
            } else {
                propertiesToDelete.push(mutationEntry.toDelete);
            }

            savedValuesByLanguage[language.language] = currentValue;
        });

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
            onSaved(activeField, savedValuesByLanguage);
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
                <Dropdown
                    data-sel-role="edit-all-languages-field-switcher"
                    data={fieldOptions}
                    value={activeField.name}
                    size="medium"
                    onChange={handleFieldSwitch}
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
                        value={adaptRowValue(activeField, valuesByLanguageCode[language.language])}
                        isReadOnly={Boolean(valuesByLanguageCode[language.language]?.readOnly)}
                        isSourceLanguage={index === 0}
                        sourceLanguageCode={languages[0].language}
                        onValueChange={value => handleFieldValueChange(language.language, value)}
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
