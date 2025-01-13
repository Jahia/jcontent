import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {ListSelector} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

const toArray = value => (Array.isArray(value) ? value : [value]);

export const MultipleLeftRightSelector = ({field, onChange, value, labels}) => {
    const {t} = useTranslation('jcontent');
    const labelBase = 'label.contentEditor.picker.selectors.multipleLeftRightSelector';
    const arrayValue = value ? toArray(value) : [];

    // Reset selection if previously selected option no longer available
    const availableValues = field.valueConstraints.map(valueConstraint => valueConstraint.value.string);
    const actualValues = arrayValue.filter(v => availableValues.includes(v));
    useEffect(() => {
        if (arrayValue && arrayValue.length > 0) {
            if (actualValues.length !== arrayValue.length) {
                onChange(actualValues);
            }
        }
    }, [value, onChange]); // eslint-disable-line

    const options = field.valueConstraints.map(constraint => ({
        label: constraint.displayValue,
        value: constraint.value.string
    }));

    const listLabels = {
        addAllTitle: t(`${labelBase}.addAll`),
        removeAllTitle: t(`${labelBase}.removeAll`),
        selected: t(`${labelBase}.selected`, {count: arrayValue.length})
    };

    if (labels !== undefined) {
        if (Object.hasOwn(labels, 'rightListTitle')) {
            listLabels.rightListTitle = t(labels.rightListTitle);
        }

        if (Object.hasOwn(labels, 'leftListTitle')) {
            listLabels.leftListTitle = t(labels.leftListTitle);
        }
    }

    return (arrayValue.length === actualValues.length) ? (
        <ListSelector
            isReadOnly={field.readOnly || field.valueConstraints.length === 0}
            label={listLabels}
            values={arrayValue}
            options={options}
            onChange={onChange}
        />
    ) : null;
};

MultipleLeftRightSelector.propTypes = {
    field: FieldPropTypes.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOf([PropTypes.string, PropTypes.array]),
    labels: PropTypes.shape({
        rightListTitle: PropTypes.string,
        leftListTitle: PropTypes.string
    })
};

export default MultipleLeftRightSelector;
