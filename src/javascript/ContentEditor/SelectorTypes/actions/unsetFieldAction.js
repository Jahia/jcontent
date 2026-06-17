import React from 'react';
import PropTypes from 'prop-types';
import {useFormikContext} from 'formik';

export const UnsetFieldActionComponent = ({field, inputContext, render: Render, loading: Loading, ...others}) => {
    const formik = useFormikContext();
    const value = formik.values[field.name];
    const enabled = Boolean(!field.readOnly && (
        Array.isArray(value) ? value && value.length !== 0 : value
    ));

    return (
        <Render
            {...others}
            enabled={enabled}
            onClick={() => {
                const newValue = Array.isArray(value) ? [] : null;
                formik.setFieldValue(
                    field.name,
                    newValue,
                    true
                );
                formik.setFieldTouched(field.name);
                if (inputContext.actionContext.onChange) {
                    inputContext.actionContext.onChange(newValue);
                }

                if (inputContext.actionContext.onBlur) {
                    setTimeout(() => inputContext.actionContext.onBlur(), 0);
                }
            }}
        />
    );
};

UnsetFieldActionComponent.propTypes = {
    field: PropTypes.object.isRequired,

    inputContext: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};

export const unsetFieldAction = {
    component: UnsetFieldActionComponent
};
