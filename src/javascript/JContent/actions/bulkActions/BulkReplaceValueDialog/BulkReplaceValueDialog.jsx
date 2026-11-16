import React, {useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useApolloClient, useQuery} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';
import {useNotifications} from '@jahia/react-material';
import {Button, CheckboxItem, Dropdown, Input, Loader, Modal, ModalBody, ModalFooter, ModalHeader, Textarea, Typography} from '@jahia/moonstone';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {bulkMutate} from '../bulkMutate';
import {notifyBulkResult} from '../notifyBulkResult';
import {BulkFieldsQuery, canSave, commonFields, EDITOR_KINDS, replaceValueItem} from '../bulkFields';
import styles from '../BulkDialog.scss';

const SEARCHABLE_FROM = 12;
const prefix = 'jcontent:label.contentManager.bulkActions.replaceValue';

const initialValue = field => {
    if (field?.multiple) {
        return [];
    }

    return field?.kind === EDITOR_KINDS.BOOLEAN ? 'false' : '';
};

const ValueEditor = ({field, value, onChange}) => {
    const {t} = useTranslation('jcontent');

    if (field.kind === EDITOR_KINDS.CHOICE) {
        const data = field.constraints.map(constraint => ({label: constraint, value: constraint}));
        const toggle = item => (value.includes(item.value) ? value.filter(entry => entry !== item.value) : [...value, item.value]);
        return field.multiple ? (
            <Dropdown className={styles.control}
                      variant="outlined"
                      data={data}
                      values={value}
                      hasSearch={data.length >= SEARCHABLE_FROM}
                      label={value.length > 0 ? value.join(', ') : t(`${prefix}.choose`)}
                      data-sel-role="bulk-replace-choice"
                      onChange={(event, item) => onChange(toggle(item))}
            />
        ) : (
            <Dropdown className={styles.control}
                      variant="outlined"
                      data={data}
                      value={value}
                      hasSearch={data.length >= SEARCHABLE_FROM}
                      label={value || t(`${prefix}.choose`)}
                      data-sel-role="bulk-replace-choice"
                      onChange={(event, item) => onChange(item.value)}
            />
        );
    }

    if (field.kind === EDITOR_KINDS.BOOLEAN) {
        return (
            <Dropdown className={styles.control}
                      variant="outlined"
                      data={[{label: t(`${prefix}.true`), value: 'true'}, {label: t(`${prefix}.false`), value: 'false'}]}
                      value={value}
                      label={t(`${prefix}.${value === 'true' ? 'true' : 'false'}`)}
                      data-sel-role="bulk-replace-boolean"
                      onChange={(event, item) => onChange(item.value)}
            />
        );
    }

    if (field.multiple) {
        return (
            <>
                <Textarea id="bulk-replace-values"
                          rows={4}
                          value={value.join('\n')}
                          data-sel-role="bulk-replace-values"
                          onChange={event => onChange(event.target.value.split('\n').map(line => line.trim()).filter(Boolean))}
                />
                <Typography variant="caption">{t(`${prefix}.onePerLine`)}</Typography>
            </>
        );
    }

    const types = {[EDITOR_KINDS.NUMBER]: 'number', [EDITOR_KINDS.DATE]: 'date'};
    return (
        <Input id="bulk-replace-value"
               className={styles.control}
               type={types[field.kind] || 'text'}
               value={value}
               data-sel-role="bulk-replace-value"
               onChange={event => onChange(event.target.value)}
        />
    );
};

ValueEditor.propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
    onChange: PropTypes.func.isRequired
};

export const BulkReplaceValueDialog = ({isOpen, paths, onClose}) => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const {language, uilang} = useSelector(state => ({language: state.language, uilang: state.uilang}), shallowEqual);
    const {data, loading, error: loadError} = useQuery(BulkFieldsQuery, {variables: {paths, language: uilang}, fetchPolicy: 'network-only'});
    const fields = useMemo(() => commonFields(data?.jcr?.nodesByPath), [data]);

    const [fieldKey, setFieldKey] = useState(null);
    const [value, setValue] = useState('');
    const [isClearing, setIsClearing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const field = fields.find(candidate => candidate.key === fieldKey);

    const chooseField = key => {
        setFieldKey(key);
        setValue(initialValue(fields.find(candidate => candidate.key === key)));
        setIsClearing(false);
        setError(null);
    };

    const apply = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const {saved, failed} = await bulkMutate({
                client,
                items: paths.map(path => ({path})),
                buildItem: replaceValueItem({field, value, isClearing, language}),
                sharedDeclarations: ['$property: String!', ...(isClearing ? [] : ['$type: JCRPropertyType!'])],
                sharedVariables: {property: field.name, ...(isClearing ? {} : {type: field.requiredType})}
            });
            paths.forEach(path => client.cache.flushNodeEntryByPath(path));
            triggerRefetchAll();
            notifyBulkResult({notificationContext, t, saved, failed});
            onClose();
        } catch (e) {
            setError(e?.message || t('jcontent:label.contentManager.bulkActions.failed'));
        } finally {
            setIsSaving(false);
        }
    };

    const renderBody = () => {
        if (loading) {
            return <Loader size="big"/>;
        }

        if (loadError || fields.length === 0) {
            return <Typography variant="caption" data-sel-role="bulk-replace-no-fields">{t(`${prefix}.noFields`)}</Typography>;
        }

        return (
            <>
                <div className={styles.section}>
                    <Typography variant="caption" weight="bold">{t(`${prefix}.field`)}</Typography>
                    <Dropdown className={styles.control}
                              variant="outlined"
                              data={fields.map(candidate => ({label: candidate.label, value: candidate.key, description: candidate.name}))}
                              value={fieldKey || undefined}
                              hasSearch={fields.length >= SEARCHABLE_FROM}
                              label={field?.label || t(`${prefix}.chooseField`)}
                              data-sel-role="bulk-replace-field"
                              onChange={(event, item) => chooseField(item.value)}
                    />
                </div>
                {field && (
                    <div className={styles.section}>
                        <Typography variant="caption" weight="bold">{t(`${prefix}.newValue`)}</Typography>
                        {!isClearing && <ValueEditor field={field} value={value} onChange={setValue}/>}
                        {!field.mandatory && (
                            <CheckboxItem id="bulk-replace-clear"
                                          checked={isClearing}
                                          value="clear"
                                          data-sel-role="bulk-replace-clear"
                                          label={t(`${prefix}.clear`)}
                                          onChange={(event, checkboxValue, checked) => setIsClearing(checked)}
                            />
                        )}
                        {field.internationalized && (
                            <Typography variant="caption" data-sel-role="bulk-replace-language">
                                {t(`${prefix}.languageOnly`, {language})}
                            </Typography>
                        )}
                    </div>
                )}
                {error && <Typography variant="caption" className={styles.error} data-sel-role="bulk-replace-error">{error}</Typography>}
            </>
        );
    };

    return (
        <Modal isOpen={isOpen} size="medium" data-sel-role="bulk-replace-dialog" onOpenChange={open => !open && onClose()}>
            <>
                <ModalHeader title={t(`${prefix}.title`)}/>
                <ModalBody>
                    <Typography variant="caption">
                        {t('jcontent:label.contentManager.bulkActions.count', {count: paths.length})}
                    </Typography>
                    {renderBody()}
                </ModalBody>
                <ModalFooter>
                    <Button size="big" variant="ghost" label={t('jcontent:label.contentManager.bulkActions.cancel')} onClick={onClose}/>
                    <Button size="big"
                            color="accent"
                            label={t('jcontent:label.contentManager.bulkActions.apply')}
                            isDisabled={isSaving || !canSave({field, value, isClearing})}
                            data-sel-role="bulk-replace-apply"
                            onClick={apply}
                    />
                </ModalFooter>
            </>
        </Modal>
    );
};

BulkReplaceValueDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    paths: PropTypes.arrayOf(PropTypes.string).isRequired,
    onClose: PropTypes.func.isRequired
};
