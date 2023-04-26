import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ContextualMenu, registry} from '@jahia/ui-extender';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Box} from './Box';
import {Create} from './Create';
import PropTypes from 'prop-types';
import {useMutation} from '@apollo/react-hooks';
import {updateProperty} from '~/JContent/PageComposerRoute/EditFrame/Boxes.gql-mutations';
import {useQuery} from 'react-apollo';
import {BoxesQuery} from '~/JContent/PageComposerRoute/EditFrame/Boxes.gql-queries';
import {hasMixin, isMarkedForDeletion} from '~/JContent/JContent.utils';
import {cmAddSelection, cmClearSelection, cmRemoveSelection} from '../../redux/selection.redux';
import {batchActions} from 'redux-batched-actions';

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

export const Boxes = ({currentDocument, currentFrameRef, addIntervalCallback, onSaved}) => {
    const [inlineEditor] = registry.find({type: 'inline-editor'});
    const dispatch = useDispatch();

    const {language, displayLanguage, selection, path} = useSelector(state => ({
        language: state.language,
        displayLanguage: state.uilang,
        path: state.jcontent.path,
        selection: state.jcontent.selection
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
            setCurrentElement(getModuleElement(currentDocument, event.currentTarget));
        }
    }, [setCurrentElement, currentDocument]);

    const onMouseOut = useCallback(event => {
        event.stopPropagation();
        if (event.relatedTarget && event.currentTarget.dataset.current === 'true' &&
            (getModuleElement(currentDocument, event.currentTarget)?.getAttribute('path') !== getModuleElement(currentDocument, event.relatedTarget)?.getAttribute('path')) &&
            !event.target.closest('#menuHolder')
        ) {
            disableHover.current = false;
            setCurrentElement(null);
        }
    }, [setCurrentElement, currentDocument]);

    const onClick = useCallback(event => {
        event.stopPropagation();
        const element = getModuleElement(currentDocument, event.currentTarget);
        const path = element.getAttribute('path');

        if (selection.includes(path)) {
            dispatch(cmRemoveSelection(path));
        } else if (event.metaKey || event.ctrlKey) {
            dispatch(cmAddSelection(path));
        } else {
            dispatch(batchActions([cmClearSelection(), cmAddSelection(path)]));
        }
    }, [selection, currentDocument]);

    const clearSelection = useCallback(() => {
        if (selection.length === 1) {
            dispatch(cmClearSelection());
        }
    }, [selection, dispatch]);

    const rootElement = useRef();
    const contextualMenu = useRef();

    // Clear selection when clicking outside any module
    useEffect(() => {
        currentDocument.addEventListener('click', clearSelection);

        return () => {
            currentDocument.removeEventListener('click', clearSelection);
        };
    }, [selection, dispatch, currentDocument, clearSelection]);

    useEffect(() => {
        const placeholders = [];
        currentDocument.querySelectorAll('[jahiatype=module]').forEach(element => {
            if (element.getAttribute('path') === '*' || element.getAttribute('type') === 'placeholder') {
                placeholders.push(element);

                let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
                if (!parent) {
                    parent = element.parentElement;
                    while (parent.getAttribute('jahiatype') !== 'module') {
                        parent = parent.parentElement;
                    }

                    element.dataset.jahiaParent = parent.id;
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

        setModules(modules);

        currentDocument.documentElement.querySelector('body').addEventListener('contextmenu', event => {
            const rect = currentFrameRef.current.getBoundingClientRect();
            const dup = new MouseEvent(event.type, {
                ...event,
                clientX: event.clientX + rect.x,
                clientY: event.clientY + rect.y
            });
            contextualMenu.current(dup);

            event.preventDefault();
        });
    }, [currentDocument, currentFrameRef, onMouseOut, onMouseOver]);

    const paths = [...new Set([
        ...modules.map(m => m.dataset.jahiaPath),
        ...placeholders.map(m => m.ownerDocument.getElementById(m.dataset.jahiaParent).dataset.jahiaPath)
    ])];

    const {data} = useQuery(BoxesQuery, {variables: {paths, language, displayLanguage}, errorPolicy: 'all'});

    const nodes = data?.jcr && data.jcr.nodesByPath.reduce((acc, n) => ({...acc, [n.path]: n}), {});

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

    return (
        <div ref={rootElement}>
            <ContextualMenu
                setOpenRef={contextualMenu}
                actionKey={selection.length <= 1 || selection.indexOf(currentPath) === -1 ? 'contentMenu' : 'selectedContentMenu'}
                {...(selection.length === 0 || selection.indexOf(currentPath) === -1) ? {path: currentPath} : (selection.length === 1 ? {path: selection[0]} : {paths: selection})}
            />

            {modules.map(element => ({element, node: nodes?.[element.dataset.jahiaPath]}))
                .filter(({node}) => node && (!isMarkedForDeletion(node) || hasMixin(node, 'jmix:markedForDeletionRoot')))
                .map(({node, element}) => (
                    <Box key={element.getAttribute('id')}
                         node={node}
                         isVisible={element === currentElement || selection.includes(node.path)}
                         isCurrent={element === currentElement}
                         isHeaderDisplayed={(selection.length === 1 && currentElement === null) || element === currentElement}
                         currentFrameRef={currentFrameRef}
                         rootElementRef={rootElement}
                         element={element}
                         entries={entries}
                         language={language}
                         displayLanguage={displayLanguage}
                         color="default"
                         addIntervalCallback={addIntervalCallback}
                         onMouseOver={onMouseOver}
                         onMouseOut={onMouseOut}
                         onClick={onClick}
                         onSaved={onSaved}
                    />
                ))}

            {placeholders.map(element => ({element, node: nodes?.[element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent).getAttribute('path')]}))
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
