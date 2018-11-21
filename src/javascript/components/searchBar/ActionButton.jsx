import React from 'react';
import {withStyles, Button} from '@material-ui/core';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';

const styles = () => ({
    actionButton: {
        textTransform: 'none',
        fontSize: '13px',
        marginTop: -7,
        padding: 0
    }
});

class ActionButton extends React.Component {
    render() {
        let {label, variant, onClick, classes, t, cmRole} = this.props;

        return (
            <Button variant={variant} size="small" classes={{root: classes.actionButton}} data-cm-role={cmRole} onClick={onClick}>
                {t(label)}
            </Button>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles)
)(ActionButton);
