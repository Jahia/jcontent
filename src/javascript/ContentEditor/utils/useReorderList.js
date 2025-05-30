import {useDrag, useDrop} from 'react-dnd';
import {useCallback, useRef, useState} from 'react';
import {uniqueId} from 'lodash';

export function onListIndexReorder(list, dragIndex, hoverIndex) {
    const newList = [...list]; // Create a copy of the original list
    const [draggedItem] = newList.splice(dragIndex, 1); // Remove the dragged item
    newList.splice(hoverIndex, 0, draggedItem); // Insert the dragged item at the hover position
    return newList;
}

function makeDragItems(items) {
    return items.map((item, index) => ({
        item,
        index,
        id: uniqueId()
    }));
}

function updateDragItems(items, reorderedItems) {
    return items.map((item, index) => {
        return {...reorderedItems[index], item, index};
    });
}

/**
 * Custom hook to manage the reordering of a list of items.
 * It initializes the list with drag items and provides functions to handle reordering and resetting the list.
 * @param {array} items    array of items to be reordered
 * @returns {object}    object containing the reordered items, handleReorder function, and reset function
 */
export function useReorderList(items) {
    // Note the use of serialization to detect changes in the items array
    // this is necessary to avoid unnecessary re-renders when the items array is the same, because formik values are not stable
    const itemsRef = useRef({items, serialized: JSON.stringify(items)});
    const currentItemsSerialized = JSON.stringify(items);

    const [reorderedItems, setReorderedItems] = useState(makeDragItems(items));

    const reset = useCallback(() => {
        setReorderedItems(makeDragItems(items));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentItemsSerialized]);

    const handleReorder = useCallback((dragIndex, hoverIndex) => {
        setReorderedItems(prevItems =>
            onListIndexReorder(prevItems, dragIndex, hoverIndex).map((item, index) => ({...item, index}))
        );
    }, []);

    if (currentItemsSerialized !== itemsRef.current.serialized) {
        /*
        The significance of this check is to have latest values available immediately, without an extra render
         */
        let newReorderedItems;
        if (itemsRef.current.items.length === items.length) {
            newReorderedItems = updateDragItems(items, reorderedItems);
        } else {
            newReorderedItems = makeDragItems(items);
        }

        setReorderedItems(newReorderedItems);
        itemsRef.current = {items, serialized: JSON.stringify(items)};
        return {reorderedItems: newReorderedItems, handleReorder, reset};
    }

    return {
        reorderedItems,
        handleReorder,
        reset
    };
}

/**
 * Custom hook to handle the drop event for reordering items.
 * @param {object} args    object contains the following properties:
 * @param {object} args.ref    reference to the drop target
 * @param {number} args.index    index of the item being hovered
 * @param {function} args.onReorder    function to call when the item is reordered during hover
 * @param {object} useDropArgs    additional arguments for the useDrop hook
 */
export function useReorderDrop(args, useDropArgs) {
    const hover = (item, monitor) => {
        if (!args.ref.current) {
            return;
        }

        const dragIndex = item.index;
        const hoverIndex = args.index;
        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = args.ref.current?.getBoundingClientRect();
        // Get vertical middle
        const hoverMiddleY =
            (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        // Determine mouse position
        const clientOffset = monitor.getClientOffset();
        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%
        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
            return;
        }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return;
        }

        console.log(`[useDrop] Reordering from index ${dragIndex} to index ${hoverIndex}`);

        // Time to actually perform the action
        args.onReorder(dragIndex, hoverIndex);
        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex;
    };

    return useDrop({
        ...useDropArgs,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId()
            };
        },
        hover
    });
}

/*
    * @param {object} args    object contains the following properties:
    * @param {object} args.item    item being dragged
    * @param {function} args.onDrop    function to call when the item is dropped
    * @param {function} args.onAbort    function to call when the drag is aborted
    * @param {object} useDragArgs    additional arguments for the useDrag hook
 */
export function useReorderDrag(args, useDragArgs) {
    return useDrag({
        ...useDragArgs,
        collect(monitor) {
            return {
                isDragging: monitor.isDragging()
            };
        },
        item: () => {
            return args.item;
        },
        end: (item, monitor) => {
            if (monitor.didDrop()) {
                args?.onDrop();
            } else {
                args?.onAbort();
            }
        }
    });
}
