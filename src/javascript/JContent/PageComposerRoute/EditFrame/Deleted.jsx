import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './Deleted.scss';
import {Delete, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

function getBoundingBox(element) {
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;
    const box = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
    };
    return box;
}

export const Deleted = ({element}) => {
    const {t} = useTranslation('jcontent');
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));

    const ref = useRef();

    useEffect(() => {
        const interval = setInterval(() => {
            const box = getBoundingBox(element);
            if (box.top !== currentOffset.top || box.left !== currentOffset.left || box.width !== currentOffset.width || box.height !== currentOffset.height) {
                setCurrentOffset(box);
            }
        }, 100);
        return () => {
            clearInterval(interval);
        };
    }, [currentOffset, element]);

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
                    {showLabel && <Typography variant="subheading" weight="bold">{t('label.contentManager.contentStatus.deleted')}</Typography>}
                </div>
            </div>
        </>
    );
};

Deleted.propTypes = {
    element: PropTypes.any
};
