import React from 'react';
import {Create} from './Create';
import PropTypes from 'prop-types';
import {useButtonsData} from '~/JContent/EditFrame/Boxes/dataHooks/useButtonsData';
import {useSelector} from 'react-redux';
import {usePasteData} from '~/JContent/EditFrame/Boxes/dataHooks/usePasteData';

const getNodeTypes = e => {
    const types = new Set();

    const ownNt = e.getAttribute('nodetypes');
    // Get own types only for placeholders (actual buttons) and avoid getting them from existingNodetypes (rendered modules)
    if (ownNt && e.getAttribute('type') === 'placeholder') {
        ownNt.split(' ').forEach(t => types.add(t));
    }

    if (e.dataset.jahiaParent) {
        const parent = e.ownerDocument.getElementById(e.dataset.jahiaParent);
        const parentNt = parent?.getAttribute('nodetypes');
        if (parentNt) {
            parentNt.split(' ').forEach(t => types.add(t));
        }

        // This means that there's a defined placeholder and we want to use its nodetypes information for the insertion point.
        // This prevents an issue where the parent can have a different nodetypes value which happens because getConstraints is not taking into account
        // contribute types.
        if (parent) {
            const wildcardPlaceholders = parent.querySelectorAll(
                `[type="placeholder"][path="*"][data-jahia-parent="${e.dataset.jahiaParent}"]`
            );
            if (wildcardPlaceholders.length > 0) {
                types.clear();
                wildcardPlaceholders.forEach(wp => {
                    const wildcardNt = wp.getAttribute('nodetypes');
                    if (wildcardNt) {
                        wildcardNt.split(' ').forEach(t => types.add(t));
                    }
                });
            }
        }

    }

    return [...types];
};

const InsertionPoints = ({currentDocument, clickedElement, nodes, addIntervalCallback, onSaved}) => {
    const {language, uilang} = useSelector(state => ({language: state.language, uilang: state.uilang}));
    const clickedPath = clickedElement.element.getAttribute('path');

    const originalInsertionButtons = [...currentDocument.querySelectorAll(`[type="placeholder"][data-jahia-parent=${clickedElement.element.id}]`)]
        .map(e => ({
            element: e,
            node: nodes?.[e.dataset.jahiaParent && e.ownerDocument.getElementById(e.dataset.jahiaParent).getAttribute('path')],
            attributes: {nodeTypes: getNodeTypes(e)}
        }))
        .filter(({node}) => node !== null && node !== undefined);

    // Get all children of the clicked element that are [type="existingNode"] and add insertion points for each (insertion points appear on top)
    const childrenElem = [...currentDocument.querySelectorAll(`[data-jahia-parent=${clickedElement.element.id}]`)]
        // Need to make sure that existingNode is not a weakreference but a subnode, which we can do by checking subpath
        .filter(e => e.getAttribute('path')?.startsWith(clickedPath))
        .map(e => ({
            element: e,
            node: nodes?.[e.dataset.jahiaParent && e.ownerDocument.getElementById(e.dataset.jahiaParent).getAttribute('path')],
            attributes: {nodeTypes: getNodeTypes(e)}
        }))
        .filter(({node}) => node !== null && node !== undefined);

    // Check only first two elements to know alignment.
    const isVertical = childrenElem.length > 1 && childrenElem[1].element.getBoundingClientRect().left > childrenElem[0].element.getBoundingClientRect().left;

    const originalData = useButtonsData({createButtons: originalInsertionButtons, language, uilang});
    const childData = useButtonsData({createButtons: childrenElem, language, uilang});
    const pasteData = usePasteData({createButtons: [...originalInsertionButtons, ...childrenElem], language});

    console.log('A', childData)
    console.log('B', originalData)
    return (
        [
            ...childrenElem.map(({element, node, attributes}) => (
                <Create key={`insertion-point-${element.getAttribute('id')}`}
                        isInsertionPoint
                        isVertical={isVertical}
                        node={node}
                        nodes={nodes}
                        nt={attributes.nodeTypes}
                        nodeData={childData?.nodes?.[node.path]}
                        pasteData={pasteData}
                        element={element}
                        addIntervalCallback={addIntervalCallback}
                        onMouseOver={() => {}}
                        onMouseOut={() => {}}
                        onSaved={onSaved}
                />
            )),
            ...originalInsertionButtons.map(({element, node}) => (
                // Insertion point for original placeholder, this is necessary since default placeholders are muted once something is clicked
                <Create key={`insertion-point-${element.getAttribute('id')}`}
                        isInsertionPoint
                        node={node}
                        nodes={nodes}
                        nodeData={originalData?.nodes?.[node.path]}
                        pasteData={pasteData}
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
