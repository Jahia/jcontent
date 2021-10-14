import React from 'react';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '~/JContent/JContent.utils';
import {Tooltip} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import styles from './FileName.scss';

export const FileName = ({maxLength, node}) => {
    const name = node.displayName;
    const shortenName = name.length > maxLength;

    let typography = (
        <Typography noWrap
                    component="p"
                    className={isMarkedForDeletion(node) ? styles.isDeleted : ''}
                    data-cm-role="grid-content-list-card-name"
        >
            {name}
        </Typography>
    );

    return shortenName ? (
        <Tooltip title={name} classes={{tooltip: styles.tooltip}}>
            {typography}
        </Tooltip>
    ) : typography;
};

FileName.propTypes = {
    maxLength: PropTypes.number.isRequired,
    node: PropTypes.object.isRequired
};

export default FileName;
