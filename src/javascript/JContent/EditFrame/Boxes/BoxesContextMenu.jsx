import React, {useEffect, useRef} from 'react';
import {ContextualMenu} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {useHoverContext} from '~/JContent/EditFrame/Boxes/HoverContext';

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
            // Detects element to be a breadcrumb item or list item found in dropdown menus
            const clickInBreadcrumbFooter = Boolean(event.target?.closest('[data-sel-role="pagebuilder-itempath-dropdown"]'));

            // Prevent showing contextual menu if clicked on breadcrumb, note that ctrl + click counts as right click and triggers contextmenu
            if (clickInBreadcrumbFooter) {
                event.preventDefault();
                event.stopPropagation();
                // Ignore for right click and other button + click combinations
                if (event.ctrlKey) {
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        ctrlKey: true,
                        detail: 1,
                        screenX: event.screenX,
                        screenY: event.screenY,
                        clientX: event.clientX,
                        clientY: event.clientY
                    });
                    event.target.dispatchEvent(clickEvent);
                }

                return;
            }

            // Resolve the element actually under the cursor at right-click time. Relying on the hovered
            // path is unsafe: it goes stale (e.g. when moving onto the page without a hover-out fires),
            // which used to open the menu for the wrong element or fall back to selecting the whole page.
            // The box body overlay is pointer-events:none, so event.target there is whatever shows through
            // (sometimes a page gap with no module). Inspect the whole stack under the cursor, which pierces
            // pointer-events:none, and use the topmost element resolving to a data-jahia-path (content
            // modules and their box overlays both expose it).
            const stack = Array.from(currentDocument.elementsFromPoint?.(event.clientX, event.clientY) || [event.target]);
            const targetPath = stack
                .map(element => element?.closest?.('[data-jahia-path]'))
                .find(Boolean)
                ?.getAttribute('data-jahia-path');

            // Nothing selectable under the cursor (e.g. empty area / page background): do not open a menu
            // for a stale target or fall back to the page.
            if (!targetPath) {
                event.preventDefault();
                return;
            }

            // Target the element under the cursor, mirroring the selection-aware action keys below.
            const currentSelection = selectionRef.current;
            let menuProps;
            if (currentSelection.length > 1 && currentSelection.includes(targetPath)) {
                menuProps = {path: undefined, paths: currentSelection, actionKey: 'selectedContentMenu'};
            } else if (currentSelection.includes(targetPath)) {
                menuProps = {path: targetPath, paths: undefined, actionKey: 'selectedContentMenu'};
            } else if (currentSelection.length > 0) {
                menuProps = {path: targetPath, paths: undefined, actionKey: 'notSelectedContentMenu'};
            } else {
                menuProps = {path: targetPath, paths: undefined, actionKey: 'contentItemContextActionsMenu'};
            }

            menuProps.currentPath = targetPath;
            menuProps.node = nodesRef.current?.[targetPath];

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

    let pathObject = {};
    if (selection.length > 0) {
        if (selection.includes(currentPath)) {
            pathObject = selection.length === 1 ? {path: selection[0]} : {paths: selection};
            pathObject.actionKey = 'selectedContentMenu';
        } else {
            pathObject = {path: currentPath, actionKey: 'notSelectedContentMenu'};
        }
    } else {
        pathObject = {path: currentPath, actionKey: 'contentItemContextActionsMenu'};
    }

    return (
        <ContextualMenu
            setOpenRef={contextualMenu}
            currentPath={currentPath}
            documentElement={currentDocument.documentElement}
            node={nodes?.[currentPath]}
            {...pathObject}
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
