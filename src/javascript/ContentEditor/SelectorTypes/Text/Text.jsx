import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {Hidden, Visibility, Input, Button} from '@jahia/moonstone';
import {useSelector} from 'react-redux';
import NumericFormat from 'react-number-format';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {hasUnreadableStoredValue} from '~/ContentEditor/utils';

export const Text = ({field, value, id, onChange, onBlur}) => {
    const [hidePassword, setHidePassword] = useState(true);
    const {t} = useTranslation('jcontent');
    const {nodeData} = useContentEditorContext();

    const uilang = useSelector(state => state.uilang);
    const fieldType = field.requiredType;
    const isNumber = fieldType === 'DOUBLE' || fieldType === 'LONG' || fieldType === 'DECIMAL';
    const decimalSeparator = uilang === 'en' ? '.' : ',';
    const controlledValue = value === undefined ? '' : (isNumber ? value?.replace('.', decimalSeparator) : value);

    const isPassword = field.selectorOptions?.find(option => option.name === 'password');
    const placeholder = !field.readOnly && hasUnreadableStoredValue(field, nodeData) ?
        t(field.multiple ?
            'jcontent:label.contentEditor.selectorTypes.text.storedValuesPlaceholder' :
            'jcontent:label.contentEditor.selectorTypes.text.storedValuePlaceholder') :
        undefined;
    const Icon = hidePassword ? Visibility : Hidden;
    const postfixComponent = isPassword ? (
        <Button
            aria-label={hidePassword ? 'Show password' : 'Hide password'}
            variant="ghost"
            icon={<Icon/>}
            onClick={() => {
                setHidePassword(!hidePassword);
            }}
        />
    ) : null;
    const maxLength = field.selectorOptions?.find(option => option.name === 'maxLength');

    if (isNumber) {
        return (
            <NumericFormat
                allowNegative
                id={id}
                name={id}
                size="big"
                customInput={Input}
                value={controlledValue || ''}
                decimalSeparator={decimalSeparator}
                decimalScale={fieldType === 'LONG' ? 0 : undefined}
                disabled={field.readOnly}
                aria-labelledby={`${field.name}-label`}
                aria-required={field.mandatory}
                onValueChange={values => onChange(values.value)}
                onBlur={onBlur}
            />
        );
    }

    return (
        <Input
            id={id}
            name={id}
            size="big"
            aria-labelledby={`${field.name}-label`}
            aria-required={field.mandatory}
            maxLength={maxLength && maxLength.value}
            placeholder={placeholder}
            value={controlledValue}
            isReadOnly={field.readOnly}
            type={isPassword && hidePassword ? 'password' : 'text'}
            postfixComponents={postfixComponent}
            onChange={evt => onChange(evt?.target?.value)}
            onBlur={onBlur}
        />
    );
};

Text.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    field: FieldPropTypes.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func
};

Text.displayName = 'Text';
