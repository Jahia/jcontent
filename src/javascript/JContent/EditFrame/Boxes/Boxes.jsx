import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Box} from '../Box';
import {Create, getElemAttributes} from '../Create';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {useDragDropManager} from 'react-dnd';
import {BoxesQuery} from './Boxes.gql-queries';
import {hasMixin, isDescendant, isMarkedForDeletion} from '~/JContent/JContent.utils';
import {cmAddSelection, cmClearSelection, cmRemoveSelection} from '../../redux/selection.redux';
import {batchActions} from 'redux-batched-actions';
import {canEditInPageBuilder, findAvailableBoxConfig, pathExistsInTree} from '../../JContent.utils';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {TableViewModeChangeTracker} from '~/JContent/ContentRoute/ToolBar/ViewModeSelector/tableViewChangeTracker';
import {getBoundingBox} from '../EditFrame.utils';
import InsertionPoints from '../InsertionPoints';
import {useBoxesContextMenu} from './BoxesContextMenu';
import {resetContentStatusPaths} from '~/JContent/redux/contentStatus.redux';
import {useButtonsData} from '~/JContent/EditFrame/Boxes/dataHooks/useButtonsData';
import {useDndData} from '~/JContent/EditFrame/Boxes/dataHooks/useDndData';
import {usePasteData} from '~/JContent/EditFrame/Boxes/dataHooks/usePasteData';
import {usePageBuilderState, usePageBuilderStore} from '~/JContent/EditFrame/core/pageBuilderStore';
import {useFrameEvents} from '~/JContent/EditFrame/core/useFrameEvents';

// A click on something the page itself handles (a link, a button, a text selection) is left to it.
const disallowSelection = element => {
    const tags = ['A', 'BUTTON'];

    return tags.includes(element.tagName) || element.closest('a') !== null || element.ownerDocument.getSelection().type === 'Range';
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

const selectClickedElement = state => state.clickedElement;

export const Boxes = ({currentDocument, currentFrameRef, currentDndInfo, onSaved}) => {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const dispatch = useDispatch();
    const {monitor} = useDragDropManager();

    const language = useSelector(state => state.language);
    const path = useSelector(state => state.jcontent.path);
    const selection = useSelector(state => state.jcontent.selection, shallowEqual);
    const site = useSelector(state => state.site);
    const uilang = useSelector(state => state.uilang);

    const store = usePageBuilderStore();
    const clickedElement = usePageBuilderState(selectClickedElement);
    const setClickedElement = store.setClickedElement;

    const [placeholders, setPlaceholders] = useState([]);
    const [modules, setModules] = useState([]);
    const [createButtons, setCreateButtons] = useState([]);
    const actionData = useButtonsData({createButtons, language, uilang});
    const pasteData = usePasteData({createButtons, language});

    // When document is updated after save, clicked element in memory no longer matches what's in the DOM
    useEffect(() => {
        if (clickedElement && !currentDocument.getElementById(clickedElement.element.getAttribute('id'))) {
            setClickedElement(undefined);
        }
    }, [currentDocument, clickedElement, setClickedElement]);

    // Reads the page's modules once per document: which ones get a box, which ones are create buttons.
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

        setModules(_modules);
    }, [path, currentDocument]);

    // Removes the selected paths the page does not show
    useEffect(() => {
        if (selection.length > 0) {
            const toRemove = selection.filter(_path => !pathExistsInTree(_path, modules, node => node.dataset.jahiaPath));
            if (toRemove.length > 0) {
                if (TableViewModeChangeTracker.modeChanged) {
                    notify(t('jcontent:label.contentManager.selection.removed', {count: toRemove.length}), ['closeButton', 'closeAfter5s']);
                }

                dispatch(cmRemoveSelection(toRemove));
            }
        }

        TableViewModeChangeTracker.resetChanged();
    }, [modules, selection, dispatch, notify, t]);

    const paths = [...new Set([
        path,
        ...modules.map(m => m.dataset.jahiaPath),
        ...placeholders.map(m => m.ownerDocument.getElementById(m.dataset.jahiaParent).dataset.jahiaPath)
    ])];

    // Count for content status selector needs to be reset when document is refreshed
    useEffect(() => {
        dispatch(resetContentStatusPaths());
    }, [dispatch, currentDocument]);

    const {data, refetch} = useQuery(BoxesQuery, {variables: {paths, language, displayLanguage: uilang}, fetchPolicy: 'network-only', errorPolicy: 'all'});

    const {nodeDragData, nodeDropData} = useDndData({paths, language, uilang});

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

    useEffect(() => {
        if (nodes) {
            // Placeholders for create buttons
            const buttonPlaceHolders = placeholders
                .map(element => ({
                    element,
                    node: nodes?.[element.dataset.jahiaParent &&
                    element.ownerDocument.getElementById(element.dataset.jahiaParent).getAttribute('path')],
                    attributes: getElemAttributes({element, parent: element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent)})
                }))
                .filter(({node}) => node && !isMarkedForDeletion(node) && !findAvailableBoxConfig(node)?.isBoxActionsHidden && canEditInPageBuilder(node.path, nodes, site));

            setCreateButtons(buttonPlaceHolders);
        }
    }, [nodes, path, placeholders, site]);

    const boxes = useMemo(() => modules
        .map(element => ({element, node: nodes?.[element.dataset.jahiaPath]}))
        .filter(({node}) => node && (!isMarkedForDeletion(node) || hasMixin(node, 'jmix:markedForDeletionRoot')) && canEditInPageBuilder(node.path, nodes, site)),
    [modules, nodes, site]);

    const boxedElements = useMemo(() => new Set(boxes.map(({element}) => element)), [boxes]);
    const isInteractive = useCallback(element => boxedElements.has(element), [boxedElements]);

    const toggleSelection = useCallback(_path => {
        if (selection.includes(_path)) {
            dispatch(cmRemoveSelection(_path));
        } else if (!selection.some(selectionElement => isDescendant(_path, selectionElement))) {
            // Ok so no parent is already selected we can add ourselves
            const actions = [];
            actions.push(cmAddSelection(_path));
            // Now we need to remove children if there was any selected as we do not allow multiple selection of parent/children
            selection.filter(selectionElement => isDescendant(selectionElement, _path)).forEach(selectedChild => actions.push(cmRemoveSelection(selectedChild)));
            dispatch(batchActions(actions));
        }
    }, [selection, dispatch]);

    // Used by the breadcrumbs, which select a path that has no box under the pointer
    const onSelect = useCallback((event, _path) => {
        if (disallowSelection(event.target)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        toggleSelection(_path);
    }, [toggleSelection]);

    const clearOnOutsideClick = event => {
        if (!event.defaultPrevented) {
            dispatch(cmClearSelection());
        }

        setClickedElement(undefined);
    };

    const onModuleClick = (event, {element, path: _path}) => {
        const isMultipleSelectionMode = event.metaKey || event.ctrlKey;
        if (event.detail === 2) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        // Do not handle selection if the target element can be interacted with
        if (event.detail !== 1 || (disallowSelection(event.target) && !isMultipleSelectionMode)) {
            clearOnOutsideClick(event);
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        if (isMultipleSelectionMode) {
            // Previously clicked element is added to selection if not ancestor and "unclicked"
            if (clickedElement && !isDescendant(_path, clickedElement.path) && !disallowSelection(clickedElement.element)) {
                toggleSelection(clickedElement.path);
            }

            setClickedElement(undefined);
            if (!disallowSelection(event.target)) {
                toggleSelection(_path);
            }
        } else {
            if (selection.length > 0) {
                dispatch(cmClearSelection());
            }

            setClickedElement(clickedElement?.path === _path ? undefined : {element, path: _path});
        }
    };

    const onDoubleClick = (event, _path) => {
        event.preventDefault();
        event.stopPropagation();
        window.CE_API.edit({
            uuid: nodes[_path].uuid,
            site: site,
            lang: language,
            uilang,
            isFullscreen: false,
            configName: 'gwtedit'
        });
    };

    const {menu, onContextMenu} = useBoxesContextMenu({currentFrameRef, currentDocument, selection, nodes});

    useFrameEvents(currentDocument, isInteractive, {
        onPointerOver: (event, hit) => {
            // Leave the hover as it is while dragging, over an insertion point or over an open menu
            if (monitor.isDragging() || hit?.kind === 'insertionPoint' || event.target.closest?.('#menuHolder')) {
                return;
            }

            store.setHoveredPath(hit?.path ?? null);
        },
        onClick: (event, hit) => {
            if (hit?.element) {
                onModuleClick(event, hit);
            } else {
                clearOnOutsideClick(event);
            }
        },
        onDoubleClick: (event, hit) => {
            if (hit?.element && (hit.kind === 'module' || hit.kind === 'header') && nodes?.[hit.path]) {
                onDoubleClick(event, hit.path);
            }
        },
        onContextMenu,
        onKeyDown: event => {
            if (event.key === 'Escape' || event.keyCode === 27) {
                dispatch(cmClearSelection());
                setClickedElement(undefined);
            }
        }
    });

    const entries = useMemo(() => modules.map(m => ({
        name: m.dataset.jahiaPath.substr(m.dataset.jahiaPath.lastIndexOf('/') + 1),
        path: m.dataset.jahiaPath,
        depth: m.dataset.jahiaPath.split('/').length
    })), [modules]);

    const setDraggedOverlayPosition = useCallback(position => {
        currentDndInfo.current.draggedOverlayPosition = position;
    }, [currentDndInfo]);

    const calculateDropTarget = useCallback((destPath, nodePath, insertPosition, dropAllowed) => {
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
    }, [currentDndInfo, nodes, modules]);

    const memoizedPlaceholders = useMemo(() => {
        return createButtons
            .map(({node, element}) => (
                <div key={`createButtons-${element.getAttribute('id')}`} style={{display: clickedElement ? 'none' : undefined}}>
                    <Create key={element.getAttribute('id')}
                            node={node}
                            nodes={nodes}
                            element={element}
                            nodeDropData={nodeDropData}
                            pasteData={pasteData}
                            nodeData={actionData?.nodes?.[node.path]}
                            clickedElement={clickedElement}
                            onSaved={onSaved}
                    />
                </div>
            ));
    }, [createButtons, clickedElement, nodes, nodeDropData, actionData?.nodes, onSaved, pasteData]);

    const MemoizedInsertionPoints = useMemo(() => (
        clickedElement && <InsertionPoints
            currentDocument={currentDocument}
            nodeDropData={nodeDropData}
            clickedElement={clickedElement}
            nodes={nodes}
            onSaved={onSaved}
        />
    ), [
        currentDocument,
        clickedElement,
        nodes,
        onSaved,
        nodeDropData
    ]);

    return (
        <div>
            {menu}

            {boxes.map(({node, element}) => (
                <Box key={element.getAttribute('id')}
                     nodes={nodes}
                     node={node}
                     currentFrameRef={currentFrameRef}
                     element={element}
                     entries={entries}
                     language={language}
                     displayLanguage={uilang}
                     color="default"
                     setDraggedOverlayPosition={setDraggedOverlayPosition}
                     calculateDropTarget={calculateDropTarget}
                     nodeDragData={nodeDragData}
                     nodeDropData={nodeDropData}
                     setClickedElement={setClickedElement}
                     onSelect={onSelect}
                     onSaved={onSaved}
                />
            ))}

            {memoizedPlaceholders}
            {MemoizedInsertionPoints}
        </div>
    );
};

Boxes.propTypes = {
    currentDocument: PropTypes.any,
    currentFrameRef: PropTypes.any,
    currentDndInfo: PropTypes.object,
    onSaved: PropTypes.func
};
