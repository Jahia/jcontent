import {useDrag, useDragLayer} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import {useEffect} from 'react';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {shallowEqual, useSelector} from 'react-redux';
import {JahiaAreasUtil} from '../JContent.utils';

const prepareRes = ({selection, path, nodeDragData}) => {
    if (!nodeDragData || !nodeDragData.nodes) {
        return {checksResult: false, node: null, nodes: null};
    }

    if (selection && selection.length > 0) {
        return selection.reduce((acc, cur) => {
            const nodeResult = nodeDragData?.nodes?.[cur];
            acc.checksResult = acc.checksResult && nodeResult?.checksResult;
            acc.nodes.push(nodeResult);
            return acc;
        }, {checkResults: true, nodes: []});
    }

    return [path].reduce((acc, cur) => {
        const nodeResult = nodeDragData?.nodes?.[cur];
        acc.checksResult = acc.checksResult && nodeResult?.checksResult;
        acc.node = nodeResult;
        return acc;
    }, {checksResult: true, node: null});
};

export function useNodeDragPB({dragSource, nodeDragData}) { // NOSONAR
    const {selection} = useSelector(state => ({
        selection: state.jcontent.selection
    }), shallowEqual);
    const isAnythingDragging = useDragLayer(monitor => monitor.isDragging());

    const res = prepareRes({selection, path: dragSource.path, nodeDragData});
    // Console.log('useNodeDrag', res);

    const isDraggable = Boolean(res.checksResult) && !JahiaAreasUtil.isJahiaArea(dragSource?.path);
    const [props, drag, dragPreview] = useDrag(() => selection.length === 0 ? ({
        type: 'node',
        item: dragSource,
        isDraggable,
        canDrag: () => isDraggable && !res.node?.lockOwner,
        collect: monitor => ({
            dragging: monitor.isDragging(),
            isDraggable,
            isCanDrag: isDraggable && !res.node?.lockOwner
        })
    }) : ({
        type: 'nodes',
        item: res.nodes,
        canDrag: () => res.checksResult && !JahiaAreasUtil.isJahiaArea(dragSource?.path) && !res.nodes?.some(n => n.lockOwner) && selection.indexOf(dragSource.path) > -1,
        collect: monitor => ({
            dragClasses: monitor.isDragging() ? [styles.drag] : []
        })
    }), [dragSource, selection, res]);

    useEffect(() => {
        dragPreview(getEmptyImage(), {captureDraggingState: true});
    }, [dragPreview]);

    const enhancedProps = (isAnythingDragging && selection.indexOf(dragSource?.path) > -1 && props.dragClasses.length === 0) ? {
        ...props,
        isAnythingDragging,
        dragClasses: styles.drag
    } : {...props, isAnythingDragging};

    return [enhancedProps, drag];
}
