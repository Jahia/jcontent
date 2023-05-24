import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Deleted.scss';
import {Delete, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {isVisible, getCoords} from '~/JContent/PageComposerRoute/EditFrame/EditFrame.utils';

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
    const {t} = useTranslation('jcontent');
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));

    const ref = useRef();

    useEffect(() => addIntervalCallback(() => reposition(element, currentOffset, setCurrentOffset)), [addIntervalCallback, element, currentOffset, setCurrentOffset]);
    reposition(element, currentOffset, setCurrentOffset);

    if (currentOffset.width === 0 || currentOffset.height === 0) {
        return false;
    }

    const iconWidth = Math.min(currentOffset.width / 3, 64) + 'px';
    const iconHeight = Math.min(currentOffset.height / 3, 64) + 'px';

    const showLabel = currentOffset.width > 250 && currentOffset.height > 120;

    return (
        <div ref={ref}
             className={clsx(styles.root)}
             style={currentOffset}
        >
            <div className={styles.label}>
                <Delete size="big" style={{width: iconWidth, height: iconHeight}}/>
                {showLabel && <Typography variant="subheading" weight="bold">{t('label.contentManager.contentStatus.deleted')}</Typography>}
            </div>
        </div>
    );
};

Deleted.propTypes = {
    element: PropTypes.any,

    addIntervalCallback: PropTypes.func
};
