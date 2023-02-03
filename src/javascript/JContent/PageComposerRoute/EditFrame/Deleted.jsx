import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Deleted.scss';
import {Delete, Typography} from '@jahia/moonstone';

export const Deleted = ({element}) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;

    const ref = useRef();

    const currentOffset = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
    };

    const iconWidth = Math.min(currentOffset.width / 3, 64) + 'px';
    const iconHeight = Math.min(currentOffset.height / 3, 64) + 'px';

    const showLabel = currentOffset.width > 250 && currentOffset.height > 120;

    return (
        <>
            <div ref={ref}
                 className={clsx(styles.root)}
                 style={currentOffset}
            >
                <div className={styles.label}>
                    <Delete size="big" style={{width: iconWidth, height: iconHeight}}/>
                    {showLabel && <Typography variant="subheading" weight="bold">DELETED</Typography>}
                </div>
            </div>
        </>
    );
};

Deleted.propTypes = {
    element: PropTypes.any
};
