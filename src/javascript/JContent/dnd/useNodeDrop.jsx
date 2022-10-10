import {useMutation} from '@apollo/react-hooks';
import {useDrop} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';

const moveNode = gql`mutation moveNode($pathOrId: String!, $destParentPathOrId: String!, $name:String, $next: String, $move: Boolean!, $reorder: Boolean!) {
    jcr {
        pasteNode(mode: MOVE, pathOrId: $pathOrId, destParentPathOrId: $destParentPathOrId, namingConflictResolution: RENAME) @include(if: $move) {
            node {
                ...NodeCacheRequiredFields
                path
            }
        }
        mutateNode(pathOrId: $destParentPathOrId) @include(if: $reorder) {
            reorderChildren(names: [$name, $next])
        }
    }
}
${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export function useNodeDrop(node) {
    const [paste] = useMutation(moveNode);
    const notificationContext = useNotifications();
    const {t} = useTranslation('jcontent');

    return useDrop(() => ({
        accept: ['node'],
        collect: monitor => ({
            dropClasses: monitor.canDrop() && monitor.isOver() ? [styles.drop] : []
        }),
        canDrop: () => (node.primaryNodeType.name === 'jnt:folder' || node.primaryNodeType.name === 'jnt:contentFolder'),
        drop: item => {
            paste({
                variables: {
                    pathOrId: item.uuid,
                    destParentPathOrId: node.uuid,
                    move: true,
                    reorder: false
                }
            }).then(() => {
                const message = t('jcontent:label.contentManager.move.success', {count: 1, name: item.displayName, dest: node.displayName});
                notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
            }).catch(() => {
                const message = t('jcontent:label.contentManager.move.error', {count: 1, name: item.displayName, dest: node.displayName});
                notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
            });
        }
    }), [node]);
}
