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
import {useNodeDropPB} from '~/JContent/dnd/useNodeDropPB';

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

export const useElemAttributes = ({element, parent}) => {
    // Need to check here if insertionPoint is an original create button or not,
    // otherwise it breaks create button for specific child nodes.
    const isInsertionPoint = element.getAttribute('type') !== 'placeholder';
    const isContainer = element.getAttribute('path') === '*';

    const nodePath = (isInsertionPoint || isContainer) ? null : element.getAttribute('path');
    const nodeName = element.getAttribute('path').split('/').pop();

    let nodeTypes;
    if (parent.getAttribute('nodetypes') &&
        (parent.getAttribute('type') === 'area' || parent.getAttribute('type') === 'absoluteArea')) {
        nodeTypes = parent.getAttribute('nodetypes').split(' ');
    }

    if (element.getAttribute('nodetypes')) {
        nodeTypes = element.getAttribute('nodetypes').split(' ');
    }

    return {nodeName, nodePath, nodeTypes};
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

export const Create = React.memo(({element, node, nodes, addIntervalCallback, clickedElement, onClick, onMouseOver, onMouseOut, onSaved, isInsertionPoint, isVertical, nodeDropData, nodeData}) => {
    const copyPasteNodes = useSelector(state => state.jcontent.copyPaste?.nodes, shallowEqual);
    const parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    const parentPath = parent.getAttribute('path');
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));
    const {nodeName, nodePath} = useElemAttributes({element, parent, isInsertionPoint});
    const [actionVisibility, setActionVisibility] = useState({
        createContent: true,
        paste: true,
        pasteAsReference: true
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

    const [{isCanDrop}, drop] = useNodeDropPB({dropTarget: parent && node, onSaved, nodeDropData});
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
            path={parentPath}
            name={nodePath}
            isDisabled={isDisabled}
            nodeData={nodeData}
            loading={() => false}
            render={btnRenderer}
            onVisibilityChanged={onCreateVisibilityChanged}
            onCreate={onAction(({name}) => reorderNodes([name], nodeName))}
        />
    ), [parentPath, nodePath, isDisabled, nodeData, btnRenderer, onCreateVisibilityChanged, onAction, reorderNodes, nodeName]);

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
            <DisplayAction actionKey="paste"
                           isDisabled={isDisabled}
                           path={parentPath}
                           loading={() => false}
                           render={btnRenderer}
                           onVisibilityChanged={onPasteVisibilityChanged}
                           onAction={onAction(data => reorderNodes(data?.map(d => d?.data?.jcr?.pasteNode?.node?.name), nodeName))}/>
            <DisplayAction actionKey="pasteReference"
                           isDisabled={isDisabled}
                           path={parentPath}
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
    nodeData: PropTypes.object
};
