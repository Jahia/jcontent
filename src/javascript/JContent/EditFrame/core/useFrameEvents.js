import {useEffect, useRef} from 'react';

/**
 * What a pointer event in the frame landed on. The page's own modules carry jahiatype="module";
 * the overlays that stand for a module (its header, its footer, its create buttons) point back to
 * it. Returns null when the event landed on no module.
 *
 * `isInteractive` tells which modules have a box. A module without one, such as a placeholder or a
 * content the editor cannot edit, hands the event to the nearest module above it that has one.
 */
export const resolveTarget = (doc, target, isInteractive) => {
    const marked = target?.closest?.('[jahiatype]');
    if (!marked) {
        return null;
    }

    const kind = marked.getAttribute('jahiatype');
    let element;
    if (kind === 'createbuttons') {
        if (marked.dataset.insertionPoint) {
            return {kind: 'insertionPoint'};
        }

        element = doc.getElementById(marked.dataset.jahiaParent);
    } else if (kind === 'header' || kind === 'footer') {
        element = doc.getElementById(marked.dataset.jahiaId);
    } else {
        element = marked.closest('[jahiatype=module]');
    }

    while (element && !isInteractive(element)) {
        element = element.parentElement?.closest('[jahiatype=module]');
    }

    return element ? {kind, element, path: element.getAttribute('path')} : null;
};

const EVENT_TYPES = {
    mouseover: 'onPointerOver',
    click: 'onClick',
    dblclick: 'onDoubleClick',
    contextmenu: 'onContextMenu',
    keydown: 'onKeyDown'
};

/**
 * The one place the page builder listens to the frame. Each event is resolved to its module once,
 * then handed to `handlers[name](event, hit)`. The handlers are read at event time, so they can
 * change on every render without the listeners being bound again.
 */
export const useFrameEvents = (doc, isInteractive, handlers) => {
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;
    const isInteractiveRef = useRef(isInteractive);
    isInteractiveRef.current = isInteractive;

    useEffect(() => {
        if (!doc) {
            return undefined;
        }

        const listeners = Object.entries(EVENT_TYPES).map(([type, name]) => [type, event => {
            const hit = type === 'keydown' ? null : resolveTarget(doc, event.target, isInteractiveRef.current);
            handlersRef.current[name]?.(event, hit);
        }]);

        listeners.forEach(([type, listener]) => doc.addEventListener(type, listener));
        return () => listeners.forEach(([type, listener]) => doc.removeEventListener(type, listener));
    }, [doc]);
};
