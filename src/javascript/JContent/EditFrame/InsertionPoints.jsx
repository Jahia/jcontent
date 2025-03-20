import React from 'react';
import {Create} from './Create';
import PropTypes from 'prop-types';

const InsertionPoints = ({currentDocument, clickedElement, nodes, addIntervalCallback, onSaved}) => {
    if (!clickedElement) {
        return null;
    }

    const clickedPath = clickedElement.element.getAttribute('path');

    const originalInsertionButtons = [...currentDocument.querySelectorAll(`[type="placeholder"][data-jahia-parent=${clickedElement.element.id}]`)]
        .map(e => ({
            element: e,
            parentNode: nodes?.[e.dataset.jahiaParent && e.ownerDocument.getElementById(e.dataset.jahiaParent).getAttribute('path')]
        }));

    // Get all children of the clicked element that are create content buttons [type="existingNode"] and add insertion points for each
    const childrenElem = [...currentDocument.querySelectorAll(`[type="existingNode"][data-jahia-parent=${clickedElement.element.id}]`)]
        // Need to make sure that existingNode is not a weakreference but a subnode, which we can do by checking subpath
        .filter(e => e.getAttribute('path').startsWith(clickedPath))
        .map(e => ({
            element: e,
            parentNode: nodes?.[e.dataset.jahiaParent && e.ownerDocument.getElementById(e.dataset.jahiaParent).getAttribute('path')]
        }));

    // Check only first two elements to know alignment.
    const isVertical = childrenElem.length > 1 && childrenElem[1].element.getBoundingClientRect().left > childrenElem[0].element.getBoundingClientRect().left;

    return (
        [
            ...childrenElem.map(({element, parentNode}) => (
                <Create key={`insertion-point-${element.getAttribute('id')}`}
                        isInsertionPoint
                        isVertical={isVertical}
                        node={parentNode}
                        nodes={nodes}
                        element={element}
                        addIntervalCallback={addIntervalCallback}
                        onMouseOver={() => {}}
                        onMouseOut={() => {}}
                        onSaved={onSaved}
                />
            )),
            ...originalInsertionButtons.map(({element, parentNode}) => (
                // Insertion point for original placeholder, this is necessary since default placeholders are muted once something is clicked
                <Create key={`insertion-point-${element.getAttribute('id')}`}
                        isInsertionPoint
                        node={parentNode}
                        nodes={nodes}
                        element={element}
                        addIntervalCallback={addIntervalCallback}
                        onMouseOver={() => {}}
                        onMouseOut={() => {}}
                        onSaved={onSaved}
                />
            ))
        ]
    );
};

InsertionPoints.propTypes = {
    currentDocument: PropTypes.any,
    clickedElement: PropTypes.object,
    nodes: PropTypes.object,
    addIntervalCallback: PropTypes.func,
    onSaved: PropTypes.func
};

export default InsertionPoints;
