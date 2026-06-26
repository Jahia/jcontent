import {useResizeWatcher} from '../useResizeWatcher';
import styles from './TwoPanelsContent.scss';
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

        const syncScroll = (source, target) => {
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

    // Only needed in synced-scroll mode: both columns share a single scrollbar, so each field on the
    // right must line up vertically with its counterpart on the left. useResizeWatcher matches the
    // heights of paired fields across columns to keep them aligned. When the columns scroll
    // independently (e.g. the Edit tab with a side panel) there is nothing to align, so we skip it.

    useResizeWatcher({columnSelector: hasSingleSyncedScrollbar ? 'right-column' : null});

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
