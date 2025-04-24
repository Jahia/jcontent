import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {ReferenceCard} from '~/ContentEditor/DesignSystem/ReferenceCard';
import {mergeDeep, set, toArray} from './Picker.utils';
import {PickerDialog} from './PickerDialog/PickerDialog';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer, onListReorder} from '~/ContentEditor/utils';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {Button} from '@jahia/moonstone';
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
                isReadOnly={field.readOnly}
                isError={error || notFound}
                emptyLabel={t((error || notFound) ? pickerConfig.pickerInput.notFoundLabel : pickerConfig.pickerInput.emptyLabel)}
                emptyIcon={(error || notFound) ? pickerConfig.pickerInput.notFoundIcon : pickerConfig.pickerInput.emptyIcon}
                labelledBy={`${field.name}-label`}
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
const getMultipleElement = (fieldData, field, onValueReorder, onFieldRemove, t, setDialogOpen, isDialogOpen) => {
    return (
        <div className="flexFluid">
            {fieldData && fieldData.length > 0 && fieldData.map((fieldVal, index) => {
                return (
                    <OrderableValue
                        key={`${field.name}_${fieldVal.name}`}
                        component={<ReferenceCard
                            isReadOnly
                            labelledBy={`${fieldVal.name}-label`}
                            fieldData={fieldVal}/>}
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

    const onValueReorder = (droppedId, index) => {
        setFieldValue(field.name, onListReorder(value, droppedId, index, field.name));
        setFieldTouched(field.name, true, false);
    };

    return (
        <div className="flexFluid flexRow_nowrap alignCenter">
            {field.multiple ?
                getMultipleElement(fieldData, field, onValueReorder, onFieldRemove, t, setDialogOpen, isDialogOpen) :
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
