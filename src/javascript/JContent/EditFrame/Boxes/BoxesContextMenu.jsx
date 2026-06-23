import React, {useEffect, useRef} from 'react';
import {ContextualMenu} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {useHoverContext} from '~/JContent/EditFrame/Boxes/HoverContext';

// Right-clicks on a breadcrumb/dropdown item are handled specially (and never open the content menu).
// Returns true when the event was a breadcrumb click and has been handled.
const handleBreadcrumbFooter = event => {
    if (!event.target?.closest('[data-sel-role="pagebuilder-itempath-dropdown"]')) {
        return false;
    }

    event.preventDefault();
    event.stopPropagation();
    // Ctrl + click counts as a right click and triggers contextmenu; forward it as a real click.
    if (event.ctrlKey) {
        event.target.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            ctrlKey: true,
            detail: 1,
            screenX: event.screenX,
            screenY: event.screenY,
            clientX: event.clientX,
            clientY: event.clientY
        }));
    }

    return true;
};

// Resolve the element actually under the cursor at right-click time. Relying on the hovered path is
// unsafe: it goes stale (e.g. when moving onto the page without a hover-out firing), which used to open
// the menu for the wrong element or fall back to selecting the whole page. The box body overlay is
// pointer-events:none, so event.target there is whatever shows through (sometimes a page gap with no
// module). Inspecting the whole stack under the cursor pierces pointer-events:none, and the topmost
// element resolving to a data-jahia-path wins (content modules and their box overlays both expose it).
const resolveTargetPath = (frameDocument, event) => {
    const stack = Array.from(frameDocument.elementsFromPoint?.(event.clientX, event.clientY) ?? [event.target]);
    return stack
        .map(element => element?.closest?.('[data-jahia-path]'))
        .find(Boolean)
        ?.getAttribute('data-jahia-path');
};

// Build the ContextualMenu target props for a given path, honoring the current selection.
const buildMenuProps = (targetPath, selection, nodes) => {
    const node = nodes?.[targetPath];
    if (selection.length > 0 && selection.includes(targetPath)) {
        const scope = selection.length === 1 ? {path: selection[0], paths: undefined} : {path: undefined, paths: selection};
        return {...scope, actionKey: 'selectedContentMenu', currentPath: targetPath, node};
    }

    const actionKey = selection.length > 0 ? 'notSelectedContentMenu' : 'contentItemContextActionsMenu';
    return {path: targetPath, paths: undefined, actionKey, currentPath: targetPath, node};
};

/**
 * @deprecated since version 3.4.0 https://github.com/Jahia/jcontent/pull/1879
 * This component will be removed in version 4.0.0.
 * @component
 * @param {Object} props Component props
 * @param {Object} props.currentFrameRef Reference to the current frame
 * @param {Object} props.currentDocument Current document object
 * @param {string} props.currentHoveredRef Current content path
 * @param {string[]} props.selection Array of selected paths
 */
const BoxesContextMenu = ({currentFrameRef, currentDocument, selection, nodes}) => {
    const contextualMenu = useRef();
    const {hoveredPath: currentPath} = useHoverContext();

    // The contextmenu listener below is registered once and is long-lived, so it would otherwise
    // capture stale values. Mirror the latest selection/nodes into refs so the handler reads fresh data.
    const selectionRef = useRef(selection);
    selectionRef.current = selection;
    const nodesRef = useRef(nodes);
    nodesRef.current = nodes;

    useEffect(() => {
        currentDocument.documentElement.querySelector('body').addEventListener('contextmenu', event => {
            if (handleBreadcrumbFooter(event)) {
                return;
            }

            const targetPath = resolveTargetPath(currentDocument, event);

            // Nothing selectable under the cursor (e.g. empty area / page background): do not open a menu
            // for a stale target or fall back to the page.
            if (!targetPath) {
                event.preventDefault();
                return;
            }

            const menuProps = buildMenuProps(targetPath, selectionRef.current, nodesRef.current);

            // Show context menu for the resolved target
            const rect = currentFrameRef.current.getBoundingClientRect();
            const dup = new MouseEvent(event.type, {
                ...event,
                clientX: event.clientX + rect.x,
                clientY: event.clientY + rect.y
            });
            contextualMenu.current(dup, menuProps);
            event.preventDefault();
        });
    }, [currentDocument, currentFrameRef]);

    return (
        <ContextualMenu
            setOpenRef={contextualMenu}
            documentElement={currentDocument.documentElement}
            {...buildMenuProps(currentPath, selection, nodes)}
        />
    );
};

BoxesContextMenu.propTypes = {
    currentDocument: PropTypes.any,
    currentFrameRef: PropTypes.any,
    currentPath: PropTypes.string,
    nodes: PropTypes.object,
    selection: PropTypes.arrayOf(PropTypes.string)
};

export default BoxesContextMenu;
