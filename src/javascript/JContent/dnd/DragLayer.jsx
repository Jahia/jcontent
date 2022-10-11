import React from 'react';
import {useDragLayer} from 'react-dnd';
import {Collections, Typography} from '@jahia/moonstone';
import {NodeIcon} from '~/utils';
import styles from './DragLayer.scss';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

function getItemStyles(clientOffset) {
    if (!clientOffset) {
        return {
            display: 'none'
        };
    }

    const x = clientOffset.x;
    const y = clientOffset.y;

    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform
    };
}

export const DragLayer = () => {
    const {t} = useTranslation('jcontent');
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
            case 'paths':
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
            <div className={clsx('flexRow_nowrap', 'alignCenter', styles.box)} style={getItemStyles(clientOffset)}>
                {renderItem()}
            </div>
        </div>
    );
};
