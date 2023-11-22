import React from 'react';
import {useDragLayer} from 'react-dnd';
import PropTypes from 'prop-types';
import styles from './Box.scss';
import clsx from 'clsx';
import {DropArea} from './DropArea';
import {Insert} from './Insert';

export const DndOverlays = ({currentDndInfo}) => {
    const {isDragging} = useDragLayer(monitor => ({
        clientOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging()
    }));

    if (!isDragging) {
        return null;
    }

    const {draggedOverlayPosition, dropTarget, relative} = currentDndInfo.current;

    return (
        <>
            {draggedOverlayPosition && <div className={clsx(styles.root, styles.draggedOverlay)} style={draggedOverlayPosition}/>}
            {dropTarget && <DropArea dropTarget={dropTarget}/>}
            {dropTarget && relative && <Insert relative={relative}/>}
        </>
    );
};

DndOverlays.propTypes = {
    currentDndInfo: PropTypes.object
};
