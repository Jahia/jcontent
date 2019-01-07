import React from 'react';
import {components} from 'react-select';
import {ChevronDown} from 'mdi-material-ui';

export default class DropdownIndicator extends React.Component {
    render() {
        if (!this.props.selectProps.open) {
            return (
                <components.DropdownIndicator {...this.props}>
                    <ChevronDown fontSize="small"/>
                </components.DropdownIndicator>
            );
        }

        return <div/>;
    }
}
