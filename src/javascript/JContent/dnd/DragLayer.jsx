import React from 'react';
import {useDragLayer} from 'react-dnd';
import {Typography} from '@jahia/moonstone';
import {NodeIcon} from '~/utils';
import styles from './DragLayer.scss';
import clsx from 'clsx';

const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
};

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
            default:
                return null;
        }
    }

    if (!isDragging) {
        return null;
    }

    return (
        <div style={layerStyles}>
            <div className={clsx('flexRow_nowrap', 'alignCenter', styles.box)} style={getItemStyles(clientOffset)}>
                {renderItem()}
            </div>
        </div>
    );
};
