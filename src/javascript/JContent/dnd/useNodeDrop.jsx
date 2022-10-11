import {useApolloClient, useMutation} from '@apollo/react-hooks';
import {useDrop} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import gql from 'graphql-tag';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {PredefinedFragments} from '@jahia/data-helper';
import {useState} from 'react';

const moveNode = gql`mutation moveNode($pathsOrIds: [String]!, $destParentPathOrId: String!, $move: Boolean!, $reorder: Boolean!, $names: [String]!) {
    jcr {
        mutateNodes(pathsOrIds: $pathsOrIds) @include(if: $move) {
            move(parentPathOrId: $destParentPathOrId)
            node {
                ...NodeCacheRequiredFields
                path
            }
        }
        mutateNode(pathOrId: $destParentPathOrId) @include(if: $reorder) {
            reorderChildren(names: $names)
            node {
                ...NodeCacheRequiredFields
                path
            }
        }
    }
}
${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

const getStyle = insertPosition => insertPosition ? [styles[insertPosition]] : [styles.drop];

export function useNodeDrop(dropTarget, ref, orderable) {
    const [moveMutation] = useMutation(moveNode);
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const {t} = useTranslation('jcontent');
    const [insertPosition, setInsertPosition] = useState();

    const [props, drop] = useDrop(() => ({
        accept: ['node', 'paths'],
        collect: monitor => ({
            dropClasses: (monitor.canDrop() && monitor.isOver()) ? [getStyle(insertPosition)] : []
        }),
        hover: (dragSource, monitor) => {
            if (ref.current && orderable) {
                const hoverBoundingRect = ref.current.getBoundingClientRect();
                const height = hoverBoundingRect.height;
                const clientOffset = monitor.getClientOffset();
                const hoverClientY = clientOffset.y - hoverBoundingRect.top;
                if (hoverClientY < 10) {
                    setInsertPosition('insertBefore');
                } else if (hoverClientY > height - 10) {
                    setInsertPosition('insertAfter');
                } else {
                    setInsertPosition(null);
                }
            }
        },
        canDrop: dragSource => (dragSource.path !== (dropTarget.path + '/' + dragSource.name)) && (dropTarget.primaryNodeType.name === 'jnt:folder' || dropTarget.primaryNodeType.name === 'jnt:contentFolder' || dropTarget.primaryNodeType.name === 'jnt:page'),
        drop: (dragSource, monitor) => {
            const isNode = monitor.getItemType() === 'node';
            const pathsOrIds = isNode ? [dragSource.uuid] : dragSource;
            const destParent = insertPosition ? dropTarget.parent : dropTarget;
            const move = (dragSource.path !== (destParent.path + '/' + dragSource.name));
            const reorder = Boolean(insertPosition);
            const names = insertPosition === 'insertBefore' ? [dragSource.name, dropTarget.name] : [dropTarget.name, dragSource.name];
            moveMutation({variables: {pathsOrIds, destParentPathOrId: destParent.uuid, move, reorder, names}}).then(() => {
                const message = t('jcontent:label.contentManager.move.success', {
                    count: pathsOrIds.length,
                    dest: dropTarget.displayName
                });
                client.reFetchObservableQueries();
                notificationContext.notify(message, ['closeButton']);
            }).catch(() => {
                const message = isNode ?
                    t('jcontent:label.contentManager.move.error_name', {
                        name: dragSource.displayName,
                        dest: dropTarget.displayName
                    }) :
                    t('jcontent:label.contentManager.move.error', {
                        count: pathsOrIds.length,
                        dest: dropTarget.displayName}
                    );
                notificationContext.notify(message, ['closeButton']);
            });
        }
    }), [dropTarget, insertPosition]);

    if (ref) {
        drop(ref);
    }

    return props;
}
