import {useSyncScroll} from '../useSyncScroll';
import {useResizeWatcher} from '../useResizeWatcher';
import styles from '../styles.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';

export const TwoPanelsContent = ({leftCol, rightCol}) => {
    const {leftColRef, rightColRef} = useSyncScroll();
    useResizeWatcher({columnSelector: 'right-column'});

    return (
        <div className={styles.twoColumnsRoot}>
            <div ref={leftColRef} className={clsx(styles.col, styles.hideScrollbar)} data-sel-role="left-column">
                {leftCol}
            </div>
            <div ref={rightColRef} className={styles.col} data-sel-role="right-column">
                {rightCol}
            </div>
        </div>
    );
};

TwoPanelsContent.propTypes = {
    leftCol: PropTypes.node,
    rightCol: PropTypes.node
};
