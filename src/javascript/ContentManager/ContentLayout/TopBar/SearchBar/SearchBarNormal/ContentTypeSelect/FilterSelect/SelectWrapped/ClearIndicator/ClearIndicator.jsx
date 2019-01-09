import React from 'react';
import {components} from 'react-select';
import {Close} from '@material-ui/icons';

export default class ClearIndicator extends React.Component {
    render() {
        if (this.props.selectProps.open) {
            return (
                <components.ClearIndicator {...this.props}>
                    <Close fontSize="small"/>
                </components.ClearIndicator>
            );
        }

        return <div/>;
    }
}
