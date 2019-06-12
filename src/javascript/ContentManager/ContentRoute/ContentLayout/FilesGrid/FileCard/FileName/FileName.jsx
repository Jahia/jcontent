import React from 'react';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../../../../../ContentManager.utils';
import {Tooltip, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';

const styles = () => ({
    isDeleted: {
        textDecoration: 'line-through'
    },
    tooltip: {
        display: 'unset'
    }
});

export const FileName = ({maxLength, classes, node}) => {
    const name = node.displayName;
    const shortenName = name.length > maxLength;

    let typography = (
        <Typography noWrap
                    component="p"
                    className={isMarkedForDeletion(node) ? classes.isDeleted : ''}
                    variant="iota"
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

FileName.propTypes = {
    classes: PropTypes.object.isRequired,
    maxLength: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired
};

export default withStyles(styles)(FileName);
