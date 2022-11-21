import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Deleted.scss';
import {Typography} from '@jahia/moonstone';

export const Deleted = ({element}) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;

    const currentOffset = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
    };
    return (
        <>
            <div className={clsx(styles.root)}
                 style={currentOffset}
            >
                <Typography className={styles.typo} variant="heading">DELETED</Typography>
            </div>
        </>
    );
};

Deleted.propTypes = {
    element: PropTypes.any
};
