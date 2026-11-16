import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useApolloClient} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';
import {useNotifications} from '@jahia/react-material';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, RadioGroup, RadioItem, Typography} from '@jahia/moonstone';
import {Tag} from '~/ContentEditor/SelectorTypes/Tag';
import {Category} from '~/ContentEditor/SelectorTypes/Category';
import {ContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {bulkMutate} from '../bulkMutate';
import {notifyBulkResult} from '../notifyBulkResult';
import {BULK_VALUE_FIELDS, BULK_VALUE_MODES, canApplyValues, heldValues, HeldValuesQuery, itemsToWrite, valueFieldItem} from '../bulkTagCategorize';
import styles from '../BulkDialog.scss';

const PICKERS = {tag: Tag, categorize: Category};

// The selector types read their options from `field`, and Category adds its own on every render: a new object each time.
const pickerField = (field, label) => ({
    name: field.property,
    displayName: label,
    multiple: true,
    readOnly: false,
    requiredType: field.isReference ? 'WeakReference' : 'String',
    selectorType: field.isReference ? 'Category' : 'Tag',
    selectorOptions: []
});

export const BulkValuesDialog = ({isOpen, fieldKey, paths, onClose}) => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const {site, language} = useSelector(state => ({site: state.site, language: state.language}), shallowEqual);
    const field = BULK_VALUE_FIELDS[fieldKey];
    const Picker = PICKERS[fieldKey];
    const prefix = `jcontent:label.contentManager.bulkActions.${fieldKey}`;

    const [mode, setMode] = useState(BULK_VALUE_MODES.ADD);
    const [chosen, setChosen] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const apply = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const {data} = await client.query({query: HeldValuesQuery, variables: {paths, property: field.property}, fetchPolicy: 'network-only'});
            const items = itemsToWrite({paths, held: heldValues(data?.jcr?.nodesByPath), mode, chosen});
            const {saved, failed} = await bulkMutate({
                client,
                items,
                buildItem: (item, index) => valueFieldItem(item)(index, field),
                sharedDeclarations: ['$property: String!', '$type: JCRPropertyType!'],
                sharedVariables: {property: field.property, type: field.type}
            });
            items.forEach(item => client.cache.flushNodeEntryByPath(item.path));
            triggerRefetchAll();
            notifyBulkResult({notificationContext, t, saved, failed});
            onClose();
        } catch (e) {
            setError(e?.message || t('jcontent:label.contentManager.bulkActions.failed'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} size="medium" data-sel-role={`bulk-values-dialog-${fieldKey}`} onOpenChange={open => !open && onClose()}>
            <>
                <ModalHeader title={t(`${prefix}.title`)}/>
                <ModalBody>
                    <Typography variant="caption">
                        {t('jcontent:label.contentManager.bulkActions.count', {count: paths.length})}
                    </Typography>
                    <RadioGroup className={styles.section}
                                name={`bulk-values-mode-${fieldKey}`}
                                value={mode}
                                data-sel-role="bulk-values-mode"
                                onChange={(event, value) => setMode(value)}
                    >
                        {Object.values(BULK_VALUE_MODES).map(value => (
                            <RadioItem key={value}
                                       id={`bulk-values-mode-${fieldKey}-${value}`}
                                       value={value}
                                       label={t(`${prefix}.mode.${value}`)}
                                       description={t(`${prefix}.mode.${value}Hint`)}
                            />
                        ))}
                    </RadioGroup>
                    {/* The list of the picker opens below it, inside the scrolling body of the
                        dialog: the section keeps room for it so that it is not cut off. */}
                    <div className={`${styles.section} ${styles.pickerSection}`} data-sel-role="bulk-values-picker">
                        <Typography variant="caption" weight="bold">{t(`${prefix}.label`)}</Typography>
                        <ContentEditorContext.Provider value={{site, lang: language}}>
                            <Picker id={`bulk-${fieldKey}`}
                                    field={pickerField(field, t(`${prefix}.label`))}
                                    value={chosen}
                                    editorContext={{site, lang: language}}
                                    onChange={values => setChosen(values || [])}
                                    onBlur={() => {}}
                            />
                        </ContentEditorContext.Provider>
                        <Typography variant="caption">{t(`${prefix}.hint`)}</Typography>
                    </div>
                    {mode === BULK_VALUE_MODES.REPLACE && chosen.length === 0 && (
                        <Typography variant="caption" className={styles.warning} data-sel-role="bulk-values-clears">
                            {t(`${prefix}.clears`)}
                        </Typography>
                    )}
                    {error && (
                        <Typography variant="caption" className={styles.error} data-sel-role="bulk-values-error">{error}</Typography>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button size="big" variant="ghost" label={t('jcontent:label.contentManager.bulkActions.cancel')} onClick={onClose}/>
                    <Button size="big"
                            color="accent"
                            label={t('jcontent:label.contentManager.bulkActions.apply')}
                            isDisabled={isSaving || !canApplyValues({mode, chosen})}
                            data-sel-role="bulk-values-apply"
                            onClick={apply}
                    />
                </ModalFooter>
            </>
        </Modal>
    );
};

BulkValuesDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    fieldKey: PropTypes.oneOf(Object.keys(BULK_VALUE_FIELDS)).isRequired,
    paths: PropTypes.arrayOf(PropTypes.string).isRequired,
    onClose: PropTypes.func.isRequired
};
