import React from 'react';
import PropTypes from 'prop-types';
import {TextArea} from '~/ContentEditor/DesignSystem/TextArea';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';

export const TextAreaField = ({id, value, field, onChange, onBlur}) => {
    // The `height` selector option (e.g. textarea[height='220']) sets the textarea height in px.
    // When it is absent or not a number, no height is set and the textarea keeps its natural size.
    const heightOption = parseInt(field.selectorOptions?.find(option => option.name === 'height')?.value, 10);
    const style = Number.isNaN(heightOption) ? undefined : {height: heightOption, maxHeight: heightOption};

    return (
        <TextArea id={id}
                  name={id}
                  style={style}
                  aria-labelledby={`${field.name}-label`}
                  value={value || ''}
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
