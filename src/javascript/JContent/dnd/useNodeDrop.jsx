import {useApolloClient, useMutation, useQuery} from '@apollo/react-hooks';
import {useDrop} from 'react-dnd';
import gql from 'graphql-tag';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {PredefinedFragments, useNodeInfo} from '@jahia/data-helper';
import {useState} from 'react';

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

export function useNodeDrop({dropTarget, ref, orderable, entries, onSaved}) {
    const [moveMutation] = useMutation(moveNode);
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const {t} = useTranslation('jcontent');
    const [insertPosition, setInsertPosition] = useState();
    const [destParentState, setDestParent] = useState();
    const [names, setNames] = useState([]);

    const destParent = destParentState || dropTarget;

    const {data} = useQuery(gql`query getChildName($path:String!) { 
        jcr {
            nodeByPath(path: $path) {
                uuid
                workspace
                path
                children {
                    nodes {
                        uuid
                        workspace
                        path
                        name
                    }
                }
            }
        }
    }`, {
        variables: {
            path: dropTarget?.parent?.path
        },
        skip: !dropTarget || !orderable || entries
    });

    entries = entries || (data && data.jcr.nodeByPath.children.nodes);

    const [props, drop] = useDrop(() => ({
        accept: ['node', 'paths'],
        collect: monitor => ({
            canDrop: (monitor.canDrop() && monitor.isOver()),
            insertPosition,
            destParent
        }),
        hover: (dragSource, monitor) => {
            if (ref.current && dropTarget && orderable && entries) {
                const hoverBoundingRect = ref.current.getBoundingClientRect();
                const height = hoverBoundingRect.height;
                const clientOffset = monitor.getClientOffset();
                const hoverClientY = clientOffset.y - 156 - hoverBoundingRect.top;
                if (hoverClientY < (height / 4)) {
                    setInsertPosition('insertBefore');
                } else if (hoverClientY > height - (height / 4)) {
                    setInsertPosition('insertAfter');
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
        canDrop: dragSource => dropTarget && (insertPosition || (dragSource.path !== (destParent.path + '/' + dragSource.name))),
        drop: (dragSource, monitor) => {
            const isNode = monitor.getItemType() === 'node';
            const pathsOrIds = isNode ? [dragSource.uuid] : dragSource;
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
            }).then(() => {
                const message = t('jcontent:label.contentManager.move.success', {
                    count: pathsOrIds.length,
                    dest: destParent.displayName || destParent.name
                });

                if (onSaved) {
                    onSaved();
                } else {
                    client.reFetchObservableQueries();
                }

                notificationContext.notify(message, ['closeButton']);
            }).catch(() => {
                const message = isNode ?
                    t('jcontent:label.contentManager.move.error_name', {
                        name: dragSource.displayName,
                        dest: destParent.displayName || destParent.name
                    }) :
                    t('jcontent:label.contentManager.move.error', {
                        count: pathsOrIds.length,
                        dest: destParent.displayName || destParent.name
                    }
                    );
                notificationContext.notify(message, ['closeButton']);
            });
        }
    }), [dropTarget, destParent, names, insertPosition, entries]);

    if (ref) {
        drop(ref);
    }

    return props;
}
