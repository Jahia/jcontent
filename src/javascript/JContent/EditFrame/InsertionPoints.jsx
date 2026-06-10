import React from 'react';
import {Create} from './Create';
import PropTypes from 'prop-types';
import {useButtonsData} from '~/JContent/EditFrame/Boxes/dataHooks/useButtonsData';
import {useSelector} from 'react-redux';
import {usePasteData} from '~/JContent/EditFrame/Boxes/dataHooks/usePasteData';

const getNodeTypes = e => {
    // The element is placeholder with nodetypes defined, it gives us all the info we need.
    const ownNt = e.getAttribute('nodetypes');
    if (ownNt && e.getAttribute('type') === 'placeholder') {
        return ownNt.split(' ');
    }

    const parentId = e.dataset.jahiaParent;
    if (!parentId) {
        return [];
    }

    const parent = e.ownerDocument.getElementById(parentId);
    if (!parent) {
        return [];
    }

    // If the element is not a placeholder with nodetypes on it, we need to extract nodetype info from existing placeholders on the parent module or the parent module.
    // There can be different cases. The idea is to determine if placeholders provide all the info we need (they do if they all have nodetypes attribute) or if we need to use a
    // combination of placeholder-parent or just parent.
    const parentNt = parent.getAttribute('nodetypes');
    const parentTypes = parentNt ? parentNt.split(' ') : [];

    // Check for wildcard placeholders (path="*") — their nodetypes take priority
    const wildcardPlaceholders = [...parent.querySelectorAll(
        `[type="placeholder"][path="*"][data-jahia-parent="${parentId}"]`
    )];

    if (wildcardPlaceholders.length === 0) {
        return parentTypes;
    }

    // If any wildcard placeholder has no nodetypes, include parent types as well
    const hasUntypedWildcard = wildcardPlaceholders.some(wp => !wp.getAttribute('nodetypes'));
    const wildcardTypes = wildcardPlaceholders
        .flatMap(wp => wp.getAttribute('nodetypes')?.split(' ') ?? []);

    const merged = hasUntypedWildcard ? [...parentTypes, ...wildcardTypes] : wildcardTypes;
    return [...new Set(merged)];
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

    return (
        [
            ...childrenElem.map(({element, node, attributes}) => (
                <Create key={`insertion-point-${element.getAttribute('id')}`}
                        isInsertionPoint
                        isVertical={isVertical}
                        node={node}
                        nodes={nodes}
                        suppliedNodeTypes={attributes.nodeTypes}
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
