import {Button, Typography} from '@jahia/moonstone';
import React from 'react';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {FastField, useFormikContext} from 'formik';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {hasUnreadableStoredValue, useReorderList} from '~/ContentEditor/utils';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';
import {OrderableValue} from '~/ContentEditor/DesignSystem/OrderableValue/OrderableValue';

export const MultipleField = ({editorContext, inputContext, field, onChange, onBlur}) => {
    const {values, setFieldValue, setFieldTouched} = useFormikContext();
    const {t} = useTranslation('jcontent');
    const fieldValue = Array.isArray(values[field.name]) ? values[field.name] : [];
    // With no row, no input shows the placeholder of the stored values
    const showStoredValuesHint = !field.readOnly && fieldValue.length === 0 && hasUnreadableStoredValue(field, editorContext.nodeData);
    const storedValuesHintId = `${field.name}-stored-values-hint`;

    const {reorderedItems, handleReorder, reset} = useReorderList(fieldValue);

    const multipleFieldOnChange = (index, newData) => {
        onChange({index, value: newData});
    };

    const onFieldRemove = index => {
        let updatedValues = [...values[field.name]];
        updatedValues.splice(index, 1);
        onChange(updatedValues);
        onBlur();
    };

    const onFieldAdd = () => {
        let updatedValues = values[field.name] ? [...values[field.name]] : [];
        const valueToAdd = field.requiredType === 'BOOLEAN' ? false : undefined;
        updatedValues.push(valueToAdd);
        onChange(updatedValues);
        onBlur();
    };

    const handleFinalReorder = () => {
        const newValues = reorderedItems.map(({item}) => item);
        setFieldValue(field.name, newValues);
        setFieldTouched(field.name, true, false);
    };

    return (
        <>
            <div className="flexFluid">
                {showStoredValuesHint && (
                    <Typography id={storedValuesHintId} variant="caption" data-sel-role="stored-values-hint">
                        {t('jcontent:label.contentEditor.selectorTypes.text.storedValuesPlaceholder')}
                    </Typography>
                )}
                {reorderedItems?.length > 0 && (
                    reorderedItems.map(({item, id, index}) => {
                        const FieldComponent = inputContext.selectorType.cmp;
                        const name = `${field.name}[${index}]`;

                        return (
                            <OrderableValue
                                key={id}
                                id={id}
                                component={<FastField component={FieldComponent}
                                                      id={name}
                                                      field={field}
                                                      value={item}
                                                      values={values}
                                                      editorContext={editorContext}
                                                      inputContext={inputContext}
                                                      onChange={newData => {
                                                                      multipleFieldOnChange(index, newData);
                                                                  }}
                                                      onBlur={onBlur}
                                            />}
                                field={field}
                                index={index}
                                isDraggable={!field.readOnly && values[field.name].length > 1}
                                onFieldRemove={onFieldRemove}
                                onValueReorder={handleReorder}
                                onValueReorderDropped={handleFinalReorder}
                                onValueReorderAborted={reset}
                            />
                        );
                    })
                )}
            </div>
            {!field.readOnly &&
            <Button className={styles.addButton}
                    data-sel-action="addField"
                    aria-describedby={showStoredValuesHint ? storedValuesHintId : undefined}
                    variant="outlined"
                    size="big"
                    label={t('jcontent:label.contentEditor.edit.fields.actions.add')}
                    onClick={() => onFieldAdd()}
            />}
        </>
    );
};

MultipleField.propTypes = {
    inputContext: PropTypes.object.isRequired,
    editorContext: PropTypes.object.isRequired,
    field: FieldPropTypes.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
