import React from 'react';
import {withStyles} from '@material-ui/core';
import {Button} from '@jahia/ds-mui-theme';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';

const styles = () => ({
    actionButton: {
        margin: 0,
        float: 'right'
    }
});

export class ActionButton extends React.Component {
    render() {
        let {label, onClick, classes, t, cmRole} = this.props;

        return (
            <Button variant="ghost" color="inverted" classes={{root: classes.actionButton}} data-cm-role={cmRole} onClick={onClick}>
                {t(label)}
            </Button>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles)
)(ActionButton);
