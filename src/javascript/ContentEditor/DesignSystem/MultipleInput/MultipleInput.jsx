import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';

import Select, {components} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/async-creatable';
import {Control, DropdownIndicator, MultiValue, MultiValueRemove, NoOptionsMessage} from './components';

const style = theme => ({
    noOptionsMessage: {
        padding: theme.spacing.unit
    }
});

const EmptyCmp = () => '';

const Input = props => {
    // eslint-disable-next-line react/prop-types
    return <components.Input {...props} {...props.selectProps.inputProps}/>;
};

const MultipleInputComponent = ({classes, isCreatable, isAsync, readOnly, ...props}) => {
    const Cmp = isCreatable ? isAsync ? AsyncCreatableSelect : CreatableSelect : Select;
    const components = {
        MultiValue,
        MultiValueRemove,
        Input: Input,
        IndicatorSeparator: EmptyCmp,
        Control,
        NoOptionsMessage,
        DropdownIndicator: isCreatable ? EmptyCmp : DropdownIndicator
    };

    const [selection, setSelection] = useState();
    const handleChange = selection => {
        setSelection(selection);
        props.onChange(selection);
    };

    return (
        <Cmp
                isMulti
                isClearable={false}
                components={components}
                value={selection}
                styles={classes}
                isDisabled={readOnly}
                {...props}
                isReadOnly={readOnly}
                onChange={handleChange}
            />
    );
};

MultipleInputComponent.defaut = {
    isCreatable: false,
    isAsync: false,
    readOnly: false,
    onChange: () => {},
    onBlur: () => {}
};

MultipleInputComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    // eslint-disable-next-line react/boolean-prop-naming
    readOnly: PropTypes.bool,
    isCreatable: PropTypes.bool,
    isAsync: PropTypes.bool,
    onChange: PropTypes.func,
    onBlur: PropTypes.func
};

export const MultipleInput = withStyles(style)(MultipleInputComponent);

MultipleInput.displayName = 'MultipleInput';
