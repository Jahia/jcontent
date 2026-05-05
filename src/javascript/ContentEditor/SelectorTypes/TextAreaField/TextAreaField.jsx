import React from 'react';
import PropTypes from 'prop-types';
import {TextArea} from '~/ContentEditor/DesignSystem/TextArea';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import styles from './TextAreaField.scss';

const findOption = (field, name) => field.selectorOptions?.find(option => option.name === name);

export const TextAreaField = ({id, value, field, onChange, onBlur}) => {
    const rowsOption = findOption(field, 'rows');
    const rows = rowsOption ? Number.parseInt(rowsOption.value, 10) : undefined;
    const monospace = findOption(field, 'monospace')?.value === 'true';

    return (
        <TextArea id={id}
                  name={id}
                  aria-labelledby={`${field.name}-label`}
                  value={value || ''}
                  rows={rows}
                  className={monospace ? styles.monospace : undefined}
                  readOnly={field.readOnly}
                  onChange={evt => onChange(evt?.target?.value)}
                  onBlur={onBlur}
        />
    );
};

TextAreaField.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    field: FieldPropTypes.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
