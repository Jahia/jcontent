import {useMutation} from '@apollo/react-hooks';
import {useDrop} from 'react-dnd';
import styles from '~/JContent/ContentTree/ContentTree.scss';
import gql from 'graphql-tag';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {PredefinedFragments} from '@jahia/data-helper';

const moveNode = gql`mutation moveNode($pathsOrIds: [String]!, $destParentPathOrId: String!) {
    jcr {
        mutateNodes(pathsOrIds: $pathsOrIds) {
            move(parentPathOrId: $destParentPathOrId)
            node {
                ...NodeCacheRequiredFields
                path
            }
        }
    }
}
${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export function useNodeDrop(node) {
    const [move] = useMutation(moveNode);
    const notificationContext = useNotifications();
    const {t} = useTranslation('jcontent');

    return useDrop(() => ({
        accept: ['node', 'paths'],
        collect: monitor => ({
            dropClasses: monitor.canDrop() && monitor.isOver() ? [styles.drop] : []
        }),
        canDrop: () => (node.primaryNodeType.name === 'jnt:folder' || node.primaryNodeType.name === 'jnt:contentFolder'),
        drop: (item, monitor) => {
            const isNode = monitor.getItemType() === 'node';
            const pathsOrIds = isNode ? [item.uuid] : item;

            move({variables: {pathsOrIds, destParentPathOrId: node.uuid}}).then(() => {
                const message = t('jcontent:label.contentManager.move.success', {
                    count: pathsOrIds.length,
                    dest: node.displayName
                });
                notificationContext.notify(message, ['closeButton']);
            }).catch(() => {
                const message = isNode ?
                    t('jcontent:label.contentManager.move.error_name', {
                        name: item.displayName,
                        dest: node.displayName
                    }) :
                    t('jcontent:label.contentManager.move.error', {
                        count: pathsOrIds.length,
                        dest: node.displayName}
                    );
                notificationContext.notify(message, ['closeButton']);
            });
        }
    }), [node]);
}
