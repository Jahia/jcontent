import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Deleted.scss';
import {isVisible, getCoords} from '~/JContent/EditFrame/EditFrame.utils';
import Status from '~/JContent/ContentRoute/ContentStatuses/Status';

function getBoundingBox(element) {
    if (!isVisible(element)) {
        return {top: 0, left: 0, width: 0, height: 0};
    }

    return getCoords(element);
}

const reposition = function (element, currentOffset, setCurrentOffset) {
    const box = getBoundingBox(element);
    if (box.top !== currentOffset.top || box.left !== currentOffset.left || box.width !== currentOffset.width || box.height !== currentOffset.height) {
        setCurrentOffset(box);
    }
};

export const Deleted = ({element, addIntervalCallback}) => {
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));

    const ref = useRef();

    useEffect(() => addIntervalCallback(() => reposition(element, currentOffset, setCurrentOffset)), [addIntervalCallback, element, currentOffset, setCurrentOffset]);
    reposition(element, currentOffset, setCurrentOffset);

    if (currentOffset.width === 0 || currentOffset.height === 0) {
        return false;
    }

    return (
        <div ref={ref}
             className={clsx(styles.root)}
             style={currentOffset}
        >
            <Status type="markedForDeletion" hasLabel={false} className={styles.badge}/>
        </div>
    );
};

Deleted.propTypes = {
    element: PropTypes.any,

    addIntervalCallback: PropTypes.func
};
