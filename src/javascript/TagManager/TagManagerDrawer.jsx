import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useMutation, useQuery} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';
import {useNotifications} from '@jahia/react-material';
import {
    Button,
    Close,
    DeletePermanently,
    Edit,
    Loader,
    TablePagination,
    Tooltip,
    Typography
} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {GET_TAGGED_CONTENT, DELETE_TAG_ON_NODE, RENAME_TAG_ON_NODE} from './TagManager.gql-queries';
import {DeleteNodeTagDialog} from './DeleteNodeTagDialog';
import {EditNodeTagDialog} from './EditNodeTagDialog';
import {getFailedCount, getImpactedItemsCount} from './TagManager.utils';
import {NodeIcon} from '~/utils/NodeIcon';
import styles from './TagManager.scss';

export const TagManagerDrawer = ({
    siteKey,
    tag = null,
    isOpen = false,
    onClose,
    onMutationComplete
}) => {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const {language} = useSelector(state => ({
        language: state.language
    }), shallowEqual);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [deletingNodeId, setDeletingNodeId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editNodeTarget, setEditNodeTarget] = useState(null);

    const [deleteTagOnNode] = useMutation(DELETE_TAG_ON_NODE);
    const [renameTagOnNode, updateNodeState] = useMutation(RENAME_TAG_ON_NODE);

    const {data, loading, error} = useQuery(GET_TAGGED_CONTENT, {
        variables: {
            siteKey,
            tag,
            limit: pageSize,
            offset: page * pageSize,
            language
        },
        skip: !isOpen || !tag,
        fetchPolicy: 'cache-and-network'
    });

    const connection = data?.admin?.jahia?.tagManager?.taggedContent;
    const nodes = connection?.nodes || [];
    const totalCount = connection?.pageInfo?.totalCount || 0;

    useEffect(() => {
        setPage(0);
    }, [tag]);

    useEffect(() => {
        if (isOpen && !loading && totalCount === 0) {
            onClose();
        }
    }, [isOpen, loading, onClose, totalCount]);

    const handleDeleteTagOnNode = useCallback(async nodeId => {
        setDeletingNodeId(nodeId);
        try {
            const {data: mutationData} = await deleteTagOnNode({
                variables: {
                    siteKey,
                    tag,
                    nodeId
                }
            });
            const result = mutationData?.admin?.jahia?.tagManager?.deleteTagOnNode;
            await onMutationComplete();
            notify(
                t('jcontent:label.contentManager.tagManager.notifications.removeFromContentSuccess', {
                    count: getImpactedItemsCount(result),
                    tag
                }),
                ['closeButton', 'closeAfter5s']
            );
            if (getFailedCount(result) > 0) {
                notify(
                    t('jcontent:label.contentManager.tagManager.notifications.partialFailure', {
                        count: getFailedCount(result),
                        tag
                    }),
                    ['closeButton', 'noAutomaticClose']
                );
            }
        } catch (e) {
            notify(e.message, ['closeButton', 'noAutomaticClose']);
        } finally {
            setDeletingNodeId(null);
        }
    }, [deleteTagOnNode, siteKey, tag, onMutationComplete, notify, t]);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) {
            return;
        }

        await handleDeleteTagOnNode(deleteTarget.uuid);
        setDeleteTarget(null);
    }, [deleteTarget, handleDeleteTagOnNode]);

    const handleEditTagOnNode = useCallback(async newTag => {
        if (!editNodeTarget || !tag) {
            return;
        }

        try {
            const {data: mutationData} = await renameTagOnNode({
                variables: {
                    siteKey,
                    tag,
                    newName: newTag,
                    nodeId: editNodeTarget.uuid
                }
            });
            const result = mutationData?.admin?.jahia?.tagManager?.renameTagOnNode;
            await onMutationComplete();
            notify(
                t('jcontent:label.contentManager.tagManager.notifications.updateOnContentSuccess', {
                    count: getImpactedItemsCount(result),
                    tag,
                    newTag,
                    contentName: editNodeTarget.displayName || editNodeTarget.path
                }),
                ['closeButton', 'closeAfter5s']
            );
            if (getFailedCount(result) > 0) {
                notify(
                    t('jcontent:label.contentManager.tagManager.notifications.partialFailure', {
                        count: getFailedCount(result),
                        tag
                    }),
                    ['closeButton', 'noAutomaticClose']
                );
            }

            setEditNodeTarget(null);
        } catch (e) {
            notify(e.message, ['closeButton', 'noAutomaticClose']);
        }
    }, [editNodeTarget, tag, renameTagOnNode, siteKey, onMutationComplete, notify, t]);

    return (
        <>
            {isOpen && (
                <div className={styles.drawerLayer} data-cm-role="tag-manager-drawer-layer" onClick={onClose}>
                    <aside className={styles.drawerPaper} data-cm-role="tag-manager-drawer" onClick={event => event.stopPropagation()}>
                        <div className={styles.drawerRoot}>
                            <div className={styles.drawerHeader}>
                                <div className={styles.drawerHeaderInfo}>
                                    <Typography variant="heading" weight="bold">
                                        {t('jcontent:label.contentManager.tagManager.drawer.title', {tag})}
                                    </Typography>
                                    <Typography variant="caption">
                                        {t('jcontent:label.contentManager.tagManager.drawer.subtitle', {count: totalCount})}
                                    </Typography>
                                </div>
                                <Button variant="ghost" icon={<Close/>} onClick={onClose}/>
                            </div>

                            {loading ? (
                                <div className={styles.drawerLoader}>
                                    <Loader size="big"/>
                                </div>
                            ) : error ? (
                                <div className={styles.drawerEmpty}>
                                    <Typography>{t('jcontent:label.contentManager.error.queryingContent', {details: error.message})}</Typography>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.drawerList}>
                                        {nodes.map(node => (
                                            <div key={node.uuid} className={styles.drawerItem} data-cm-role="tag-manager-drawer-item" data-node-path={node.path}>
                                                <div className={styles.drawerItemInfo}>
                                                    <div className={styles.drawerItemMain}>
                                                        <NodeIcon node={node}/>
                                                        <div className={styles.drawerItemText}>
                                                            <Typography weight="bold">{node.displayName}</Typography>
                                                            <Typography variant="caption">{node.path}</Typography>
                                                        </div>
                                                    </div>
                                                    <div className={styles.drawerItemType}>
                                                        <Typography variant="caption" weight="bold">
                                                            {node.primaryNodeType?.displayName || node.primaryNodeType?.name}
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <div className={styles.drawerItemActions}>
                                                    <Tooltip label={t('jcontent:label.contentManager.tagManager.table.actions.editTagOnContent')}>
                                                        <Button
                                                            variant="ghost"
                                                            size="small"
                                                            data-cm-role="tag-manager-edit-node-tag"
                                                            icon={<Edit/>}
                                                            onClick={() => setEditNodeTarget(node)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label={t('jcontent:label.contentManager.tagManager.table.actions.removeFromContent')}>
                                                        <Button
                                                            variant="ghost"
                                                            color="danger"
                                                            size="small"
                                                            data-cm-role="tag-manager-delete-node-tag"
                                                            disabled={deletingNodeId === node.uuid}
                                                            icon={<DeletePermanently/>}
                                                            onClick={() => setDeleteTarget(node)}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        ))}
                                        {!nodes.length && (
                                            <div className={styles.drawerEmpty}>
                                                <Typography>{t('jcontent:label.contentManager.tagManager.empty.drawer')}</Typography>
                                            </div>
                                        )}
                                    </div>
                                    <TablePagination
                                        className={styles.pagination}
                                        totalNumberOfRows={totalCount}
                                        currentPage={page + 1}
                                        rowsPerPage={pageSize}
                                        label={{
                                            rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                                            of: t('jcontent:label.pagination.of')
                                        }}
                                        rowsPerPageOptions={[10, 25, 50]}
                                        onPageChange={nextPage => setPage(nextPage - 1)}
                                        onRowsPerPageChange={newPageSize => {
                                            setPageSize(newPageSize);
                                            setPage(0);
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            )}
            <DeleteNodeTagDialog
                tag={tag}
                node={deleteTarget}
                isOpen={Boolean(deleteTarget)}
                isLoading={deletingNodeId === deleteTarget?.uuid}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />
            <EditNodeTagDialog
                key={editNodeTarget?.uuid}
                siteKey={siteKey}
                tag={tag}
                node={editNodeTarget}
                isOpen={Boolean(editNodeTarget)}
                isLoading={updateNodeState.loading}
                onClose={() => setEditNodeTarget(null)}
                onConfirm={handleEditTagOnNode}
            />
        </>
    );
};

TagManagerDrawer.propTypes = {
    siteKey: PropTypes.string.isRequired,
    tag: PropTypes.string,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onMutationComplete: PropTypes.func.isRequired
};
