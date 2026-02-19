import {useMutation} from '@apollo/client';
import {useDrop} from 'react-dnd';
import gql from 'graphql-tag';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {PredefinedFragments} from '@jahia/data-helper';
import {useRef, useState} from 'react';
import {ellipsizeText, getName, isDescendantOrSelf} from '~/JContent/JContent.utils';
import {useNodeTypeCheck} from '~/JContent';
import {useConnector} from './useConnector';
import {useRefreshTreeAfterMove} from '~/JContent/hooks/useRefreshTreeAfterMove';

const moveNode = gql`mutation moveNode($pathsOrIds: [String]!, $destParentPathOrId: String!, $move: Boolean!, $reorder: Boolean!, $names: [String]!, $position: ReorderedChildrenPosition) {
    jcr {
        mutateNodes(pathsOrIds: $pathsOrIds) @include(if: $move) {
            move(parentPathOrId: $destParentPathOrId, renameOnConflict: true)
            node {
                ...NodeCacheRequiredFields
                path
            }
        }
        mutateNode(pathOrId: $destParentPathOrId) @include(if: $reorder) {
            reorderChildren(names: $names, position: $position)
            node {
                ...NodeCacheRequiredFields
                path
            }
        }
    }
}
${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

function getErrorMessage({isNode, dragSource, destParent, pathsOrIds, e, t}) {
    if (e.message.startsWith('javax.jcr.ItemExistsException')) {
        return isNode ?
            t('jcontent:label.contentManager.move.error_itemExists_name', {name: getName(dragSource)}) :
            t('jcontent:label.contentManager.move.error_itemExists');
    }

    return isNode ?
        t('jcontent:label.contentManager.move.error_name', {name: getName(dragSource), dest: getName(destParent)}) :
        t('jcontent:label.contentManager.move.error', {count: pathsOrIds.length, dest: getName(destParent)});
}

export function useNodeDropPB({dropTarget, orderable, entries, onSaved, pos, refetchQueries, nodeDropData}) { // NOSONAR
    const [moveMutation] = useMutation(moveNode, {refetchQueries});
    const notificationContext = useNotifications();
    const {t} = useTranslation('jcontent');
    const [insertPosition, setInsertPosition] = useState();
    const [destParentState, setDestParent] = useState();
    const [names, setNames] = useState([]);
    const [, setIsCanDrop] = useState(false);

    const {getCurrent, setCurrent} = useConnector();
    const destParent = destParentState || dropTarget;
    const baseRect = useRef();
    const refreshTree = useRefreshTreeAfterMove();
    const destNode = nodeDropData?.nodes ? nodeDropData.nodes[destParent?.path] : null;
    const res = {
        checksResult: destNode?.checksResult,
        node: destNode
    };

    const nodeTypeCheck = useNodeTypeCheck();

    const [props, drop] = useDrop(() => ({
        accept: ['node', 'nodes'],
        collect: monitor => ({
            isCanDrop: monitor.canDrop(),
            insertPosition,
            destParent,
            isOver: monitor.isOver({shallow: true})
        }),
        hover: (dragSource, monitor) => {
            const target = getCurrent();
            if (target && dropTarget && orderable && entries) {
                if (!baseRect.current) {
                    baseRect.current = target.getBoundingClientRect();
                }

                const height = baseRect.current.height;
                const width = baseRect.current.width;
                const clientOffset = monitor.getClientOffset();
                const hoverClientY = clientOffset.y - baseRect.current.top;
                const hoverClientX = clientOffset.x - baseRect.current.left;

                const v = {
                    top: hoverClientY < (height / 4),
                    bottom: hoverClientY > height - (height / 4),
                    left: hoverClientX < (width / 4),
                    right: hoverClientX > width - (width / 4)
                };

                if (v[pos?.before || 'top']) {
                    setInsertPosition('insertBefore');
                } else if (v[pos?.after || 'bottom']) {
                    setInsertPosition('insertAfter');
                } else {
                    setInsertPosition(null);
                }

                const names = [dragSource.name];
                const idx = entries.indexOf(entries.find(t => t.name === dropTarget.name));
                const d = entries[idx + 1]?.depth - entries[idx].depth;
                if (insertPosition === 'insertAfter') {
                    // Insert before next entry
                    if (d >= 0) {
                        names.push(entries[idx + 1].name);
                    }
                } else {
                    names.push(dropTarget.name);
                }

                setNames(names.filter(n => n !== undefined));
                setDestParent(insertPosition === 'insertBefore' || (insertPosition === 'insertAfter' && d !== 1) ? dropTarget.parent : null);
            }
        },
        canDrop: (dragSource, monitor) => {
            const nodes = (monitor.getItemType() === 'nodes') ? dragSource : [dragSource];

            const limit = res.node?.properties.find(p => p.name === 'limit');
            const hasRoom = limit ? nodes.length <= parseInt(limit.value, 10) - res.node?.['subNodesCount_nt:base'] : true;

            const basicConditions = dropTarget && monitor.isOver({shallow: true}) && res.node && !res.node?.lockOwner && hasRoom;
            const notSelf = nodes.find(source => (dropTarget && isDescendantOrSelf(dropTarget.path, source.path)) || (destParent && isDescendantOrSelf(destParent.path, source.path))) === undefined;

            let result = Boolean(basicConditions && notSelf && res.checksResult && nodeTypeCheck(res.node, nodes).checkResult);

            // The nodeTypeCheck result is asynchronous - Store result in state to trigger update when the value change
            setIsCanDrop(result);
            return result;
        },
        drop: (dragSource, monitor) => {
            if (monitor.didDrop()) {
                return;
            }

            const isNode = monitor.getItemType() === 'node';
            const nodes = isNode ? [dragSource] : dragSource;
            const pathsOrIds = nodes.map(n => n.uuid);
            const move = nodes.find(source => source.path === (destParent.path + '/' + source.name)) === undefined;
            const reorder = Boolean(insertPosition);

            const position = names?.length === 2 ? 'INPLACE' : 'LAST';
            moveMutation({
                variables: {
                    pathsOrIds,
                    destParentPathOrId: destParent.uuid,
                    move,
                    reorder,
                    names,
                    position
                }
            }).then(({data}) => {
                const message = t('jcontent:label.contentManager.move.success', {
                    count: pathsOrIds.length,
                    dest: (destParent.displayName && ellipsizeText(destParent.displayName, 20)) || destParent.name
                });

                if (onSaved) {
                    onSaved();
                } else {
                    const moveResults = data.jcr.mutateNodes.map(n => n.node).reduce((acc, n) => Object.assign(acc, {[n.uuid]: n}), {});
                    refreshTree(destParent.path, nodes, moveResults);
                }

                notificationContext.notify(message, ['closeButton', 'closeAfter5s']);
            }).catch(e => {
                console.log(e);
                notificationContext.notify(
                    getErrorMessage({isNode, dragSource, destParent, pathsOrIds, e, t}),
                    ['closeButton', 'closeAfter5s']
                );
            });
        }
    }), [dropTarget, destParent, names, insertPosition, entries, res, nodeTypeCheck]);

    const enhancedDrop = elem => {
        setCurrent(elem);
        drop(elem);
    };

    return [props, enhancedDrop];
}
