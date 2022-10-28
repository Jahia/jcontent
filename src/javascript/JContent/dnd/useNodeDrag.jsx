import {useDrag, useDragLayer} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import {useEffect} from 'react';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {useSelector} from 'react-redux';

export function useNodeDrag({dragSource, ref}) {
    const selection = useSelector(state => state.jcontent.selection);
    const isAnythingDragging = useDragLayer(monitor => monitor.isDragging());

    const [props, drag, dragPreview] = useDrag(() => selection.length === 0 ? ({
        type: 'node',
        item: dragSource,
        collect: monitor => ({
            dragging: monitor.isDragging()
        })
    }) : ({
        type: 'paths',
        item: selection,
        canDrag: () => selection.indexOf(dragSource.path) > -1,
        collect: monitor => ({
            dragClasses: monitor.isDragging() ? [styles.drag] : []
        })
    }), [dragSource, selection]);

    useEffect(() => {
        dragPreview(getEmptyImage(), {captureDraggingState: true});
    }, [dragPreview]);

    const enhancedProps = (isAnythingDragging && selection.indexOf(dragSource.path) > -1 && props.dragClasses.length === 0) ? {
        ...props,
        dragClasses: styles.drag
    } : props;

    if (ref) {
        drag(ref);
    }

    return enhancedProps;
}
