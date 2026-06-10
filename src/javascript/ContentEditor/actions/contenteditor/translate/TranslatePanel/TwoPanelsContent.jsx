import {useResizeWatcher} from '../useResizeWatcher';
import styles from '../styles.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';

export const TwoPanelsContent = ({
    leftCol,
    rightCol,
    hasSingleSyncedScrollbar = false
}) => {
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);
    const isSyncing = useRef(false);

    useEffect(() => {
        if (!leftColRef.current || !rightColRef.current || !hasSingleSyncedScrollbar) {
            return;
        }

        const leftCol = leftColRef.current;
        const rightCol = rightColRef.current;

        console.log(leftCol, rightCol);

        const syncScroll = (source, target) => {
            console.log(leftCol.scrollTop, rightCol.scrollTop, isSyncing.current);
            if (isSyncing.current) {
                return;
            }

            isSyncing.current = true;
            target.scrollTop = source.scrollTop;
            requestAnimationFrame(() => {
                isSyncing.current = false;
            });
        };

        const handleLeftScroll = () => syncScroll(leftCol, rightCol);
        const handleRightScroll = () => syncScroll(rightCol, leftCol);

        leftCol.addEventListener('scroll', handleLeftScroll);
        rightCol.addEventListener('scroll', handleRightScroll);

        return () => {
            leftCol.removeEventListener('scroll', handleLeftScroll);
            rightCol.removeEventListener('scroll', handleRightScroll);
        };
    }, [hasSingleSyncedScrollbar]);

    useResizeWatcher({columnSelector: 'right-column'});

    return (
        <div className={styles.twoColumnsRoot}>
            <div
                ref={leftColRef}
                className={clsx(styles.col, hasSingleSyncedScrollbar && styles.hideScrollbar)}
                data-sel-role="left-column"
            >
                {leftCol}
            </div>
            <div
                ref={rightColRef}
                className={styles.col}
                data-sel-role="right-column"
            >
                {rightCol}
            </div>
        </div>
    );
};

TwoPanelsContent.propTypes = {
    leftCol: PropTypes.node,
    rightCol: PropTypes.node,
    hasSingleSyncedScrollbar: PropTypes.bool
};
