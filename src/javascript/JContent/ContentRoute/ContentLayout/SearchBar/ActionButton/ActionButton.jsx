import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import {Button} from '@jahia/design-system-kit';
import {withTranslation} from 'react-i18next';
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

ActionButton.propTypes = {
    classes: PropTypes.object.isRequired,
    cmRole: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(ActionButton);
