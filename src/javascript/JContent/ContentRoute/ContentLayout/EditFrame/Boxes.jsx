import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ContextualMenu} from '@jahia/ui-extender';
import {useDispatch, useSelector} from 'react-redux';
import {Box} from './Box';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../contentSelection.redux';
import {Create} from './Create';
import PropTypes from 'prop-types';

const getModuleElement = (currentDocument, target) => {
    let element = target;

    if (element && !element.getAttribute('jahiatype')) {
        while (element && !element.getAttribute('jahiatype') && !element.dataset?.jahiaParent) {
            element = element.parentElement;
        }

        if (element?.dataset?.jahiaParent) {
            element = currentDocument.getElementById(element.dataset.jahiaParent);
        }
    }

    return element;
};

const getParentModule = e => {
    let parent = e.parentElement;
    while (parent && parent.getAttribute('jahiatype') !== 'module') {
        parent = parent.parentElement;
    }

    return parent;
};

export const Boxes = ({currentDocument, currentFrameRef, onSaved}) => {
    const {language, selection, path} = useSelector(state => ({
        language: state.language,
        path: state.jcontent.path,
        selection: state.jcontent.selection
    }));

    const dispatch = useDispatch();

    const [currentElement, setCurrentElement] = useState();
    const [placeholders, setPlaceholders] = useState([]);
    const [modules, setModules] = useState([]);

    const onMouseOver = useCallback(event => {
        event.stopPropagation();
        setCurrentElement(getModuleElement(currentDocument, event.currentTarget));
    }, [setCurrentElement, currentDocument]);

    const onMouseOut = useCallback(event => {
        event.stopPropagation();
        if (event.relatedTarget && getModuleElement(event.currentTarget)?.getAttribute('path') !== getModuleElement(event.relatedTarget)?.getAttribute('path')) {
            setCurrentElement(null);
        }
    }, [setCurrentElement]);

    const rootElement = useRef();
    const contextualMenu = useRef();

    useEffect(() => {
        const placeholders = [];
        currentDocument.querySelectorAll('[jahiatype=module]').forEach(elem => {
            if (elem.getAttribute('path') === '*') {
                placeholders.push(elem);
            }
        });

        setPlaceholders(placeholders);

        const modules = [];
        currentDocument.querySelectorAll('[jahiatype]').forEach(elem => {
            const type = elem.getAttribute('jahiatype');
            const path = elem.getAttribute('path');
            if (type === 'module' && path !== '*') {
                elem.addEventListener('mouseover', onMouseOver);
                elem.addEventListener('mouseout', onMouseOut);
                modules.push(elem);
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
            contextualMenu.current.open(dup);

            event.preventDefault();
        });
    }, [currentDocument, currentFrameRef, onMouseOut, onMouseOver]);

    const currentPath = currentElement ? currentElement.getAttribute('path') : path;

    return (
        <div ref={rootElement}>
            <ContextualMenu
                ref={contextualMenu}
                actionKey={selection.length <= 1 || selection.indexOf(currentPath) === -1 ? 'contentMenu' : 'selectedContentMenu'}
                context={selection.length === 0 || selection.indexOf(currentPath) === -1 ? {path: currentPath} : (selection.length === 1 ? {path: selection[0]} : {paths: selection})}
            />

            {modules.map(e => {
                let color = 'hidden';
                const selected = selection.indexOf(e.getAttribute('path')) > -1;
                if (selected) {
                    color = 'accent';
                } else if (e === currentElement) {
                    color = 'default';
                }

                return (
                    <Box key={e.getAttribute('id')}
                         rootElementRef={rootElement}
                         element={e}
                         language={language}
                         color={color}
                         onMouseOver={onMouseOver}
                         onMouseOut={onMouseOut}
                         onSaved={onSaved}
                         onSelect={() => {
                             dispatch(cmSwitchSelection(e.getAttribute('path')));
                         }}
                         onGoesUp={selected && getParentModule(e) && (event => {
                             event.stopPropagation();
                             let parent = getParentModule(e);

                             if (parent) {
                                 dispatch(cmRemoveSelection(e.getAttribute('path')));
                                 dispatch(cmAddSelection(parent.getAttribute('path')));
                             }
                         })}
                    />
                );
            })}
            {placeholders.map(elem => (
                <Create key={elem.getAttribute('id')}
                        element={elem}
                        parent={elem}
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
    onSaved: PropTypes.func
};
