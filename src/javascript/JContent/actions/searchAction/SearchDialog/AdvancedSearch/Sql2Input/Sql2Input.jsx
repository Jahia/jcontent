import React from 'react';
import PropTypes from 'prop-types';
import {Input} from '@jahia/design-system-kit';

export class Sql2Input extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onKeyDown(e) {
        if (e.key === 'Enter') {
            this.props.onSearch();
        }
    }

    render() {
        let {maxLength, size, value, onChange, style, cmRole} = this.props;

        return (
            <Input fullWidth
                   inputProps={{maxLength: maxLength, size: size, 'data-cm-role': cmRole}}
                   value={value}
                   style={style}
                   onChange={onChange}
                   onKeyDown={e => this.onKeyDown(e)}
            />
        );
    }
}

Sql2Input.propTypes = {
    cmRole: PropTypes.string.isRequired,
    maxLength: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    size: PropTypes.number,
    style: PropTypes.object,
    value: PropTypes.string.isRequired
};

export default Sql2Input;
