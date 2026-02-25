import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Box} from '../Box';
import {Create, useElemAttributes} from '../Create';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {BoxesQuery} from './Boxes.gql-queries';
import {hasMixin, isDescendant, isDescendantOrSelf, isMarkedForDeletion} from '~/JContent/JContent.utils';
import {cmAddSelection, cmClearSelection, cmRemoveSelection} from '../../redux/selection.redux';
import {batchActions} from 'redux-batched-actions';
import {findAvailableBoxConfig, pathExistsInTree} from '../../JContent.utils';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {TableViewModeChangeTracker} from '~/JContent/ContentRoute/ToolBar/ViewModeSelector/tableViewChangeTracker';
import {getBoundingBox} from '../EditFrame.utils';
import InsertionPoints from '../InsertionPoints';
import BoxesContextMenu from './BoxesContextMenu';
import useClearSelection from './useClearSelection';
import {resetContentStatusPaths} from '~/JContent/redux/contentStatus.redux';
import styles from './Boxes.scss';
import {useHoverManager} from '~/JContent/EditFrame/Boxes/useHoverManager';
import {useButtonsData} from '~/JContent/EditFrame/Boxes/dataHooks/useButtonsData';
import {useDndData} from '~/JContent/EditFrame/Boxes/dataHooks/useDndData';
import {usePasteData} from '~/JContent/EditFrame/Boxes/dataHooks/usePasteData';
import {HoverProvider} from '~/JContent/EditFrame/Boxes/HoverContext';

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

// This determines if the node is included as part of content reference in which case we don't want to have a box for it.
const isFromReference = (path, nodes) => {
    if (path.includes('@/')) {
        // Note that parent path cannot be checked directly as parent is not jnt:contentReference but jnt:list or other (/somepath/content-ref@/list/node)
        // Note that we also check to make sure that what we find is a discoverable node in the tree
        const split = path.split('@/');
        return nodes[split[0]]?.primaryNodeType.name === 'jnt:contentReference';
    }

    return false;
};

export const Boxes = ({currentDocument, currentFrameRef, currentDndInfo, addIntervalCallback, onSaved, clickedElement, setClickedElement}) => {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const dispatch = useDispatch();

    const language = useSelector(state => state.language);
    const path = useSelector(state => state.jcontent.path);
    const selection = useSelector(state => state.jcontent.selection, shallowEqual);
    const site = useSelector(state => state.site);
    const uilang = useSelector(state => state.uilang);

    const {registerHoverManager, setHovered, clearHovered} = useHoverManager();
    const hoverProviderRef = useRef(null);
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

    const onMouseOver = useCallback(event => {
        event.stopPropagation();
        const target = event.currentTarget;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            const moduleElement = getModuleElement(currentDocument, target);
            const path = moduleElement.getAttribute('path');
            setHovered(path); // Only updates the specific box
            hoverProviderRef.current?.setHoveredPath(path);
        }, 0);
    }, [currentDocument, setHovered]);

    const onMouseOut = useCallback(event => {
        event.stopPropagation();
        const target = event.currentTarget;
        const path = target.getAttribute('path');

        if (event.relatedTarget &&
            !isDescendantOrSelf(
                getModuleElement(currentDocument, event.relatedTarget)?.getAttribute('path'),
                path
            ) &&
            !event.target.closest('#menuHolder')
        ) {
            window.clearTimeout(timeout);
            clearHovered();
            hoverProviderRef.current?.setHoveredPath(null);
        }
    }, [currentDocument, clearHovered]);

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

    useClearSelection({currentDocument, setClickedElement});

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
    }, [path, currentDocument, currentFrameRef, onMouseOut, onMouseOver, dispatch, t, notify, selection]);

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
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    attributes: useElemAttributes({element, parent: element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent)})
                }))
                .filter(({node}) => node && !isMarkedForDeletion(node) && !findAvailableBoxConfig(node)?.isBoxActionsHidden && isDescendant(node.path, path) && !isFromReference(node.path, nodes));

            setCreateButtons(buttonPlaceHolders);
        }
    }, [nodes, path, placeholders]);

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

    const entries = useMemo(() => modules.map(m => ({
        name: m.dataset.jahiaPath.substr(m.dataset.jahiaPath.lastIndexOf('/') + 1),
        path: m.dataset.jahiaPath,
        depth: m.dataset.jahiaPath.split('/').length
    })), [modules]);

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

    const memoizedPlaceholders = useMemo(() => {
        return createButtons
            .map(({node, element}) => (
                <div key={`createButtons-${node.path}`} className={clickedElement ? styles.displayNone : ''}>
                    <Create key={element.getAttribute('id')}
                            node={node}
                            nodes={nodes}
                            element={element}
                            nodeDropData={nodeDropData}
                            pasteData={pasteData}
                            nodeData={actionData?.nodes?.[node.path]}
                            addIntervalCallback={addIntervalCallback}
                            clickedElement={clickedElement}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}
                            onClick={onClick}
                            onSaved={onSaved}
                    />
                </div>
            ));
    }, [createButtons, clickedElement, nodes, nodeDropData, actionData?.nodes, addIntervalCallback, onMouseOver, onMouseOut, onClick, onSaved, pasteData]);

    const MemoizedInsertionPoints = useMemo(() => (
        clickedElement && <InsertionPoints
            currentDocument={currentDocument}
            nodeDropData={nodeDropData}
            addIntervalCallback={addIntervalCallback}
            clickedElement={clickedElement}
            nodes={nodes}
            onSaved={onSaved}
        />
    ), [
        currentDocument,
        addIntervalCallback,
        clickedElement,
        nodes,
        onSaved,
        nodeDropData
    ]);

    return (
        <div>
            <HoverProvider ref={hoverProviderRef}>
                <BoxesContextMenu
                    currentFrameRef={currentFrameRef}
                    currentDocument={currentDocument}
                    selection={selection}
                />
            </HoverProvider>

            {modules.map(element => ({element, node: nodes?.[element.dataset.jahiaPath]}))
                .filter(({node}) => node && (!isMarkedForDeletion(node) || hasMixin(node, 'jmix:markedForDeletionRoot')) && isDescendant(node.path, path) && !isFromReference(node.path, nodes))
                .map(({node, element}) => (
                    <Box key={element.getAttribute('id')}
                         nodes={nodes}
                         node={node}
                         registerHoverManager={registerHoverManager}
                         clickedElement={clickedElement}
                         currentFrameRef={currentFrameRef}
                         element={element}
                         entries={entries}
                         language={language}
                         displayLanguage={uilang}
                         color="default"
                         addIntervalCallback={addIntervalCallback}
                         setDraggedOverlayPosition={setDraggedOverlayPosition}
                         calculateDropTarget={calculateDropTarget}
                         nodeDragData={nodeDragData}
                         nodeDropData={nodeDropData}
                         setClickedElement={setClickedElement}
                         onMouseOver={onMouseOver}
                         onMouseOut={onMouseOut}
                         onSelect={onSelect}
                         onClick={onClick}
                         onDoubleClick={onDoubleClick}
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
    addIntervalCallback: PropTypes.func,
    onSaved: PropTypes.func,
    clickedElement: PropTypes.any,
    setClickedElement: PropTypes.func
};
