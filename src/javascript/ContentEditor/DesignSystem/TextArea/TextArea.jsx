import React from 'react';
import PropTypes from 'prop-types';

import {Textarea as TextAreaMoonstone} from '@jahia/moonstone';

export const TextArea = ({
    classes,
    rows,
    disabled,
    readOnly,
    ...otherProps
}) => {
    return (
        <TextAreaMoonstone
            rows={rows}
            isReadOnly={readOnly}
            isDisabled={disabled}
            {...otherProps}
        />
    );
};

TextArea.defaultProps = {
    value: '',
    rows: 5,
    readOnly: false,
    disabled: false
};

TextArea.propTypes = {
    rows: PropTypes.number,
    value: PropTypes.string,
    // eslint-disable-next-line react/boolean-prop-naming
    readOnly: PropTypes.bool,
    // eslint-disable-next-line react/boolean-prop-naming
    disabled: PropTypes.bool,
    classes: PropTypes.object.isRequired
};
