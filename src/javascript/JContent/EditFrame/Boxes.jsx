import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ContextualMenu} from '@jahia/ui-extender';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Box} from './Box';
import {Create} from './Create';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {BoxesQuery} from '~/JContent/EditFrame/Boxes.gql-queries';
import {hasMixin, isDescendant, isDescendantOrSelf, isMarkedForDeletion} from '~/JContent/JContent.utils';
import {cmAddSelection, cmClearSelection, cmRemoveSelection} from '../redux/selection.redux';
import {batchActions} from 'redux-batched-actions';
import {findAvailableBoxConfig, pathExistsInTree} from '../JContent.utils';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {TableViewModeChangeTracker} from '~/JContent/ContentRoute/ToolBar/ViewModeSelector/tableViewChangeTracker';
import {getBoundingBox} from './EditFrame.utils';
import InsertionPoints from './InsertionPoints';

const getModuleElement = (currentDocument, target) => {
    let element = target;

    if (element && !element.getAttribute('jahiatype')) {
        element = element.closest('[jahiatype]');
    }

    if (element && element.getAttribute('jahiatype') === 'createbuttons') {
        element = currentDocument.getElementById(element.dataset.jahiaParent);
    } else if (element?.dataset?.jahiaId) {
        element = currentDocument.getElementById(element.dataset.jahiaId);
    }

    return element;
};

const disallowSelection = element => {
    const tags = ['A', 'BUTTON'];

    return tags.includes(element.tagName) || element.closest('a') !== null || element.ownerDocument.getSelection().type === 'Range';
};

let timeout;

const elementIsInBreadcrumbFooter = element => {
    // Detects element to be a breadcrumb item or list item found in dropdown menus
    return element.closest('[data-sel-role="pagebuilder-breadcrumb"]') !== null || element.closest('.moonstone-listItem') !== null;
};

const checkClickInBreadcrumbFooter = event => {
    const element = event.target;
    return element && elementIsInBreadcrumbFooter(element);
};

function getRelativePos(coord1, coord2) {
    if (!coord1 || !coord2) {
        return '';
    }

    const offPX = coord2?.x - coord1?.x;
    const offPY = coord2?.y - coord1?.y;
    if (offPY === 0 && offPX !== 0) {
        return (offPX > 0) ? 'right' : 'left';
    }

    return (offPY >= 0) ? 'bottom' : 'top';
}

export const Boxes = ({currentDocument, currentFrameRef, currentDndInfo, addIntervalCallback, onSaved, clickedElement, setClickedElement}) => {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const dispatch = useDispatch();

    const language = useSelector(state => state.language);
    const path = useSelector(state => state.jcontent.path);
    const selection = useSelector(state => state.jcontent.selection, shallowEqual);
    const site = useSelector(state => state.site);
    const uilang = useSelector(state => state.uilang);

    // This is currently moused over element, it changes as mouse is moved even in multiple selection situation.
    // It helps determine box visibility and header visibility.
    const [currentElement, setCurrentElement] = useState();
    const [placeholders, setPlaceholders] = useState([]);
    const [modules, setModules] = useState([]);

    const onMouseOver = useCallback(event => {
        event.stopPropagation();
        const target = event.currentTarget;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            const moduleElement = getModuleElement(currentDocument, target);
            setCurrentElement(() => ({element: moduleElement, path: moduleElement.getAttribute('path')}));
        }, 10);
    }, [setCurrentElement, currentDocument]);

    const onMouseOut = useCallback(event => {
        event.stopPropagation();
        if (event.relatedTarget && event.currentTarget.dataset.current === 'true' &&
            !isDescendantOrSelf(
                getModuleElement(currentDocument, event.relatedTarget)?.getAttribute('path'),
                getModuleElement(currentDocument, event.currentTarget)?.getAttribute?.('path')
            ) &&
            !event.target.closest('#menuHolder')
        ) {
            window.clearTimeout(timeout);
            setCurrentElement(null);
        }
    }, [setCurrentElement, currentDocument]);

    const onSelect = useCallback((event, _path) => {
        const element = getModuleElement(currentDocument, event.currentTarget);
        _path = _path || element.getAttribute('path');
        const isSelected = selection.includes(_path);

        // Do not handle selection if the target element can be interacted with
        if (disallowSelection(event.target)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        if (isSelected) {
            dispatch(cmRemoveSelection(_path));
        } else if (!selection.some(selectionElement => isDescendant(_path, selectionElement))) {
            // Ok so no parent is already selected we can add ourselves
            const actions = [];
            actions.push(cmAddSelection(_path));
            // Now we need to remove children if there was any selected as we do not allow multiple selection of parent/children
            selection.filter(selectionElement => isDescendant(selectionElement, _path)).forEach(selectedChild => actions.push(cmRemoveSelection(selectedChild)));
            dispatch(batchActions(actions));
        }
    }, [selection, currentDocument, dispatch]);

    const onClick = useCallback(event => {
        const isMultipleSelectionMode = event.metaKey || event.ctrlKey;
        if (event.detail === 1) {
            // Do not handle selection if the target element can be interacted with
            if (disallowSelection(event.target) && !isMultipleSelectionMode) {
                return undefined;
            }

            event.preventDefault();
            event.stopPropagation();
            const target = event.currentTarget;
            const moduleElement = getModuleElement(currentDocument, target);
            const path = moduleElement.getAttribute('path');

            if (isMultipleSelectionMode) {
                // Previously clicked element is added to selection if not ancestor and "unclicked"
                if (clickedElement && !isDescendant(path, clickedElement.path)) {
                    const e = {
                        currentTarget: clickedElement.element,
                        target: clickedElement.element,
                        preventDefault: () => {},
                        stopPropagation: () => {}
                    };
                    onSelect(e);
                }

                setClickedElement(undefined);

                onSelect(event);
            } else {
                if (selection.length > 0) {
                    dispatch(cmClearSelection());
                }

                if (clickedElement && clickedElement.path === path) {
                    setClickedElement(undefined);
                } else {
                    setClickedElement(() => ({element: moduleElement, path: path}));
                }
            }
        } else if (event.detail === 2) {
            event.preventDefault();
            event.stopPropagation();
        }

        return false;
    }, [onSelect, currentDocument, clickedElement, setClickedElement, dispatch, selection]);

    const clearSelection = useCallback(event => {
        if (selection.length === 1 && !event.defaultPrevented) {
            dispatch(cmClearSelection());
        }
    }, [selection, dispatch]);

    const rootElement = useRef();
    const contextualMenu = useRef();
    const handleKeyboardNavigation = useCallback(event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            dispatch(cmClearSelection());
        }
    }, [dispatch]);
    // Clear selection when clicking outside any module or if pressing escape key
    useEffect(() => {
        currentDocument.addEventListener('click', clearSelection);
        currentDocument.addEventListener('keydown', handleKeyboardNavigation);
        return () => {
            currentDocument.removeEventListener('click', clearSelection);
            currentDocument.removeEventListener('keydown', handleKeyboardNavigation);
        };
    }, [selection, dispatch, currentDocument, clearSelection, handleKeyboardNavigation]);

    useEffect(() => {
        const _placeholders = [];
        currentDocument.querySelectorAll('[jahiatype=module]').forEach(element => {
            element.style['pointer-events'] = 'all';
            let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);

            if (!parent) {
                parent = element.parentElement?.closest?.('[jahiatype=module]');

                if (parent) {
                    element.dataset.jahiaParent = parent.id;
                }
            }

            if (element.getAttribute('path') === '*' || element.getAttribute('type') === 'placeholder') {
                _placeholders.push(element);

                if (!parent) {
                    console.warn('Couldn\'t find parent element with jahiatype=module for element ', element);
                    _placeholders.pop();
                }
            }
        });

        currentDocument.querySelectorAll('[jahiatype=module]').forEach(element => {
            const parentId = element.id;
            const children = [...currentDocument.querySelectorAll(`[data-jahia-parent=${parentId}]`)];
            const coords = children.map(m => m.getBoundingClientRect());
            for (let i = 0; i < children.length; i++) {
                children[i].dataset.prevPos = getRelativePos(coords[i], coords[i - 1]) || 'top';
                children[i].dataset.nextPos = getRelativePos(coords[i], coords[i + 1]) || 'bottom';
            }
        });

        currentDocument.querySelectorAll('[jahiatype=mainmodule]').forEach(element => {
            element.style['pointer-events'] = 'none';
        });

        currentDocument.querySelectorAll('a').forEach(element => {
            element.style['pointer-events'] = 'all';
        });

        currentDocument.querySelectorAll('button').forEach(element => {
            element.style['pointer-events'] = 'all';
        });

        setPlaceholders(_placeholders);

        const _modules = [];

        currentDocument.querySelectorAll('[jahiatype]').forEach(element => {
            const type = element.getAttribute('jahiatype');
            const modulePath = element.getAttribute('path');

            if (type === 'module' && modulePath !== '*') {
                if (modulePath.startsWith('/')) {
                    element.dataset.jahiaPath = modulePath;
                } else {
                    const parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
                    element.dataset.jahiaPath = `${parent.dataset.jahiaPath}/${modulePath}`;
                }

                _modules.push(element);
            }
        });

        // Removes invisible selections
        if (selection.length > 0) {
            const toRemove = selection.filter(_path => !pathExistsInTree(_path, _modules, node => node.dataset.jahiaPath));
            if (toRemove.length > 0) {
                if (TableViewModeChangeTracker.modeChanged) {
                    notify(t('jcontent:label.contentManager.selection.removed', {count: toRemove.length}), ['closeButton', 'closeAfter5s']);
                }

                dispatch(cmRemoveSelection(toRemove));
            }
        }

        TableViewModeChangeTracker.resetChanged();

        setModules(_modules);

        currentDocument.documentElement.querySelector('body').addEventListener('contextmenu', event => {
            // Prevent showing contextual menu if clicked on breadcrumb, note that ctrl + click counts as right click and triggers contextmenu
            if (checkClickInBreadcrumbFooter(event)) {
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
    }, [path, currentDocument, currentFrameRef, onMouseOut, onMouseOver, dispatch, t, notify, selection]);

    const paths = [...new Set([
        ...modules.map(m => m.dataset.jahiaPath),
        ...placeholders.map(m => m.ownerDocument.getElementById(m.dataset.jahiaParent).dataset.jahiaPath)
    ])];

    const {data, refetch} = useQuery(BoxesQuery, {variables: {paths, language, displayLanguage: uilang}, fetchPolicy: 'network-only', errorPolicy: 'all'});

    useEffect(() => {
        setRefetcher(refetchTypes.PAGE_BUILDER_BOXES, {refetch: refetch});
        return () => {
            unsetRefetcher(refetchTypes.PAGE_BUILDER_BOXES);
        };
    });

    const nodes = useMemo(() => data?.jcr && data.jcr.nodesByPath.reduce((acc, n) => ({
        ...acc,
        [n.path]: n
    }), {}), [data?.jcr]);

    // Update clickedElement if it doesn't exist anymore
    if (clickedElement && data?.jcr.nodesByPath && !nodes[clickedElement?.path]) {
        setClickedElement(undefined);
    }

    const getBreadcrumbsForPath = _path => {
        const breadcrumbs = [];
        const node = nodes[_path];

        if (!node) {
            return breadcrumbs;
        }

        const pathFragments = node.path.split('/');
        pathFragments.pop();

        let lookUpPath = pathFragments.join('/');
        while (nodes[lookUpPath]) {
            breadcrumbs.unshift(nodes[lookUpPath]);
            pathFragments.pop();
            lookUpPath = pathFragments.join('/');
        }

        return breadcrumbs;
    };

    const onDoubleClick = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        const element = getModuleElement(currentDocument, event.currentTarget);
        const _path = element.getAttribute('path');
        window.CE_API.edit({
            uuid: nodes[_path].uuid,
            site: site,
            lang: language,
            uilang,
            isFullscreen: false,
            configName: 'gwtedit'
        });
    }, [nodes, site, language, uilang, currentDocument]);

    const currentPath = currentElement?.path || path;
    const entries = useMemo(() => modules.map(m => ({
        name: m.dataset.jahiaPath.substr(m.dataset.jahiaPath.lastIndexOf('/') + 1),
        path: m.dataset.jahiaPath,
        depth: m.dataset.jahiaPath.split('/').length
    })), [modules]);

    let pathObject;

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

    const setDraggedOverlayPosition = position => {
        currentDndInfo.current.draggedOverlayPosition = position;
    };

    const calculateDropTarget = (destPath, nodePath, insertPosition, dropAllowed) => {
        if (!destPath) {
            currentDndInfo.current.dropTarget = null;
            return;
        }

        currentDndInfo.current.dropAllowed = dropAllowed;

        const current = nodes[destPath];
        const targetModule = modules.find(m => m.dataset.jahiaPath === current?.path);

        if (targetModule) {
            const rect = getBoundingBox(targetModule, true);
            currentDndInfo.current.dropTarget = {
                node: current,
                position: {
                    ...rect
                }
            };
        }

        if (nodePath) {
            const currentDnd = nodes[nodePath];
            const dndTargetModule = modules.find(m => m.dataset.jahiaPath === currentDnd?.path);

            if (dndTargetModule && insertPosition) {
                const rect = getBoundingBox(dndTargetModule, true);
                currentDndInfo.current.relative = {
                    node: currentDnd,
                    position: {
                        ...rect
                    },
                    insertPosition
                };
            } else {
                currentDndInfo.current.relative = null;
            }
        }
    };

    const el = currentElement?.element;

    return (
        <div ref={rootElement}>
            <ContextualMenu
                setOpenRef={contextualMenu}
                currentPath={currentPath}
                documentElement={currentDocument.documentElement}
                {...pathObject}
            />

            {modules.map(element => ({element, node: nodes?.[element.dataset.jahiaPath]}))
                .filter(({node}) => node && (!isMarkedForDeletion(node) || hasMixin(node, 'jmix:markedForDeletionRoot')))
                .map(({node, element}) => (
                    <Box key={element.getAttribute('id')}
                         node={node}
                         isClicked={clickedElement && node.path === clickedElement.path}
                         isHovered={element === el}
                         isSelected={selection.includes(node.path)}
                         isSomethingSelected={selection.length > 0}
                         isHeaderDisplayed={(clickedElement && node.path === clickedElement.path) ||
                             selection.includes(node.path) ||
                             (selection.length > 0 && !selection.some(selectionElement => isDescendant(node.path, selectionElement)) && element === el)}
                         isHeaderHighlighted={isDescendant(currentElement?.path, node.path)}
                         isActionsHidden={selection.length > 0}
                         currentFrameRef={currentFrameRef}
                         rootElementRef={rootElement}
                         element={element}
                         breadcrumbs={((clickedElement && node.path === clickedElement.path) ||
                             selection.includes(node.path) ||
                             (selection.length > 0 &&
                                 !selection.some(selectionElement => isDescendant(node.path, selectionElement)) && element === el)) ?
                             getBreadcrumbsForPath(node.path) :
                             []}
                         entries={entries}
                         language={language}
                         displayLanguage={uilang}
                         color="default"
                         addIntervalCallback={addIntervalCallback}
                         setDraggedOverlayPosition={setDraggedOverlayPosition}
                         calculateDropTarget={calculateDropTarget}
                         setClickedElement={setClickedElement}
                         onMouseOver={onMouseOver}
                         onMouseOut={onMouseOut}
                         onSelect={onSelect}
                         onClick={onClick}
                         onDoubleClick={onDoubleClick}
                         onSaved={onSaved}
                    />
                ))}

            {!clickedElement && placeholders.map(element => ({
                element,
                node: nodes?.[element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent).getAttribute('path')]
            }))
                .filter(({node}) => node && !isMarkedForDeletion(node) && !findAvailableBoxConfig(node)?.isBoxActionsHidden)
                .map(({node, element}) => (
                    <Create key={element.getAttribute('id')}
                            node={node}
                            nodes={nodes}
                            element={element}
                            addIntervalCallback={addIntervalCallback}
                            clickedElement={clickedElement}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}
                            onClick={onClick}
                            onSaved={onSaved}
                    />
                ))}
            <InsertionPoints currentDocument={currentDocument} addIntervalCallback={addIntervalCallback} clickedElement={clickedElement} nodes={nodes} onSaved={onSaved}/>
        </div>
    );
};

Boxes.propTypes = {
    currentDocument: PropTypes.any,
    currentFrameRef: PropTypes.any,
    currentDndInfo: PropTypes.object,
    addIntervalCallback: PropTypes.func,
    onSaved: PropTypes.func,
    clickedElement: PropTypes.any,
    setClickedElement: PropTypes.func
};
