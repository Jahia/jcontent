import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Box} from '../Box';
import {Create} from '../Create';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {BoxesQuery} from './Boxes.gql-queries';
import {hasMixin, isDescendant, isDescendantOrSelf, isMarkedForDeletion} from '~/JContent/JContent.utils';
import {cmAddSelection, cmClearSelection, cmRemoveSelection} from '../../redux/selection.redux';
import {batchActions} from 'redux-batched-actions';
import {findAvailableBoxConfig} from '../../JContent.utils';
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

import {useVisibleModulePaths} from './useVisibleModulePaths';
import {useRafState} from './useRafState';

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

    const selectionSet = useMemo(() => new Set(selection), [selection]);

    // Hovered module path (store path only, not DOM element)
    const [hoveredPath, setHoveredPath] = useRafState(null);

    const [placeholders, setPlaceholders] = useState([]);
    const [modules, setModules] = useState([]);

    // Fast lookup: path -> element
    const modulesByPath = useMemo(() => {
        const map = new Map();
        for (const el of modules) {
            map.set(el.dataset.jahiaPath, el);
        }

        return map;
    }, [modules]);

    // When document is updated after save, clicked element in memory no longer matches what's in the DOM
    useEffect(() => {
        if (clickedElement && !currentDocument.getElementById(clickedElement.element.getAttribute('id'))) {
            setClickedElement(undefined);
        }
    }, [currentDocument, clickedElement, setClickedElement]);

    const onSelect = useCallback((event, _path) => {
        const element = getModuleElement(currentDocument, event.currentTarget);
        _path = _path || element.getAttribute('path');
        const isSelected = selectionSet.has(_path);

        if (disallowSelection(event.target)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (isSelected) {
            dispatch(cmRemoveSelection(_path));
        } else if (!selection.some(selectionElement => isDescendant(_path, selectionElement))) {
            const actions = [];
            actions.push(cmAddSelection(_path));
            selection
                .filter(selectionElement => isDescendant(selectionElement, _path))
                .forEach(selectedChild => actions.push(cmRemoveSelection(selectedChild)));
            dispatch(batchActions(actions));
        }
    }, [selection, selectionSet, currentDocument, dispatch]);

    const onClick = useCallback(event => {
        const isMultipleSelectionMode = event.metaKey || event.ctrlKey;

        if (event.detail === 1) {
            if (disallowSelection(event.target) && !isMultipleSelectionMode) {
                return undefined;
            }

            event.preventDefault();
            event.stopPropagation();

            const target = event.currentTarget;
            const moduleElement = getModuleElement(currentDocument, target);
            const clickedPath = moduleElement.getAttribute('path');

            if (isMultipleSelectionMode) {
                if (clickedElement && !isDescendant(clickedPath, clickedElement.path)) {
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

                if (clickedElement && clickedElement.path === clickedPath) {
                    setClickedElement(undefined);
                } else {
                    setClickedElement(() => ({element: moduleElement, path: clickedPath}));
                }
            }
        } else if (event.detail === 2) {
            event.preventDefault();
            event.stopPropagation();
        }

        return false;
    }, [onSelect, currentDocument, clickedElement, setClickedElement, dispatch, selection]);

    const onDoubleClick = useCallback(event => {
        event.preventDefault();
        event.stopPropagation();
        const element = getModuleElement(currentDocument, event.currentTarget);
        const _path = element.getAttribute('path');
        window.CE_API.edit({
            uuid: nodesRef.current?.[_path]?.uuid,
            site: site,
            lang: language,
            uilang,
            isFullscreen: false,
            configName: 'gwtedit'
        });
    }, [site, language, uilang, currentDocument]);

    // Keep latest nodes in a ref so delegated handlers can access without re-binding listeners
    const nodesRef = useRef(null);

    // Delegated event handling: attach ONCE per document
    useEffect(() => {
        const body = currentDocument?.body;
        if (!body) {
            return;
        }

        const resolveModule = event => {
            const moduleElement = getModuleElement(currentDocument, event.target);
            if (!moduleElement) {
                return null;
            }

            if (moduleElement.getAttribute('jahiatype') !== 'module') {
                // Some events may come from other types; normalize to module if possible
                const closestModule = moduleElement.closest?.('[jahiatype=module]');
                return closestModule || moduleElement;
            }

            return moduleElement;
        };

        const onMouseOverCapture = event => {
            const moduleElement = resolveModule(event);
            if (!moduleElement) {
                return;
            }

            const p = moduleElement.getAttribute('path');
            setHoveredPath(p);
        };

        const onMouseOutCapture = event => {
            // If leaving the document or moving to a totally different module, clear hover
            const from = resolveModule(event);
            const to = event.relatedTarget ? getModuleElement(currentDocument, event.relatedTarget) : null;

            const fromPath = from?.getAttribute?.('path');
            const toPath = to?.getAttribute?.('path');

            if (fromPath && (!toPath || !isDescendantOrSelf(toPath, fromPath)) && !event.target.closest('#menuHolder')) {
                setHoveredPath(null);
            }
        };

        const onClickCapture = event => {
            const moduleElement = resolveModule(event);
            if (!moduleElement) {
                return;
            }

            // emulate old behavior: currentTarget should be the module element
            const proxyEvent = Object.create(event, {
                currentTarget: {value: moduleElement}
            });

            onClick(proxyEvent);
        };

        const onDblClickCapture = event => {
            const moduleElement = resolveModule(event);
            if (!moduleElement) {
                return;
            }

            const proxyEvent = Object.create(event, {
                currentTarget: {value: moduleElement}
            });

            onDoubleClick(proxyEvent);
        };

        body.addEventListener('mouseover', onMouseOverCapture, true);
        body.addEventListener('mouseout', onMouseOutCapture, true);
        body.addEventListener('click', onClickCapture, true);
        body.addEventListener('dblclick', onDblClickCapture, true);

        return () => {
            body.removeEventListener('mouseover', onMouseOverCapture, true);
            body.removeEventListener('mouseout', onMouseOutCapture, true);
            body.removeEventListener('click', onClickCapture, true);
            body.removeEventListener('dblclick', onDblClickCapture, true);
        };
    }, [currentDocument, onClick, onDoubleClick, setHoveredPath]);

    useClearSelection({currentDocument, setClickedElement});

    // DOM discovery effect: do NOT depend on selection
    useEffect(() => {
        const _placeholders = [];
        const moduleElements = [...currentDocument.querySelectorAll('[jahiatype=module]')];

        // Pointer events setup (kept to preserve behavior; ideally moved to CSS)
        for (const element of moduleElements) {
            element.style['pointer-events'] = 'all';

            let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
            if (!parent) {
                parent = element.parentElement?.closest?.('[jahiatype=module]');
                if (parent) {
                    element.dataset.jahiaParent = parent.id;
                }
            }

            if (element.getAttribute('path') === '*' || element.getAttribute('type') === 'placeholder') {
                if (!parent) {
                    // keep existing warning
                    // eslint-disable-next-line no-console
                    console.warn('Couldn\'t find parent element with jahiatype=module for element ', element);
                } else {
                    _placeholders.push(element);
                }
            }
        }

        // prev/next positions (still O(N); could be moved to drag-start later)
        for (const element of moduleElements) {
            const parentId = element.id;
            const children = [...currentDocument.querySelectorAll(`[data-jahia-parent=${parentId}]`)];
            const coords = children.map(m => m.getBoundingClientRect());
            for (let i = 0; i < children.length; i++) {
                children[i].dataset.prevPos = getRelativePos(coords[i], coords[i - 1]) || 'top';
                children[i].dataset.nextPos = getRelativePos(coords[i], coords[i + 1]) || 'bottom';
            }
        }

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

        TableViewModeChangeTracker.resetChanged();
        setModules(_modules);
    }, [currentDocument, path, notify, t]);

    // Remove invisible selections: now uses O(1) membership instead of pathExistsInTree
    useEffect(() => {
        if (selection.length === 0) {
            return;
        }

        const modulePathSet = new Set(modules.map(m => m.dataset.jahiaPath));
        const toRemove = selection.filter(p => !modulePathSet.has(p));

        if (toRemove.length > 0) {
            if (TableViewModeChangeTracker.modeChanged) {
                notify(t('jcontent:label.contentManager.selection.removed', {count: toRemove.length}), ['closeButton', 'closeAfter5s']);
            }

            dispatch(cmRemoveSelection(toRemove));
        }

        TableViewModeChangeTracker.resetChanged();
    }, [selection, modules, dispatch, notify, t]);

    // Query paths memoized
    const paths = useMemo(() => {
        const placeholderParentPaths = placeholders
            .map(m => m.ownerDocument.getElementById(m.dataset.jahiaParent))
            .filter(Boolean)
            .map(parentEl => parentEl.dataset.jahiaPath);

        return [...new Set([path, ...modules.map(m => m.dataset.jahiaPath), ...placeholderParentPaths])];
    }, [path, modules, placeholders]);

    useEffect(() => {
        dispatch(resetContentStatusPaths());
    }, [dispatch, currentDocument]);

    const {data, refetch} = useQuery(BoxesQuery, {
        variables: {paths, language, displayLanguage: uilang},
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
    });

    useEffect(() => {
        setRefetcher(refetchTypes.PAGE_BUILDER_BOXES, {refetch});
        return () => {
            unsetRefetcher(refetchTypes.PAGE_BUILDER_BOXES);
        };
    }, [refetch]);

    const nodes = useMemo(() => data?.jcr && data.jcr.nodesByPath.reduce((acc, n) => ({
        ...acc,
        [n.path]: n
    }), {}), [data?.jcr]);

    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    const getBreadcrumbsForPath = useCallback(node => {
        const breadcrumbs = [];
        if (!node) {
            return breadcrumbs;
        }

        const pathFragments = node.path.split('/');
        pathFragments.pop();

        let lookUpPath = pathFragments.join('/');
        while (lookUpPath !== path && nodes[lookUpPath]) {
            breadcrumbs.unshift(nodes[lookUpPath]);
            pathFragments.pop();
            lookUpPath = pathFragments.join('/');
        }

        return breadcrumbs;
    }, [nodes, path]);

    const entries = useMemo(() => modules.map(m => ({
        name: m.dataset.jahiaPath.substr(m.dataset.jahiaPath.lastIndexOf('/') + 1),
        path: m.dataset.jahiaPath,
        depth: m.dataset.jahiaPath.split('/').length
    })), [modules]);

    const setDraggedOverlayPosition = position => {
        currentDndInfo.current.draggedOverlayPosition = position;
    };

    const calculateDropTarget = useCallback((destPath, nodePath, insertPosition, dropAllowed) => {
        if (!destPath) {
            currentDndInfo.current.dropTarget = null;
            return;
        }

        currentDndInfo.current.dropAllowed = dropAllowed;

        const current = nodes[destPath];
        const targetModule = modulesByPath.get(current?.path);

        if (targetModule) {
            const rect = getBoundingBox(targetModule, true);
            currentDndInfo.current.dropTarget = {
                node: current,
                position: {...rect}
            };
        }

        if (nodePath) {
            const currentDnd = nodes[nodePath];
            const dndTargetModule = modulesByPath.get(currentDnd?.path);

            if (dndTargetModule && insertPosition) {
                const rect = getBoundingBox(dndTargetModule, true);
                currentDndInfo.current.relative = {
                    node: currentDnd,
                    position: {...rect},
                    insertPosition
                };
            } else {
                currentDndInfo.current.relative = null;
            }
        }
    }, [currentDndInfo, nodes, modulesByPath]);

    const currentPath = hoveredPath || path;

    // Virtualization: visible modules from IntersectionObserver
    const visiblePathSet = useVisibleModulePaths({currentDocument, modules});

    const renderPathSet = useMemo(() => {
        const set = new Set();
        for (const p of visiblePathSet) set.add(p);
        for (const p of selection) set.add(p);
        if (clickedElement?.path) set.add(clickedElement.path);
        if (hoveredPath) set.add(hoveredPath);
        return set;
    }, [visiblePathSet, selection, clickedElement, hoveredPath]);

    const memoizedPlaceholders = useMemo(() => {
        return placeholders
            .map(element => ({
                element,
                node: nodes?.[
                    element.dataset.jahiaParent &&
                    element.ownerDocument.getElementById(element.dataset.jahiaParent).getAttribute('path')
                ]
            }))
            .filter(({node}) =>
                node &&
                !isMarkedForDeletion(node) &&
                !findAvailableBoxConfig(node)?.isBoxActionsHidden &&
                isDescendant(node.path, path) &&
                !isFromReference(node.path, nodes)
            )
            .map(({node, element}) => (
                <div key={`createButtons-${node.path}`} className={clickedElement ? styles.displayNone : ''}>
                    <Create
                        key={element.getAttribute('id')}
                        node={node}
                        nodes={nodes}
                        element={element}
                        addIntervalCallback={addIntervalCallback}
                        clickedElement={clickedElement}
                        onMouseOver={() => {}}
                        onMouseOut={() => {}}
                        onClick={onClick}
                        onSaved={onSaved}
                    />
                </div>
            ));
    }, [path, clickedElement, placeholders, nodes, addIntervalCallback, onClick, onSaved]);

    const MemoizedInsertionPoints = useMemo(() => (
        <InsertionPoints
            currentDocument={currentDocument}
            addIntervalCallback={addIntervalCallback}
            clickedElement={clickedElement}
            nodes={nodes}
            onSaved={onSaved}
        />
    ), [currentDocument, addIntervalCallback, clickedElement, nodes, onSaved]);

    const isSomethingSelected = selection.length > 0;

    return (
        <div>
            <BoxesContextMenu
                currentFrameRef={currentFrameRef}
                currentDocument={currentDocument}
                currentPath={currentPath}
                selection={selection}
            />

            {modules
                .map(element => ({element, node: nodes?.[element.dataset.jahiaPath]}))
                .filter(({node}) =>
                    node &&
                    renderPathSet.has(node.path) &&
                    (!isMarkedForDeletion(node) || hasMixin(node, 'jmix:markedForDeletionRoot')) &&
                    isDescendant(node.path, path) &&
                    !isFromReference(node.path, nodes)
                )
                .map(({node, element}) => {
                    const isClicked = Boolean(clickedElement && node.path === clickedElement.path);
                    const isSelected = selectionSet.has(node.path);
                    const isHovered = node.path === hoveredPath;

                    const headerCondition =
                        isClicked ||
                        isSelected ||
                        (isSomethingSelected && !selection.some(sel => isDescendant(node.path, sel)) && isHovered);

                    return (
                        <Box
                            key={element.getAttribute('id')}
                            nodes={nodes}
                            node={node}
                            isClicked={isClicked}
                            isHovered={isHovered}
                            isSelected={isSelected}
                            isSomethingSelected={isSomethingSelected}
                            isHeaderDisplayed={headerCondition}
                            isHeaderHighlighted={isDescendant(hoveredPath, node.path)}
                            isActionsHidden={isSomethingSelected}
                            currentFrameRef={currentFrameRef}
                            element={element}
                            breadcrumbs={headerCondition ? getBreadcrumbsForPath(node) : []}
                            entries={entries}
                            language={language}
                            displayLanguage={uilang}
                            color="default"
                            addIntervalCallback={addIntervalCallback}
                            setDraggedOverlayPosition={setDraggedOverlayPosition}
                            calculateDropTarget={calculateDropTarget}
                            setClickedElement={setClickedElement}
                            // Delegated listeners now; Box should not attach DOM listeners
                            onMouseOver={() => {}}
                            onMouseOut={() => {}}
                            onSelect={onSelect}
                            onClick={onClick}
                            onDoubleClick={onDoubleClick}
                            onSaved={onSaved}
                        />
                    );
                })}

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
