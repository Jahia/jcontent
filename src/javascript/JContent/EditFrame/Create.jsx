import React, {useCallback, useEffect, useMemo, useState} from 'react';

import styles from './Create.scss';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import clsx from 'clsx';
import editStyles from './EditFrame.scss';
import {useDragLayer} from 'react-dnd';
import {shallowEqual, useSelector} from 'react-redux';
import {getCoords} from '~/JContent/EditFrame/EditFrame.utils';
import {useApolloClient} from '@apollo/client';
import {SavePropertiesMutation} from '~/ContentEditor/ContentEditor/updateNode/updateNode.gql-mutation';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';

const ButtonRenderer = getButtonRenderer({
    showTooltip: false,
    defaultButtonProps: {color: 'default'}
});

const ButtonRendererNoLabel = getButtonRenderer({
    labelStyle: 'none',
    showTooltip: true
});

function getBoundingBox(element) {
    const rect = getCoords(element);
    return {
        ...rect,
        maxWidth: rect.width,
        minHeight: 28
    };
}

function reposition(element, currentOffset, setCurrentOffset) {
    const box = getBoundingBox(element);
    if (box.top !== currentOffset.top || box.left !== currentOffset.left || box.width !== currentOffset.width || box.height !== currentOffset.height) {
        setCurrentOffset(box);
    }
}

/**
 * There are several types of placeholders and several ways in which node types can be resolved.
 *
 * Definition of multiple children of types a and b
 * <div id="moduleABC" jahiatype="module" nodetypes="a b">
 *      <div type="placeholder" path="*"/>
 * </div>
 *
 * Definition of a single named child a and multiple children of type b
 * <div id="moduleABC" jahiatype="module" nodetypes="b">
 *     <div type="placeholder" path="childName" nodetypes="a"/>
 *     <div type="placeholder" path="*"/>
 * </div>
 *
 * If named child is added the placehoder will be replaced by <div type="existingNode" />. This is true for all named children.
 *
 * Definition of multiple named children of type a and b (it could also be just one child). Note that the parent no longer has nodetypes.
 * <div id="moduleABC" jahiatype="module">
 *     <div type="placeholder" path="childName" nodetypes="a"/>
 *     <div type="placeholder" path="childName" nodetypes="b"/>
 * </div>
 */
export const getElemAttributes = ({element, parent}) => {
    // Need to check here if insertionPoint is an original create button or not,
    // otherwise it breaks create button for specific child nodes.
    const isInsertionPoint = element.getAttribute('type') !== 'placeholder';
    const isMultipleChildPlaceholder = element.getAttribute('path') === '*';

    const nodePath = (isInsertionPoint || isMultipleChildPlaceholder) ? null : element.getAttribute('path');
    const nodeName = element.getAttribute('path').split('/').pop();

    // Nodetypes should not be undefined here because if nothing is found nothing should be used
    let nodeTypes = [];
    let parentAreaType;
    if (parent.getAttribute('nodetypes')) {
        nodeTypes = parent.getAttribute('nodetypes').split(' ');
        parentAreaType = parent.getAttribute('type');
    }

    if (element.getAttribute('nodetypes')) {
        nodeTypes = element.getAttribute('nodetypes').split(' ');
    }

    return {nodeName, nodePath, nodeTypes, parentAreaType};
};

const useReorderNodes = ({parentPath}) => {
    const client = useApolloClient();
    const reorderNodes = (names, beforeNodeName) => {
        if (!Array.isArray(names) || !names.filter(Boolean).length) {
            return;
        }

        names = names.filter(Boolean);
        names.push(beforeNodeName);
        console.debug(`Reordering node ${names.join(',')}`);
        client.mutate({
            variables: {
                uuid: parentPath,
                shouldModifyChildren: true,
                shouldRename: false,
                newName: '',
                propertiesToSave: [],
                propertiesToDelete: [],
                mixinsToAdd: [],
                mixinsToDelete: [],
                wipInfo: {
                    status: 'DISABLED',
                    languages: []
                },
                shouldSetWip: false,
                childrenOrder: names
            },
            mutation: SavePropertiesMutation
        }).then(() => {
            console.debug(`Node ${names.join(',')} reordered`);
        }, error => {
            console.error(`Error reordering node ${names.join(',')}: ${error}`);
        }).finally(() => {
            setTimeout(triggerRefetchAll, 0);
        });
    };

    return {reorderNodes};
};

export const Create = React.memo(({element, node, nodes, addIntervalCallback, clickedElement, onClick, onMouseOver, onMouseOut, onSaved, isInsertionPoint, isVertical, nodeDropData, nodeData, pasteData}) => {
    const copyPasteNodes = useSelector(state => state.jcontent.copyPaste?.nodes, shallowEqual);
    const parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    const parentPath = parent.getAttribute('path');
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));
    const {nodeName, nodePath, nodeTypes} = getElemAttributes({element, parent, isInsertionPoint});
    const [actionVisibility, setActionVisibility] = useState({
        createContent: false,
        paste: false,
        pasteAsReference: false
    });
    const [onCreateVisibilityChanged, onPasteVisibilityChanged, onPasteReferenceVisibilityChanged] =
        useMemo(() => ['createContent', 'paste', 'pasteReference'].map(key => {
            return visible => setActionVisibility(prev => ({...prev, [key]: visible}));
        }), [setActionVisibility]);

    // Used mostly when rendering insertion points as we only want to style it specifically if it's not empty,
    // otherwise we use the regular buttons; Also used to create space for empty areas and lists.
    const isEmpty = (element.getAttribute('type') === 'placeholder' && !nodePath) ?
        node?.subNodes.pageInfo.totalCount === 0 : Boolean(nodes) && !nodes[element.dataset.jahiaPath];

    // Set a minimum height to be able to drop content if node is empty
    useEffect(() => {
        if (!Object.keys(actionVisibility).some(key => actionVisibility[key])) {
            element.style['min-height'] = '0px';
        } else if (isEmpty) {
            element.style['min-height'] = '96px';
            [...parent.childNodes].find(node => node.nodeType === Node.TEXT_NODE)?.remove();
            setCurrentOffset(getBoundingBox(element));
        } else {
            element.style['min-height'] = '28px';
        }
    }, [node, parent, element, isEmpty, actionVisibility]);

    const [{isCanDrop}, drop] = useNodeDrop({dropTarget: parent && node, onSaved, nodeDropData, isUseDropData: true});
    const {anyDragging} = useDragLayer(monitor => ({
        anyDragging: monitor.isDragging()
    }));

    useEffect(
        () => addIntervalCallback(() => reposition(element, currentOffset, setCurrentOffset)),
        [addIntervalCallback, currentOffset, element, setCurrentOffset]);

    // We want this to execute only once in the beginning
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => reposition(element, currentOffset, setCurrentOffset), []);

    useEffect(() => {
        if (isCanDrop) {
            element.classList.add(styles.dropTarget);
        }

        return () => {
            element.classList.remove(styles.dropTarget);
        };
    }, [isCanDrop, element]);

    const {reorderNodes} = useReorderNodes({parentPath});

    const sizers = [...Array(10).keys()].filter(i => currentOffset.width < i * 150).map(i => `sizer${i}`);
    const isDisabled = clickedElement && clickedElement.path !== parentPath;
    const btnRenderer = useMemo(() => {
        return (isInsertionPoint && !isEmpty) ? ButtonRendererNoLabel : ButtonRenderer;
    }, [isInsertionPoint, isEmpty]);

    const insertionStyle = {};
    if (isInsertionPoint && !isEmpty) {
        insertionStyle.height = 0;
        insertionStyle.zIndex = 1000000;

        if (isVertical) {
            const btnWidth = 42;
            insertionStyle.height = element.offsetHeight;
            insertionStyle.width = btnWidth;
            insertionStyle.left = currentOffset.left - (btnWidth / 2);
            insertionStyle.flexDirection = 'column';
        } else {
            insertionStyle.top = currentOffset.top - 16;
        }
    }

    const onAction = useCallback(onActionFn => {
        const needsReorder = element.getAttribute('type') !== 'placeholder';
        return data => {
            if (needsReorder) {
                onActionFn(data);
            }
        };
    }, [element]);

    const createAction = useMemo(() => (
        <DisplayAction
            actionKey="createContentPB"
            nodeTypes={nodeTypes}
            path={parentPath}
            name={nodePath}
            isDisabled={isDisabled}
            nodeData={nodeData}
            loading={() => false}
            render={btnRenderer}
            onVisibilityChanged={onCreateVisibilityChanged}
            onCreate={onAction(({name}) => reorderNodes([name], nodeName))}
        />
    ), [parentPath, nodePath, isDisabled, nodeData, btnRenderer, onCreateVisibilityChanged, onAction, reorderNodes, nodeName, nodeTypes]);

    return !anyDragging && (
        <div ref={drop}
             jahiatype="createbuttons" // eslint-disable-line react/no-unknown-property
             data-jahia-id={element.getAttribute('id')}
             className={clsx(
                 styles.root,
                 editStyles.enablePointerEvents,
                 sizers,
                 (isInsertionPoint) && styles.insertionPoint,
                 isEmpty ? styles.isEmpty : styles.isNotEmpty
             )}
             style={{...currentOffset, ...insertionStyle}}
             data-jahia-parent={parent.getAttribute('id')}
             onMouseOver={onMouseOver}
             onMouseOut={onMouseOut}
             onClick={onClick}
        >
            {copyPasteNodes.length === 0 && createAction}
            <DisplayAction isUseActionData
                           actionKey="paste"
                           isDisabled={isDisabled}
                           path={parentPath}
                           loading={() => false}
                           actionData={pasteData?.resPaste?.nodes?.[parentPath]}
                           render={btnRenderer}
                           onVisibilityChanged={onPasteVisibilityChanged}
                           onAction={onAction(data => reorderNodes(data?.map(d => d?.data?.jcr?.pasteNode?.node?.name), nodeName))}/>
            <DisplayAction isUseActionData
                           actionKey="pasteReference"
                           isDisabled={isDisabled}
                           path={parentPath}
                           actionData={pasteData?.resPasteRef?.nodes?.[parentPath]}
                           referenceTypes={['jnt:contentReference']}
                           loading={() => false}
                           render={btnRenderer}
                           onVisibilityChanged={onPasteReferenceVisibilityChanged}
                           onAction={onAction(data => reorderNodes(data?.map(d => d?.data?.jcr?.pasteNode?.node?.name), nodeName))}/>
        </div>
    );
});

Create.propTypes = {
    element: PropTypes.any,
    clickedElement: PropTypes.any,
    node: PropTypes.any,
    nodes: PropTypes.object,
    addIntervalCallback: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onSaved: PropTypes.func,
    onClick: PropTypes.func,
    isInsertionPoint: PropTypes.bool,
    isVertical: PropTypes.bool,
    nodeDropData: PropTypes.object,
    nodeData: PropTypes.object,
    pasteData: PropTypes.object
};
