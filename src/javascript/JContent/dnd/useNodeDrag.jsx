import {useDrag} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import {useEffect} from 'react';
import {getEmptyImage} from 'react-dnd-html5-backend';

export function useNodeDrag(node) {
    const [props, drag, dragPreview] = useDrag(() => ({
        type: 'node',
        item: node,
        collect: monitor => ({
            dragClasses: monitor.isDragging() ? [styles.drag] : []
        })
    }), [node]);

    useEffect(() => {
        dragPreview(getEmptyImage(), {captureDraggingState: true});
    }, [dragPreview]);

    return [props, drag];
}
