import React from 'react';
import * as PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {resolveSelectorType} from '~/ContentEditor/SelectorTypes/resolveSelectorType';
import {Field} from './Field';

export const FieldContainer = React.memo(({field, inputContext}) => {
    const selectorType = resolveSelectorType(field);
    const context = React.useMemo(() => ({
        displayLabels: true,
        displayBadges: true,
        displayActions: true,
        displayErrors: true,
        selectorType,
        ...inputContext
    }), [inputContext, selectorType]);

    return (
        <Field
            idInput={field.name}
            inputContext={context}
            selectorType={selectorType}
            field={field}/>
    );
});

FieldContainer.defaultProps = {
    inputContext: {}
};

FieldContainer.propTypes = {
    field: FieldPropTypes.isRequired,
    inputContext: PropTypes.object
};

FieldContainer.displayName = 'FieldContainer';
