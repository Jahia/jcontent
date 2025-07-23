import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {Hidden, Visibility, Input, Button} from '@jahia/moonstone';
import {useSelector} from 'react-redux';

export const Text = ({field, value, id, onChange, onBlur}) => {
    const [hidePassword, setHidePassword] = useState(true);

    const uilang = useSelector(state => state.uilang);
    const fieldType = field.requiredType;
    const isNumber = fieldType === 'DOUBLE' || fieldType === 'LONG' || fieldType === 'DECIMAL';
    const decimalSeparator = uilang === 'en' ? '.' : ',';
    const controlledValue = value === undefined ? '' : (isNumber ? value?.replace('.', decimalSeparator) : value);

    const isPassword = field.selectorOptions?.find(option => option.name === 'password');
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
    return (
        <Input
            id={id}
            name={id}
            size="big"
            aria-labelledby={`${field.name}-label`}
            aria-required={field.mandatory}
            maxLength={maxLength && maxLength.value}
            value={controlledValue}
            isReadOnly={field.readOnly}
            type={isPassword && hidePassword ? 'password' : isNumber ? 'number' : 'text'}
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
