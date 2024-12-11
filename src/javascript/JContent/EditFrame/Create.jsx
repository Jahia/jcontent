import React, {useEffect, useState} from 'react';

import styles from './Create.scss';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import clsx from 'clsx';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import editStyles from './EditFrame.scss';
import {useDragLayer} from 'react-dnd';
import {useSelector} from 'react-redux';
import {getCoords} from '~/JContent/EditFrame/EditFrame.utils';
import {useApolloClient} from '@apollo/client';
import {SavePropertiesMutation} from '~/ContentEditor/ContentEditor/updateNode/updateNode.gql-mutation';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';

const ButtonRenderer = getButtonRenderer({
    showTooltip: true,
    defaultButtonProps: {color: 'default'},
    defaultTooltipProps: {placement: 'top', classes: {popper: styles.tooltipPopper}}}
);

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
};

const useElemAttributes = ({element, parent, isInsertionPoint}) => {
    const nodePath = (element.getAttribute('path') === '*' || isInsertionPoint) ? null : element.getAttribute('path');
    const nodeName = element.getAttribute('path').split('/').pop();

    let nodeTypes = null;
    if (element.getAttribute('nodetypes')) {
        nodeTypes = element.getAttribute('nodetypes').split(' ');
    } else if (parent.getAttribute('nodetypes') &&
        (parent.getAttribute('type') === 'area' || parent.getAttribute('type') === 'absoluteArea')) {
        nodeTypes = parent.getAttribute('nodetypes').split(' ');
    }

    // Extract limit defined on template set
    let templateLimit = null;
    if (parent.getAttribute('listLimit') &&
        (parent.getAttribute('type') === 'area' || parent.getAttribute('type') === 'absoluteArea')) {
        templateLimit = Number(parent.getAttribute('listLimit'));
    }
    return {nodeName, nodePath, nodeTypes, templateLimit};
}

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
                newName: "",
                propertiesToSave: [],
                propertiesToDelete: [],
                mixinsToAdd: [],
                mixinsToDelete: [],
                wipInfo: {
                    status: "DISABLED",
                    languages: []
                },
                shouldSetWip: false,
                childrenOrder: names,
            },
            mutation: SavePropertiesMutation,
        }).then(() => {
            console.debug(`Node ${names.join(',')} reordered`);
            triggerRefetchAll();
        }, error => {
            console.error(`Error reordering node ${names.join(',')}: ${error}`);
        });
    };

    return {reorderNodes};
}

export const Create = React.memo(({element, node, addIntervalCallback, clickedElement, onClick, onMouseOver, onMouseOut, onSaved, isInsertionPoint}) => {
    const copyPasteNodes = useSelector(state => state.jcontent.copyPaste?.nodes);
    const parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    const parentPath = parent.getAttribute('path');
    const [currentOffset, setCurrentOffset] = useState(getBoundingBox(element));
    const {nodeName, nodePath, nodeTypes, templateLimit} = useElemAttributes({element, parent, isInsertionPoint});

    useEffect(() => {
        element.style['min-height'] = '28px';
    });

    useEffect(() => {
        if (parent && node?.subNodes.pageInfo.totalCount === 0) {
            element.style['height'] = '96px';
            [...parent.childNodes].find(node => node.nodeType === Node.TEXT_NODE)?.remove();
            setCurrentOffset(getBoundingBox(element));
        }
    }, [node, parent])


    const [{isCanDrop}, drop] = useNodeDrop({dropTarget: parent && node, onSaved});
    const {anyDragging} = useDragLayer(monitor => ({
        anyDragging: monitor.isDragging()
    }));

    useEffect(
        () => addIntervalCallback(() => reposition(element, currentOffset, setCurrentOffset)),
        [addIntervalCallback, currentOffset, element, setCurrentOffset]);
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

    return !anyDragging && (
        <div ref={drop}
             jahiatype="createbuttons" // eslint-disable-line react/no-unknown-property
             data-jahia-id={element.getAttribute('id')}
             className={clsx(styles.root, editStyles.enablePointerEvents, sizers)}
             style={{...currentOffset, height: isInsertionPoint ? 0 : currentOffset.height}}
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
                               isDisabled={clickedElement && clickedElement.path !== parentPath}
                               nodeTypes={nodeTypes}
                               onCreate={({name}) => reorderNodes([name], nodeName)}
                               templateLimit={templateLimit}
                               loading={() => false}
                               render={ButtonRenderer}/>}
            <DisplayAction actionKey="paste"
                           tooltipProps={tooltipProps}
                           isDisabled={clickedElement && clickedElement.path !== parentPath}
                           path={parentPath}
                           loading={() => false}
                           onAction={(data) => reorderNodes(data?.map(d => d?.data?.jcr?.pasteNode?.node?.name), nodeName)}
                           render={ButtonRenderer}/>
            <DisplayAction actionKey="pasteReference"
                           tooltipProps={tooltipProps}
                           isDisabled={clickedElement && clickedElement.path !== parentPath}
                           path={parentPath}
                           loading={() => false}
                           onAction={(data) => reorderNodes(data?.map(d => d?.data?.jcr?.pasteNode?.node?.name), nodeName)}
                           render={ButtonRenderer}/>
        </div>
    );
});

Create.propTypes = {
    element: PropTypes.any,
    node: PropTypes.any,
    addIntervalCallback: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onSaved: PropTypes.func
};
