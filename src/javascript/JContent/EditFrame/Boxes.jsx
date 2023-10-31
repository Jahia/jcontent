import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ContextualMenu, registry} from '@jahia/ui-extender';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Box} from './Box';
import {Create} from './Create';
import PropTypes from 'prop-types';
import {useMutation} from '@apollo/client';
import {updateProperty} from '~/JContent/EditFrame/Boxes.gql-mutations';
import {useQuery} from '@apollo/client';
import {BoxesQuery} from '~/JContent/EditFrame/Boxes.gql-queries';
import {hasMixin, isDescendant, isMarkedForDeletion} from '~/JContent/JContent.utils';
import {cmAddSelection, cmClearSelection, cmRemoveSelection} from '../redux/selection.redux';
import {batchActions} from 'redux-batched-actions';
import {pathExistsInTree} from '../JContent.utils';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {TableViewModeChangeTracker} from '~/JContent/ContentRoute/ToolBar/ViewModeSelector/tableViewChangeTracker';

const getModuleElement = (currentDocument, target) => {
    let element = target;

    if (element && !element.getAttribute('jahiatype')) {
        element = element.closest('[jahiatype]');
    }

    if (element.getAttribute('jahiatype') === 'createbuttons') {
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

export const Boxes = ({currentDocument, currentFrameRef, addIntervalCallback, onSaved}) => {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const [inlineEditor] = registry.find({type: 'inline-editor'});
    const dispatch = useDispatch();

    const {language, displayLanguage, selection, path, site, uilang} = useSelector(state => ({
        language: state.language,
        displayLanguage: state.uilang,
        path: state.jcontent.path,
        selection: state.jcontent.selection,
        site: state.site,
        uilang: state.uilang
    }), shallowEqual);

    // This is currently moused over element, it changes as mouse is moved even in multiple selection situation.
    // It helps determine box visibility and header visibility.
    const [currentElement, setCurrentElement] = useState();
    const disableHover = useRef(false);
    const [placeholders, setPlaceholders] = useState([]);
    const [modules, setModules] = useState([]);
    const [updatePropertyMutation] = useMutation(updateProperty);

    const onMouseOver = useCallback(event => {
        event.stopPropagation();
        if (!disableHover.current) {
            const target = event.currentTarget;
            window.clearTimeout(timeout);
            timeout = window.setTimeout(() => {
                setCurrentElement(getModuleElement(currentDocument, target));
            }, 100);
        }
    }, [setCurrentElement, currentDocument]);

    const onMouseOut = useCallback(event => {
        event.stopPropagation();
        if (event.relatedTarget && event.currentTarget.dataset.current === 'true' &&
            (getModuleElement(currentDocument, event.currentTarget)?.getAttribute('path') !== getModuleElement(currentDocument, event.relatedTarget)?.getAttribute('path')) &&
            !event.target.closest('#menuHolder')
        ) {
            disableHover.current = false;
            window.clearTimeout(timeout);
            setCurrentElement(null);
        }
    }, [setCurrentElement, currentDocument]);

    const onClick = useCallback(event => {
        const element = getModuleElement(currentDocument, event.currentTarget);
        const path = element.getAttribute('path');
        const isSelected = selection.includes(path);
        const isMultipleSelectionMode = event.metaKey || event.ctrlKey;
        if (event.detail === 1) {
            // Do not handle selection if the target element can be interacted with
            if (disallowSelection(event.target) && !isMultipleSelectionMode) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            if (isMultipleSelectionMode) {
                if (isSelected) {
                    dispatch(cmRemoveSelection(path));
                } else if (!selection.some(element => isDescendant(path, element))) {
                    // Ok so no parent is already selected we can add ourselves
                    let actions = [];
                    actions.push(cmAddSelection(path));
                    // Now we need to remove children if there was any selected as we do not allow multiple selection of parent/children
                    selection.filter(element => isDescendant(element, path)).forEach(selectedChild => actions.push(cmRemoveSelection(selectedChild)));
                    dispatch(batchActions(actions));
                }
            } else if (!isSelected) {
                dispatch(batchActions([cmClearSelection(), cmAddSelection(path)]));
            }
        } else if (event.detail === 2) {
            event.preventDefault();
            event.stopPropagation();
        }

        return false;
    }, [selection, currentDocument, dispatch]);

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
        const placeholders = [];
        currentDocument.querySelectorAll('[jahiatype=module]').forEach(element => {
            if (element.getAttribute('path') === '*' || element.getAttribute('type') === 'placeholder') {
                placeholders.push(element);

                let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
                if (!parent) {
                    parent = element.parentElement;
                    while (parent && parent.getAttribute('jahiatype') !== 'module') {
                        parent = parent.parentElement;
                    }

                    if (parent) {
                        element.dataset.jahiaParent = parent.id;
                    } else {
                        console.warn('Couldn\'t find parent element with jahiatype=module for element ',element);
                        placeholders.pop();
                    }
                }
            }
        });

        setPlaceholders(placeholders);

        const modules = [];
        currentDocument.querySelectorAll('[jahiatype]').forEach(element => {
            const type = element.getAttribute('jahiatype');
            const path = element.getAttribute('path');
            if (type === 'module' && path !== '*') {
                if (path.startsWith('/')) {
                    element.dataset.jahiaPath = path;
                } else {
                    let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
                    element.dataset.jahiaPath = parent.dataset.jahiaPath + '/' + path;
                }

                modules.push(element);
            }
        });

        // Removes invisible selections
        if (selection.length > 0) {
            const toRemove = selection.filter(path => !pathExistsInTree(path, modules, node => node.dataset.jahiaPath));
            if (toRemove.length > 0) {
                if (TableViewModeChangeTracker.modeChanged) {
                    notify(t('jcontent:label.contentManager.selection.removed', {count: toRemove.length}), ['closeButton', 'closeAfter5s']);
                }

                dispatch(cmRemoveSelection(toRemove));
            }
        }

        TableViewModeChangeTracker.resetChanged();

        setModules(modules);

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
    }, [currentDocument, currentFrameRef, onMouseOut, onMouseOver, dispatch, t, notify, selection]);

    const paths = [...new Set([
        ...modules.map(m => m.dataset.jahiaPath),
        ...placeholders.map(m => m.ownerDocument.getElementById(m.dataset.jahiaParent).dataset.jahiaPath)
    ])];

    const {data, refetch} = useQuery(BoxesQuery, {variables: {paths, language, displayLanguage}, errorPolicy: 'all'});

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

    const getBreadcrumbsForPath = path => {
        const breadcrumbs = [];
        const node = nodes[path];

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
        const path = element.getAttribute('path');
        window.CE_API.edit({
            uuid: nodes[path].uuid,
            site: site,
            lang: language,
            uilang,
            isFullscreen: false,
            configName: 'gwtedit'
        });
    }, [nodes, site, language, uilang, currentDocument]);

    useEffect(() => {
        if (inlineEditor) {
            currentDocument.querySelectorAll('[jahiatype=inline]').forEach(element => {
                const path = element.getAttribute('path');
                const property = element.getAttribute('property');
                inlineEditor.callback(element, value => {
                    console.log('Saving to ', path, property, value);
                    updatePropertyMutation({variables: {path, property, language, value}}).then(r => {
                        console.log('Property updated', r);
                    }).catch(e => {
                        console.log('Error', e);
                    });
                });
            });
        }
    }, [currentDocument, inlineEditor, language, updatePropertyMutation]);

    const currentPath = currentElement ? currentElement.getAttribute('path') : path;
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
        pathObject = {path: currentPath, actionKey: 'contentMenu'};
    }

    return (
        <div ref={rootElement}>
            <ContextualMenu
                setOpenRef={contextualMenu}
                currentPath={currentPath}
                {...pathObject}
            />

            {modules.map(element => ({element, node: nodes?.[element.dataset.jahiaPath]}))
                .filter(({node}) => node && (!isMarkedForDeletion(node) || hasMixin(node, 'jmix:markedForDeletionRoot')))
                .map(({node, element}) => (
                    <Box key={element.getAttribute('id')}
                         node={node}
                         isCurrent={element === currentElement}
                         isSelected={selection.includes(node.path)}
                         isHeaderDisplayed={selection.includes(node.path) || (selection.length > 0 && !selection.some(element => isDescendant(node.path, element)) && element === currentElement) || (selection.length === 0 && element === currentElement)}
                         isActionsHidden={selection.length > 0 && !selection.includes(node.path) && element === currentElement}
                         currentFrameRef={currentFrameRef}
                         rootElementRef={rootElement}
                         element={element}
                         breadcrumbs={(selection.includes(node.path) || (selection.length > 0 && !selection.some(element => isDescendant(node.path, element)) && element === currentElement) || (selection.length === 0 && element === currentElement)) ? getBreadcrumbsForPath(node.path) : []}
                         entries={entries}
                         language={language}
                         displayLanguage={displayLanguage}
                         color="default"
                         addIntervalCallback={addIntervalCallback}
                         onMouseOver={onMouseOver}
                         onMouseOut={onMouseOut}
                         onClick={onClick}
                         onDoubleClick={onDoubleClick}
                         onSaved={onSaved}
                    />
                ))}

            {placeholders.map(element => ({
                element,
                node: nodes?.[element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent).getAttribute('path')]
            }))
                .filter(({node}) => node && !isMarkedForDeletion(node))
                .map(({node, element}) => (
                    <Create key={element.getAttribute('id')}
                            node={node}
                            element={element}
                            parent={element}
                            addIntervalCallback={addIntervalCallback}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}
                            onSaved={onSaved}
                    />
                ))}
        </div>
    );
};

Boxes.propTypes = {
    currentDocument: PropTypes.any,
    currentFrameRef: PropTypes.any,
    addIntervalCallback: PropTypes.func,
    onSaved: PropTypes.func
};
