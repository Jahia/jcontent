/**
 * The overlays live in the frame's document, while menus, popovers and the drag layer live in the
 * host's. These convert a position from the frame's viewport to the host's viewport.
 */
export const getFrameOffset = frameElement => {
    const {x, y} = frameElement.getBoundingClientRect();
    return {x, y};
};

export const toHostRect = (rect, frameElement) => {
    const {x, y} = getFrameOffset(frameElement);
    return new DOMRect(rect.x + x, rect.y + y, rect.width, rect.height);
};

export const toHostMouseEvent = (event, frameElement) => {
    const {x, y} = getFrameOffset(frameElement);
    return new MouseEvent(event.type, {
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        button: event.button,
        buttons: event.buttons,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        screenX: event.screenX,
        screenY: event.screenY,
        clientX: event.clientX + x,
        clientY: event.clientY + y
    });
};
