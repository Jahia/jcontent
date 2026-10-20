import {getFrameOffset} from './frameCoords';

/**
 * Connects the frame's window to the react-dnd HTML5 backend, which only listens on the host
 * window. It also tells the drag layer how far the frame is offset, and ends a drag that the
 * browser lost, which happens when the button is released outside the window. Returns a function
 * that disconnects it.
 */
export const bindFrameDnd = (win, manager, frameElement) => {
    const {backend, monitor} = manager;

    const endLostDrag = event => {
        backend.handleTopDragEndCapture(event);
        if (monitor.isDragging()) {
            manager.getActions()?.endDrag();
        }
    };

    const listeners = [
        ['dragover', () => {
            const offset = getFrameOffset(frameElement);
            if (manager.additionalOffset?.x !== offset.x || manager.additionalOffset?.y !== offset.y) {
                manager.setAdditionalOffset?.(offset);
            }
        }],
        ['dragstart', backend.handleTopDragStart],
        ['dragstart', backend.handleTopDragStartCapture, true],
        ['dragend', backend.handleTopDragEndCapture, true],
        ['dragenter', backend.handleTopDragEnter],
        ['dragenter', backend.handleTopDragEnterCapture, true],
        ['dragleave', backend.handleTopDragLeaveCapture, true],
        ['dragover', backend.handleTopDragOver],
        ['dragover', backend.handleTopDragOverCapture, true],
        ['drop', backend.handleTopDrop],
        ['drop', backend.handleTopDropCapture, true],
        ['mouseup', event => {
            if (monitor.isDragging()) {
                console.debug('Mouse up event happened while monitor is still dragging, cancelling previous DND operation', event);
                endLostDrag(event);
            }
        }],
        ['mousemove', event => {
            if (monitor.isDragging() && event.buttons === 0) {
                console.debug('Mouse move event happened while monitor is still dragging, cancelling previous DND operation', event);
                endLostDrag(event);
            }
        }]
    ];

    listeners.forEach(([type, listener, capture]) => win.addEventListener(type, listener, Boolean(capture)));
    return () => listeners.forEach(([type, listener, capture]) => win.removeEventListener(type, listener, Boolean(capture)));
};
