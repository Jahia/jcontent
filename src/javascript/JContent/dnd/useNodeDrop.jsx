import {useMutation} from '@apollo/react-hooks';
import {useDrop} from 'react-dnd';
import gql from 'graphql-tag';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {PredefinedFragments, useNodeChecks} from '@jahia/data-helper';
import {useRef, useState} from 'react';
import {ellipsizeText, getName, isDescendantOrSelf} from '~/JContent/JContent.utils';
import {useNodeTypeCheck} from '~/JContent';
import {useConnector} from './useConnector';
import {useRefreshTreeAfterMove} from '~/JContent/hooks/useRefreshTreeAfterMove';

const moveNode = gql`mutation moveNode($pathsOrIds: [String]!, $destParentPathOrId: String!, $move: Boolean!, $reorder: Boolean!, $names: [String]!, $position: ReorderedChildrenPosition) {
    jcr {
        mutateNodes(pathsOrIds: $pathsOrIds) @include(if: $move) {
            move(parentPathOrId: $destParentPathOrId)
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

export function useNodeDrop({dropTarget, orderable, entries, onSaved, refetchQueries}) {
    const [moveMutation] = useMutation(moveNode, {refetchQueries});
    const notificationContext = useNotifications();
    const {t} = useTranslation('jcontent');
    const [insertPosition, setInsertPosition] = useState();
    const [destParentState, setDestParent] = useState();
    const [names, setNames] = useState([]);

    const {getCurrent, setCurrent} = useConnector();
    const destParent = destParentState || dropTarget;
    const baseRect = useRef();
    const refreshTree = useRefreshTreeAfterMove();
    const res = useNodeChecks(
        {path: destParent?.path},
        {
            requiredPermission: 'jcr:addChildNodes',
            getChildNodeTypes: true,
            getContributeTypesRestrictions: true,
            getLockInfo: true
        }
    );

    const nodeTypeCheck = useNodeTypeCheck();

    const [props, drop] = useDrop(() => ({
        accept: ['node', 'nodes'],
        collect: monitor => ({
            isCanDrop: monitor.canDrop(),
            insertPosition,
            destParent
        }),
        hover: (dragSource, monitor) => {
            const target = getCurrent();
            if (target && dropTarget && orderable && entries) {
                if (!baseRect.current) {
                    baseRect.current = target.getBoundingClientRect();
                }

                const height = baseRect.current.height;
                const clientOffset = monitor.getClientOffset();
                const hoverClientY = clientOffset.y - baseRect.current.top;
                if (hoverClientY < (height / 4)) {
                    setInsertPosition('insertBefore');
                } else if (hoverClientY > height - (height / 4)) {
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

                setNames(names);
                setDestParent(insertPosition === 'insertBefore' || (insertPosition === 'insertAfter' && d !== 1) ? dropTarget.parent : null);
            }
        },
        canDrop: (dragSource, monitor) => {
            const nodes = (monitor.getItemType() === 'nodes') ? dragSource : [dragSource];

            return dropTarget && monitor.isOver({shallow: true}) && res.node && !res.node?.lockOwner &&
                (insertPosition || (dragSource.path !== (destParent.path + '/' + dragSource.name))) &&
                !isDescendantOrSelf(destParent.path, dragSource.path) &&
                nodeTypeCheck(res.node, nodes).checkResult;
        },
        drop: (dragSource, monitor) => {
            if (monitor.didDrop()) {
                return;
            }

            const isNode = monitor.getItemType() === 'node';
            const nodes = isNode ? [dragSource] : dragSource;
            const pathsOrIds = nodes.map(n => n.uuid);
            const move = (dragSource.path !== (destParent.path + '/' + dragSource.name));
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

                notificationContext.notify(message, ['closeButton']);
            }).catch(e => {
                notificationContext.notify(getErrorMessage({isNode, dragSource, destParent, pathsOrIds, e, t}), ['closeButton']);
            });
        }
    }), [dropTarget, destParent, names, insertPosition, entries, res, nodeTypeCheck]);

    const enhancedDrop = elem => {
        setCurrent(elem);
        drop(elem);
    };

    return [props, enhancedDrop];
}
