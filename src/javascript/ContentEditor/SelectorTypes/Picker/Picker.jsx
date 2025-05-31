import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {ReferenceCard} from '~/ContentEditor/DesignSystem/ReferenceCard';
import {mergeDeep, set, toArray} from './Picker.utils';
import {PickerDialog} from './PickerDialog/PickerDialog';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer, onListReorder, onDirectionalReorder} from '~/ContentEditor/utils';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {Button, ChevronLastList, ChevronFirstList, ChevronUp, ChevronDown} from '@jahia/moonstone';
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
                draggable={false}
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

// eslint-disable-next-line max-params
const getMultipleElement = (fieldData, field, onValueReorder, onValueMove, onFieldRemove, t, setDialogOpen, isDialogOpen) => {
    return (
        <div className="flexFluid">
            {fieldData && fieldData.length > 0 && fieldData.map((fieldVal, index) => {
                return (
                    <OrderableValue
                        key={`${field.name}_${fieldVal.name}`}
                        isReferenceCard
                        component={<ReferenceCard
                            id={fieldVal.name}
                            isReadOnly={field.readOnly}
                            isDraggable={!field.readOnly && fieldData.length > 1}
                            fieldData={fieldVal}
                            cardAction={fieldData.length > 1 &&
                                <div className={styles.referenceCardActions}>
                                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                        <Button isDisabled={index === 0} variant="ghost" icon={<ChevronFirstList/>} data-sel-action={`moveToFirst_${index}`} onClick={() => onValueMove(`${field.name}[${index}]`, 'first')}/>
                                        <Button isDisabled={index === fieldData.length - 1} variant="ghost" icon={<ChevronLastList/>} data-sel-action={`moveToLast_${index}`} onClick={() => onValueMove(`${field.name}[${index}]`, 'last')}/>
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                        <Button isDisabled={index === 0} variant="ghost" icon={<ChevronUp/>} data-sel-action={`moveUp_${index}`} onClick={() => onValueMove(`${field.name}[${index}]`, 'up')}/>
                                        <Button isDisabled={index === fieldData.length - 1} variant="ghost" icon={<ChevronDown/>} data-sel-action={`moveDown_${index}`} onClick={() => onValueMove(`${field.name}[${index}]`, 'down')}/>
                                    </div>
                                </div>}/>}
                        field={field}
                        index={index}
                        onValueReorder={onValueReorder}
                        onFieldRemove={onFieldRemove}/>
                );
            })}
            {/* Needed for droppable div at the bottom */}
            {fieldData && fieldData.length > 0 && (
                <OrderableValue field={field}
                                index={fieldData.length}
                                onValueReorder={onValueReorder}/>
            )}
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
        setFieldValue(field.name, onDirectionalReorder(value, droppedId, direction, field.name));
        setFieldTouched(field.name, true, false);
    };

    const onValueReorder = (droppedId, index) => {
        setFieldValue(field.name, onListReorder(value, droppedId, index, field.name));
        setFieldTouched(field.name, true, false);
    };

    return (
        <div className="flexFluid flexRow_nowrap alignCenter">
            {field.multiple ?
                getMultipleElement(fieldData, field, onValueReorder, onValueMove, onFieldRemove, t, setDialogOpen, isDialogOpen) :
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
