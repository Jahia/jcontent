import React from 'react';
import {Create} from './Create';
import PropTypes from 'prop-types';
import {useButtonsData} from '~/JContent/EditFrame/Boxes/dataHooks/useButtonsData';
import {useSelector} from 'react-redux';
import {usePasteData} from '~/JContent/EditFrame/Boxes/dataHooks/usePasteData';
import {JahiaRenderedModulesUtil} from '../JContent.utils';

/**
 * Resolves the parent module's JCR path from a child element's data-jahia-parent attribute.
 */
const resolveParentPath = e => {
    return e.dataset.jahiaParent && e.ownerDocument.getElementById(e.dataset.jahiaParent)?.getAttribute('path');
};

/**
 * A child only warrants an insertion point if it actually renders something visible: it must
 * contain at least one element that is not display:none. A fully hidden child would otherwise get
 * a stray insertion point positioned over nothing.
 */
const hasVisibleContent = e => {
    const view = e.ownerDocument.defaultView;
    return [...e.children].some(child => view.getComputedStyle(child).display !== 'none');
};

/**
 * This function helps resolve required nodetypes for insertion points.
 *
 * Why is this necessary?
 *
 * Normally create buttons are resolved using existing placeholders (dedicated html with nodetype info, path etc.). You can see this in
 * Create.jsx. With insertion points things get a little more complicated as we want to inject whatever the module accepts at the top of evert child
 * (everything with data-jahia-parent on it) in addition to existing placeholders. Because the elements we find are no longer uniform (not just placeholders) we cannot rely on
 * the mechanism in Create.jsx (getElemAttributes) to resolve nodetype info.
 *
 * This mechanism looks at several cases:
 *
 * 1. Found child is a placeholder (this means existing create button placeholder). If this placeholder has nodetype info then we need to use this info to get data about nodetypes.
 * 2. Cases when we cannot resolve parent module id or fail to get the module return no node type information.
 *
 * Before I go further, it's helpful to note that there is an issue in Jahia with how it resolves contribute types, which can lead to a situation
 * when the module and its placeholders will have mismatching info. So if it's a list which normally accepts jmix:droppableContent and contribute types
 * are configured to accept a, b and c then the module will have jmix:droppableContent in nodetypes while the placeholder for path="*" (accepting multiple children) will have a, b and c.
 * The correct way of generating html in this case would be to have a, b and c in both cases, but ConstraintsHelper.getConstraints() does not take into account
 * contribute types (it is not something we can easily modify due to potential side effects as it is used in many places).
 *
 * 3. Node type info is available on the parent module and can potentially be used to compute constraints (there can be an exception, see 4).
 * 4. There is a placeholder child with path="*" AND nodetype info defined then we use this nodetype info (see comment above).
 * 5. There is also potential for the case when there is placehoder with nodetype info and one without, in which case we want to get data for nodetypes from both locations.
 */
const getPlaceholderNodeTypes = (e, parentPath) => {
    // The element is placeholder with nodetypes defined, it gives us all the info we need.
    const ownNt = e.getAttribute('nodetypes');
    if (ownNt) {
        return ownNt.split(' ');
    }

    // Fallback: resolve wildcard placeholder nodetypes from pre-computed module info
    return JahiaRenderedModulesUtil.resolveNodeTypes(parentPath);
};

const InsertionPoints = ({currentDocument, clickedElement, nodes, addIntervalCallback, onSaved}) => {
    const {language, uilang} = useSelector(state => ({language: state.language, uilang: state.uilang}));
    const clickedPath = clickedElement.element.getAttribute('path');

    const originalInsertionButtons = [...currentDocument.querySelectorAll(`[type="placeholder"][data-jahia-parent=${clickedElement.element.id}]`)]
        .map(e => {
            const parentPath = resolveParentPath(e);
            return {
                element: e,
                node: nodes?.[parentPath],
                attributes: {nodeTypes: getPlaceholderNodeTypes(e, parentPath)}
            };
        })
        .filter(({node}) => node !== null && node !== undefined);

    // Get all children of the clicked element that are [type="existingNode"] and add insertion points for each (insertion points appear on top)
    const childrenElem = [...currentDocument.querySelectorAll(`[data-jahia-parent=${clickedElement.element.id}]`)]
        // Need to make sure that existingNode is not a weakreference but a subnode, which we can do by checking subpath.
        // Also require the child to render at least one visible element, otherwise its insertion point has nothing to anchor to.
        .filter(e => e.getAttribute('path')?.startsWith(clickedPath) && e.getAttribute('type') !== 'placeholder' && hasVisibleContent(e))
        .map(e => {
            const parentPath = resolveParentPath(e);
            return {
                element: e,
                node: nodes?.[parentPath],
                attributes: {nodeTypes: JahiaRenderedModulesUtil.resolveNodeTypes(parentPath)}
            };
        })
        .filter(({node, attributes}) => node !== null && node !== undefined && attributes?.nodeTypes?.length > 0);

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
