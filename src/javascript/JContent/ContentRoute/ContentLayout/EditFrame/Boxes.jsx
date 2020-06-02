import React, {useEffect, useRef, useState} from 'react';
import {ContextualMenu} from '@jahia/ui-extender';
import {useDispatch, useSelector} from 'react-redux';
import {Box} from './Box';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../contentSelection.redux';
import {Create} from './Create';
import PropTypes from 'prop-types';

export const Boxes = ({currentDocument}) => {
    const {language, selection, path} = useSelector(state => ({
        language: state.language,
        path: state.jcontent.path,
        selection: state.jcontent.selection
    }));

    const dispatch = useDispatch();

    const [currentElements, setCurrentElements] = useState([]);
    const [placeholders, setPlaceholders] = useState([]);

    const addCurrentElement = element => {
        setCurrentElements(elements => [...elements, element]);
    };

    const removeCurrentElement = element => {
        setCurrentElements(elements => elements.filter(el => el !== element));
    };

    const contextualMenu = useRef();

    useEffect(() => {
        const placeholders = [];
        currentDocument.querySelectorAll('[jahiatype=module]').forEach(elem => {
            if (elem.getAttribute('path') === '*') {
                placeholders.push(elem);
            }
        });

        setPlaceholders(placeholders);

        currentDocument.querySelectorAll('[jahiatype]').forEach(elem => {
            const type = elem.getAttribute('jahiatype');
            const path = elem.getAttribute('path');
            if (type === 'module' && path !== '*') {
                elem.addEventListener('mouseenter', event => addCurrentElement(event.currentTarget));
                elem.addEventListener('mouseleave', event => removeCurrentElement(event.currentTarget));
            }
        });

        currentDocument.documentElement.querySelector('body').addEventListener('contextmenu', event => {
            const rect = window.frames['page-composer-frame'].getBoundingClientRect();
            const dup = new MouseEvent(event.type, {
                ...event,
                clientX: event.clientX + rect.x,
                clientY: event.clientY + rect.y
            });
            contextualMenu.current.open(dup);

            event.preventDefault();
        });
    }, [currentDocument]);

    let currentElement = currentElements.length > 0 && currentElements[currentElements.length - 1];

    if (currentElement?.dataset?.jahiaParent) {
        currentElement = currentDocument.getElementById(currentElement.dataset.jahiaParent);
    }

    const currentPath = currentElement ? currentElement.getAttribute('path') : path;

    return (
        <>
            <ContextualMenu
                ref={contextualMenu}
                actionKey={selection.length === 0 || selection.indexOf(currentPath) === -1 ? 'contentMenu' : 'selectedContentMenu'}
                context={selection.length === 0 || selection.indexOf(currentPath) === -1 ? {path: currentPath} : {paths: selection}}
            />

            {currentElement && selection.indexOf(currentPath === -1) && (
                <Box element={currentElement}
                     language={language}
                     color="Hover"
                     onMouseEnter={addCurrentElement}
                     onMouseLeave={removeCurrentElement}
                     onSelect={() => {
                         dispatch(cmSwitchSelection(currentPath));
                     }}
                />
            )}
            {selection.map(p => currentDocument.querySelector(`[jahiatype][path="${p}"]`)).filter(e => e).map(e => (
                <Box key={e.getAttribute('id')}
                     element={e}
                     language={language}
                     color="Selection"
                     onSelect={() => {
                         dispatch(cmSwitchSelection(e.getAttribute('path')));
                     }}
                     onGoesUp={event => {
                         event.stopPropagation();
                         let parent = e.parentElement;
                         while (parent && parent.getAttribute('jahiatype') !== 'module') {
                             parent = parent.parentElement;
                         }

                         if (parent) {
                             dispatch(cmRemoveSelection(e.getAttribute('path')));
                             dispatch(cmAddSelection(parent.getAttribute('path')));
                         }
                     }}
                />
            ))}
            {placeholders.map(elem => (
                <Create key={elem.getAttribute('id')}
                        element={elem}
                        parent={elem}
                        onMouseEnter={addCurrentElement}
                        onMouseLeave={removeCurrentElement}
                />
            ))}

        </>
    );
};

Boxes.propTypes = {
    currentDocument: PropTypes.any
};
