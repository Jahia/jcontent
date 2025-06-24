import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {ReferenceCard} from '~/ContentEditor/DesignSystem/ReferenceCard';
import {mergeDeep, toArray} from './Picker.utils';
import {set} from 'es-toolkit/compat';
import {PickerDialog} from './PickerDialog/PickerDialog';
import {DisplayAction} from '@jahia/ui-extender';
import {
    getButtonRenderer,
    onDirectionalReorder,
    useReorderList
} from '~/ContentEditor/utils';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {Button, Tooltip, ChevronLastList, ChevronFirstList, ChevronUp, ChevronDown} from '@jahia/moonstone';
import {DefaultPickerConfig} from '~/ContentEditor/SelectorTypes/Picker/configs/DefaultPickerConfig';
import {useFormikContext} from 'formik';
import {OrderableValue} from '~/ContentEditor/DesignSystem/OrderableValue/OrderableValue';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {useExternalPickersInfo} from '~/ContentEditor/SelectorTypes/Picker/useExternalPickersInfo';
import {cePickerSetTableViewMode} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {useDispatch} from 'react-redux';

const ButtonRenderer = getButtonRenderer({labelStyle: 'none', defaultButtonProps: {variant: 'ghost'}});

function getOptions(field, inputContext) {
    const parsedOptions = {};
    field.selectorOptions.forEach(option => {
        set(parsedOptions, option.name, option.value || option.values);
    });

    // Handle value constraints if they are available, note that this overrides default config of each picker.
    if (field.valueConstraints.length) {
        inputContext.selectorType.pickerConfig = {
            ...inputContext.selectorType.pickerConfig,
            selectableTypesTable: field.valueConstraints.map(vc => vc.value.string)
        };
    }

    return parsedOptions;
}

// eslint-disable-next-line max-params
const getSimpleElement = (field, error, notFound, t, pickerConfig, fieldData, setDialogOpen, isDialogOpen, inputContext, value) => {
    return (
        <>
            <ReferenceCard
                id={field.name}
                isReadOnly={field.readOnly}
                isError={error || notFound}
                emptyLabel={t((error || notFound) ? pickerConfig.pickerInput.notFoundLabel : pickerConfig.pickerInput.emptyLabel)}
                emptyIcon={(error || notFound) ? pickerConfig.pickerInput.notFoundIcon : pickerConfig.pickerInput.emptyIcon}
                fieldData={fieldData && fieldData[0]}
                onClick={() => setDialogOpen(!isDialogOpen)}
            />
            {inputContext.displayActions && value && (
            <DisplayAction
                        actionKey="content-editor/field/Picker"
                        value={value}
                        field={field}
                        inputContext={inputContext}
                        render={ButtonRenderer}
                    />
            )}
        </>

    );
};

const MultipleElement = ({fieldData, field, setValue, onValueMove, onFieldRemove, t, setDialogOpen, isDialogOpen}) => {
    const {handleReorder, reorderedItems, reset} = useReorderList(fieldData);
    const handleReorderDropped = () => {
        // Once reorder is finalized, commit to formik
        setValue(reorderedItems.map(({item}) => item.uuid));
    };

    return (
        <div className="flexFluid">
            {reorderedItems.map(({index, item, id}) => {
                return (
                    <OrderableValue
                        key={id}
                        isReferenceCard
                        id={id}
                        isDraggable={!field.readOnly && fieldData.length > 1}
                        component={<ReferenceCard
                            id={item.name}
                            isReadOnly={field.readOnly}
                            fieldData={item}
                            cardAction={fieldData.length > 1 &&
                                <div className={styles.referenceCardActions}>
                                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                        <Tooltip label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveFirst')}>
                                            <Button
                                                isDisabled={index === 0}
                                                variant="ghost"
                                                icon={<ChevronFirstList/>}
                                                data-sel-action={`moveToFirst_${index}`}
                                                aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveFirst')}
                                                onClick={() => onValueMove(`${field.name}[${index}]`, 'first')}
                                            />
                                        </Tooltip>
                                        <Tooltip label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveLast')}>
                                            <Button
                                                isDisabled={index === fieldData.length - 1}
                                                variant="ghost"
                                                icon={<ChevronLastList/>}
                                                data-sel-action={`moveToLast_${index}`}
                                                aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveLast')}
                                                onClick={() => onValueMove(`${field.name}[${index}]`, 'last')}
                                            />
                                        </Tooltip>
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                        <Tooltip label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveUp')}>
                                            <Button
                                                isDisabled={index === 0}
                                                variant="ghost"
                                                icon={<ChevronUp/>}
                                                data-sel-action={`moveUp_${index}`}
                                                aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveUp')}
                                                onClick={() => onValueMove(`${field.name}[${index}]`, 'up')}
                                            />
                                        </Tooltip>
                                        <Tooltip label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveDown')}>
                                            <Button
                                                isDisabled={index === fieldData.length - 1}
                                                variant="ghost"
                                                icon={<ChevronDown/>}
                                                data-sel-action={`moveDown_${index}`}
                                                aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveDown')}
                                                onClick={() => onValueMove(`${field.name}[${index}]`, 'down')}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>}/>}
                        field={field}
                        index={index}
                        onValueReorder={handleReorder}
                        onValueReorderDropped={handleReorderDropped}
                        onValueReorderAborted={reset}
                        onFieldRemove={onFieldRemove}/>
                );
            })}
            {!field.readOnly &&
                <Button className={styles.addButton}
                        data-sel-action="addField"
                        variant="outlined"
                        size="big"
                        label={t('jcontent:label.contentEditor.edit.fields.actions.add')}
                        onClick={() => setDialogOpen(!isDialogOpen)}
                />}
        </div>
    );
};

MultipleElement.propTypes = {
    fieldData: PropTypes.array.isRequired,
    field: PropTypes.object.isRequired,
    setValue: PropTypes.func.isRequired,
    onValueMove: PropTypes.func.isRequired,
    onFieldRemove: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    setDialogOpen: PropTypes.func.isRequired,
    isDialogOpen: PropTypes.bool
};

export const Picker = ({
    field,
    value,
    editorContext,
    inputContext,
    onChange,
    onBlur
}) => {
    const {t} = useTranslation('jcontent');
    const {lang} = useContentEditorConfigContext();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const {setFieldValue, setFieldTouched} = useFormikContext();

    const parsedOptions = getOptions(field, inputContext);
    const pickerConfig = mergeDeep({}, DefaultPickerConfig, inputContext.selectorType.pickerConfig, parsedOptions.pickerConfig);

    const {
        availableExternalPickerConfigs,
        externalPickerConfig,
        loading: infoLoading
    } = useExternalPickersInfo(editorContext.site, value ? toArray(value).map(uuid => ({uuid})) : [], pickerConfig);

    const usePickerInputData = pickerConfig.pickerInput.usePickerInputData;
    const {
        fieldData, error, loading, notFound
    } = usePickerInputData(value && toArray(value));

    const dispatch = useDispatch();

    useEffect(() => {
        if (pickerConfig.defaultViewMode) {
            dispatch(cePickerSetTableViewMode(pickerConfig.defaultViewMode));
        }
    }, [dispatch, pickerConfig.defaultViewMode]);

    if (error) {
        const message = t(
            'jcontent:label.jcontent.error.queryingContent',
            {details: error.message ? error.message : ''}
        );

        console.warn(message);
    }

    if (infoLoading || loading) {
        return <LoaderOverlay/>;
    }

    inputContext.actionContext = {
        open: setDialogOpen,
        fieldData,
        editorContext,
        onChange: newValue => onChange(newValue),
        onBlur: onBlur
    };

    const onItemSelection = data => {
        setDialogOpen(false);
        const itemSelectionAdapter = pickerConfig.pickerInput.itemSelectionAdapter || (data => {
            const uuids = (data || []).map(d => d?.uuid);
            return field.multiple ? uuids : uuids[0];
        });
        onChange(itemSelectionAdapter(data));
        setTimeout(() => onBlur(), 0);
    };

    const onFieldRemove = index => {
        let updatedValues = [...fieldData];
        updatedValues.splice(index, 1);
        onItemSelection(updatedValues);
    };

    const onValueMove = (droppedId, direction) => {
        // Reordering using buttons (move up/down, move to first/last)
        setFieldValue(field.name, onDirectionalReorder(value, droppedId, direction, field.name));
        setFieldTouched(field.name, true, false);
    };

    const onValueChanged = newValue => {
        // This is called when reordering is done by dropping the
        // dragged item on a valid drop target
        setFieldValue(field.name, newValue);
        setFieldTouched(field.name, true, false);
    };

    return (
        <div className="flexFluid flexRow_nowrap alignCenter">
            {field.multiple ?
                <MultipleElement fieldData={fieldData || []} field={field} t={t} setDialogOpen={setDialogOpen} isDialogOpen={isDialogOpen} setValue={onValueChanged} onValueMove={onValueMove} onFieldRemove={onFieldRemove}/> :
                getSimpleElement(field, error, notFound, t, pickerConfig, fieldData, setDialogOpen, isDialogOpen, inputContext, value)}

            <PickerDialog
                isOpen={isDialogOpen}
                site={editorContext.site}
                pickerConfig={pickerConfig}
                availableExternalPickerConfigs={availableExternalPickerConfigs}
                externalPickerConfig={externalPickerConfig}
                initialSelectedItem={fieldData || []}
                accordionItemProps={mergeDeep({}, pickerConfig.accordionItem, parsedOptions.accordionItem)}
                lang={lang}
                isMultiple={field.multiple}
                onClose={() => setDialogOpen(false)}
                onItemSelection={onItemSelection}
            />
        </div>
    );
};

Picker.propTypes = {
    editorContext: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    field: FieldPropTypes.isRequired,
    inputContext: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
