import React from 'react';
import PropTypes from 'prop-types';
import iconRenderer from './iconRenderer';
import {withStyles} from '@material-ui/core';
import {Button, Typography} from '@jahia/ds-mui-theme';

const styles = theme => ({
    contentLabel: {
        paddingLeft: theme.spacing.unit
    },
    icon: {
        color: theme.palette.font.alpha
    },
    button: {
        minWidth: 0
    }
});

export const BreadcrumbItem = ({item, selectItem, classes, showLabel}) => (
    <Button
        disableRipple
        className={classes.button}
        variant="ghost"
        size="compact"
        aria-haspopup="true"
        aria-owns={'breadcrumbMenu_' + item.uuid}
        onClick={() => selectItem(item.path)}
    >
        {iconRenderer(item, classes.icon, !showLabel)}
        {showLabel &&
        <Typography noWrap
                    variant="iota"
                    data-cm-role="breadcrumb-name"
                    classes={{root: classes.contentLabel}}
        >
            {item.name}
        </Typography>
        }
    </Button>
);

BreadcrumbItem.propTypes = {
    classes: PropTypes.object.isRequired,
    selectItem: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
    showLabel: PropTypes.bool.isRequired
};

export default withStyles(styles)(BreadcrumbItem);
