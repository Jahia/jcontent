import React from 'react';
import {List} from '@material-ui/core';
import LeftDrawerListItems from './LeftDrawerListItems';

export default class LeftDrawerContent extends React.Component {
    render() {
        return (
            <List>
                <LeftDrawerListItems {...this.props}/>
            </List>
        );
    }
}
