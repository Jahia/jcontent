import React from 'react';
import {withStyles, Button} from '@material-ui/core';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';

const styles = theme => ({
    actionButton: {
        marginTop: 0,
        marginBottom: theme.spacing.unit,
        float: 'right'
    }
});

class ActionButton extends React.Component {
    render() {
        let {label, onClick, classes, t, cmRole} = this.props;

        return (
            <Button variant="contained" size="small" classes={{root: classes.actionButton}} data-cm-role={cmRole} onClick={onClick}>
                {t(label)}
            </Button>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles)
)(ActionButton);
