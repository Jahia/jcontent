import {useDrag, useDragLayer} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import {useEffect} from 'react';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {useSelector} from 'react-redux';

export function useNodeDrag(node) {
    const selection = useSelector(state => state.jcontent.selection);
    const isAnythingDragging = useDragLayer(monitor => monitor.isDragging());

    const [props, drag, dragPreview] = useDrag(() => selection.length === 0 ? ({
        type: 'node',
        item: node,
        collect: monitor => ({
            dragClasses: monitor.isDragging() ? [styles.drag] : []
        })
    }) : ({
        type: 'paths',
        item: selection,
        canDrag: () => selection.indexOf(node.path) > -1,
        collect: monitor => ({
            dragClasses: monitor.isDragging() ? [styles.drag] : []
        })
    }), [node, selection]);

    useEffect(() => {
        dragPreview(getEmptyImage(), {captureDraggingState: true});
    }, [dragPreview]);

    if (isAnythingDragging && selection.indexOf(node.path) > -1 && props.dragClasses.length === 0) {
        return [{
            ...props,
            dragClasses: styles.drag
        }, drag];
    }

    return [props, drag];
}
