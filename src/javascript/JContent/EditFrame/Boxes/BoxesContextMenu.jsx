import React, {useEffect, useRef} from 'react';
import {ContextualMenu} from '@jahia/ui-extender';
import PropTypes from 'prop-types';

const BoxesContextMenu = ({currentFrameRef, currentDocument, currentPath, selection}) => {
    const contextualMenu = useRef();

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

            // Show context menu
            const rect = currentFrameRef.current.getBoundingClientRect();
            const dup = new MouseEvent(event.type, {
                ...event,
                clientX: event.clientX + rect.x,
                clientY: event.clientY + rect.y
            });
            contextualMenu.current(dup);
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
            {...pathObject}
        />
    );
};

BoxesContextMenu.propTypes = {
    currentDocument: PropTypes.any,
    currentFrameRef: PropTypes.any,
    currentPath: PropTypes.string,
    selection: PropTypes.arrayOf(PropTypes.string)
};

export default BoxesContextMenu;
