import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';
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
import {GET_TAGGED_CONTENT} from './TagManager.gql-queries';
import {DeleteNodeTagDialog} from './TagManagerDialogs';
import {NodeIcon} from '~/utils/NodeIcon';
import styles from './TagManager.scss';

export const TagManagerDrawer = ({
    siteKey,
    tag,
    isOpen,
    page,
    pageSize,
    deletingNodeId,
    onClose,
    onPageChange,
    onPageSizeChange,
    onEditTagOnNode,
    onDeleteTagOnNode
}) => {
    const {t} = useTranslation('jcontent');
    const {language} = useSelector(state => ({
        language: state.language
    }), shallowEqual);
    const [deleteTarget, setDeleteTarget] = useState(null);
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
        if (isOpen && !loading && totalCount === 0) {
            onClose();
        }
    }, [isOpen, loading, onClose, totalCount]);

    const handleConfirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        await onDeleteTagOnNode(deleteTarget.uuid);
        setDeleteTarget(null);
    };

    return (
        <>
            {isOpen && (
                <div className={styles.drawerLayer} onClick={onClose}>
                    <aside className={styles.drawerPaper} onClick={event => event.stopPropagation()}>
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
                                            <div key={node.uuid} className={styles.drawerItem}>
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
                                                            icon={<Edit/>}
                                                            onClick={() => onEditTagOnNode(node)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip label={t('jcontent:label.contentManager.tagManager.table.actions.removeFromContent')}>
                                                        <Button
                                                            variant="ghost"
                                                            color="danger"
                                                            size="small"
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
                                        onPageChange={nextPage => onPageChange(nextPage - 1)}
                                        onRowsPerPageChange={onPageSizeChange}
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
        </>
    );
};

TagManagerDrawer.propTypes = {
    siteKey: PropTypes.string.isRequired,
    tag: PropTypes.string,
    isOpen: PropTypes.bool,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    deletingNodeId: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onPageSizeChange: PropTypes.func.isRequired,
    onEditTagOnNode: PropTypes.func.isRequired,
    onDeleteTagOnNode: PropTypes.func.isRequired
};

TagManagerDrawer.defaultProps = {
    tag: null,
    isOpen: false,
    deletingNodeId: null
};
