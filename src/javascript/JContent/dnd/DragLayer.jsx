import React, {useEffect, useState} from 'react';
import {useDragDropManager, useDragLayer} from 'react-dnd';
import {Collections, Typography} from '@jahia/moonstone';
import {NodeIcon} from '~/utils';
import styles from './DragLayer.scss';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

function getItemStyles(clientOffset, additionalOffset) {
    if (!clientOffset) {
        return {
            display: 'none'
        };
    }

    const x = clientOffset.x + additionalOffset.x;
    const y = clientOffset.y + additionalOffset.y;

    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform
    };
}

export const DragLayer = () => {
    const {t} = useTranslation('jcontent');
    const [additionalOffset, setAdditionalOffset] = useState({x: 0, y: 0});
    const manager = useDragDropManager();

    manager.additionalOffset = additionalOffset;
    manager.setAdditionalOffset = setAdditionalOffset;

    useEffect(() => {
        if (additionalOffset.x !== 0 || additionalOffset.y !== 0) {
            const listener = () => setAdditionalOffset({x: 0, y: 0});
            window.document.documentElement.addEventListener('dragover', listener);
            return () => {
                window.document.documentElement.removeEventListener('dragover', listener);
            };
        }
    }, [setAdditionalOffset, additionalOffset]);

    const {itemType, isDragging, item, clientOffset} =
        useDragLayer(monitor => ({
            item: monitor.getItem(),
            itemType: monitor.getItemType(),
            initialOffset: monitor.getInitialSourceClientOffset(),
            currentOffset: monitor.getSourceClientOffset(),
            clientOffset: monitor.getClientOffset(),
            isDragging: monitor.isDragging()
        }));

    function renderItem() {
        switch (itemType) {
            case 'node':
                return item && (
                    <>
                        <div>
                            <NodeIcon node={item} className={styles.icon}/>
                        </div>
                        <Typography isNowrap>
                            {item.displayName}
                        </Typography>
                    </>
                );
            case 'nodes':
                return (
                    <>
                        <div>
                            <Collections className={styles.icon}/>
                        </div>
                        <Typography isNowrap>
                            {t('label.contentManager.selection.itemsSelected', {count: item.length})}
                        </Typography>
                    </>
                );
            default:
                return null;
        }
    }

    if (!isDragging) {
        return null;
    }

    return (
        <div className={styles.layer}>
            <div className={clsx('flexRow_nowrap', 'alignCenter', styles.box)} style={getItemStyles(clientOffset, additionalOffset)}>
                {renderItem()}
            </div>
        </div>
    );
};
