import React from 'react';
import {isMarkedForDeletion} from '../../../../ContentManager.utils';
import {Tooltip, Typography, withStyles} from '@material-ui/core';

const styles = () => ({
    isDeleted: {
        textDecoration: 'line-through'
    },
    tooltip: {
        display: 'unset'
    }
});

export const FileName = ({maxLength, classes, node}) => {
    const name = node.name;
    const shortenName = name.length > maxLength;

    let typography = (
        <Typography noWrap
                    component="p"
                    color="textSecondary"
                    className={isMarkedForDeletion(node) ? classes.isDeleted : ''}
                    variant="body2"
                    data-cm-role="grid-content-list-card-name"
        >
            {name}
        </Typography>
    );

    return shortenName ? (
        <Tooltip title={name} classes={{tooltip: classes.tooltip}}>
            {typography}
        </Tooltip>
    ) : typography;
};

export default withStyles(styles)(FileName);
