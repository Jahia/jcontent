import React, {useEffect, useRef, useState} from 'react';

import styles from './Create.scss';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import clsx from 'clsx';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import editStyles from './EditFrame.scss';
import {useDragLayer} from 'react-dnd';
import {shallowEqual, useSelector} from 'react-redux';
import {getCoords} from '~/JContent/EditFrame/EditFrame.utils';
import {useApolloClient} from '@apollo/client';
import {SavePropertiesMutation} from '~/ContentEditor/ContentEditor/updateNode/updateNode.gql-mutation';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';

const ButtonRenderer = getButtonRenderer({
    showTooltip: true,
    defaultButtonProps: {color: 'default'},
    defaultTooltipProps: {placement: 'top', classes: {popper: styles.tooltipPopper}}}
);

const ButtonRendererNoLabel = getButtonRenderer({
    labelStyle: 'none',
    showTooltip: true,
    defaultTooltipProps: {placement: 'top', classes: {popper: styles.tooltipPopper}}
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

const useElemAttributes = ({element, parent}) => {
    // Need to check here if insertionPoint is an original create button or not,
    // otherwise it breaks create button for specific child nodes.
    const isInsertionPoint = element.getAttribute('type') !== 'placeholder';
    const isContainer = element.getAttribute('path') === '*';

    const nodePath = (isInsertionPoint || isContainer) ? null : element.getAttribute('path');
    const nodeName = element.getAttribute('path').split('/').pop();

    let nodeTypes = null;
    if (parent.getAttribute('nodetypes') &&
        (parent.getAttribute('type') === 'area' || parent.getAttribute('type') === 'absoluteArea')) {
        nodeTypes = parent.getAttribute('nodetypes').split(' ');
    } else if (element.getAttribute('nodetypes')) {
        nodeTypes = element.getAttribute('nodetypes').split(' ');
    }

    // Extract limit defined on template set
    let templateLimit = null;
    if (parent.getAttribute('listLimit') &&
        (parent.getAttribute('type') === 'area' || parent.getAttribute('type') === 'absoluteArea')) {
        templateLimit = Number(parent.getAttribute('listLimit'));
    }

    return {nodeName, nodePath, nodeTypes, templateLimit};
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

export const Create = React.memo(({element, node, nodes, addIntervalCallback, clickedElement, onClick, onMouseOver, onMouseOut, onSaved, isInsertionPoint, isVertical}) => {
    const copyPasteNodes = useSelector(state => state.jcontent.copyPaste?.nodes, shallowEqual);
    const parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    const parentPath = parent.getAttribute('path');
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));
    const {nodeName, nodePath, nodeTypes, templateLimit} = useElemAttributes({element, parent, isInsertionPoint});

    // Used mostly when rendering insertion points as we only want to style it specifically if it's not empty,
    // otherwise we use the regular buttons; Also used to create space for empty areas and lists.
    const isPlaceholder = element.getAttribute('type') === 'placeholder';
    const isEmpty = (isPlaceholder && !nodePath) ?
        node?.subNodes.pageInfo.totalCount === 0 : !nodes[element.dataset.jahiaPath];

    // Set a minimum height to be able to drop content if node is empty
    useEffect(() => {
        if (isEmpty) {
            element.style['min-height'] = '96px';
            [...parent.childNodes].find(node => node.nodeType === Node.TEXT_NODE)?.remove();
            setCurrentOffset(getBoundingBox(element));
        } else {
            element.style['min-height'] = '28px';
        }
    }, [node, parent, element, isEmpty]);

    const [{isCanDrop}, drop] = useNodeDrop({dropTarget: parent && node, onSaved});
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

    const tooltipProps = {enterDelay: 800, PopperProps: {container: element.ownerDocument.getElementById('jahia-portal-root')}};
    const sizers = [...Array(10).keys()].filter(i => currentOffset.width < i * 150).map(i => `sizer${i}`);
    const isDisabled = clickedElement && clickedElement.path !== parentPath;
    const btnRenderer = (isInsertionPoint && !isEmpty) ? ButtonRendererNoLabel : ButtonRenderer;

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

    const onAction = onActionFn => {
        const needsReorder = element.getAttribute('type') !== 'placeholder';
        return data => {
            if (needsReorder) {
                onActionFn(data);
            }
        };
    };

    const createButtonRef = useRef(null);

    useEffect(() => {
        // Hide placeholder if not possible to add any content to the list
        // and insertion points/buttons are not shown
        const callback = () => {
            if (isPlaceholder && !isEmpty && createButtonRef.current?.children?.length === 0) {
                element.style.display = 'none';
            } else {
                element.style.display = undefined;
            }
        };

        // Observe the create button because its children are updated outside of this component
        const observer = new MutationObserver(callback);
        observer.observe(createButtonRef.current, {childList: true});
        callback();

        return () => observer.disconnect();
    }, [isPlaceholder, isEmpty, createButtonRef, element]);

    return !anyDragging && (
        <div
            ref={el => {
                drop(el);
                createButtonRef.current = el;
            }}
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
            {copyPasteNodes.length === 0 &&
                <DisplayAction actionKey="createContent"
                               tooltipProps={tooltipProps}
                               path={parentPath}
                               name={nodePath}
                               isDisabled={isDisabled}
                               nodeTypes={nodeTypes}
                               templateLimit={templateLimit}
                               loading={() => false}
                               render={btnRenderer}
                               onCreate={onAction(({name}) => reorderNodes([name], nodeName))}/>}
            <DisplayAction actionKey="paste"
                           tooltipProps={tooltipProps}
                           isDisabled={isDisabled}
                           path={parentPath}
                           loading={() => false}
                           render={btnRenderer}
                           onAction={onAction(data => reorderNodes(data?.map(d => d?.data?.jcr?.pasteNode?.node?.name), nodeName))}/>
            <DisplayAction actionKey="pasteReference"
                           tooltipProps={tooltipProps}
                           isDisabled={isDisabled}
                           path={parentPath}
                           loading={() => false}
                           render={btnRenderer}
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
    isVertical: PropTypes.bool
};
