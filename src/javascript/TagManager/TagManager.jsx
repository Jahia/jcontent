import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useApolloClient, useMutation, useQuery} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';
import {useNotifications} from '@jahia/react-material';
import {Header, Loader, SearchInput, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {GET_MANAGED_TAGS, DELETE_TAG, DELETE_TAG_ON_NODE, RENAME_TAG, RENAME_TAG_ON_NODE} from './TagManager.gql-queries';
import {TagManagerTable} from './TagManagerTable';
import {DeleteTagDialog, EditNodeTagDialog, RenameTagDialog} from './TagManagerDialogs';
import {TagManagerDrawer} from './TagManagerDrawer';
import {refetchTypes, triggerRefetch} from '~/JContent/JContent.refetches';
import styles from './TagManager.scss';

const compareStrings = (left, right) => left.localeCompare(right, undefined, {sensitivity: 'base'});

const sortTags = (tags, sort) => {
    const multiplier = sort.order === 'DESC' ? -1 : 1;
    return [...tags].sort((left, right) => {
        if (sort.orderBy === 'occurrences') {
            if (left.occurrences === right.occurrences) {
                return compareStrings(left.name, right.name) * multiplier;
            }

            return (left.occurrences - right.occurrences) * multiplier;
        }

        return compareStrings(left.name, right.name) * multiplier;
    });
};

const getImpactedItemsCount = result => {
    const counts = result?.workspaceResults?.map(workspaceResult => workspaceResult.processedCount) || [];
    return counts.length > 0 ? Math.max(...counts) : 0;
};

export const TagManager = () => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const {notify} = useNotifications();
    const {siteKey, uilang} = useSelector(state => ({
        siteKey: state.site,
        uilang: state.uilang
    }), shallowEqual);
    const {node: siteNode} = useNodeInfo(
        {path: `/sites/${siteKey}`, language: uilang},
        {getDisplayName: true}
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [sort, setSort] = useState({order: 'ASC', orderBy: 'name'});
    const [selectedTag, setSelectedTag] = useState(null);
    const [drawerPage, setDrawerPage] = useState(0);
    const [drawerPageSize, setDrawerPageSize] = useState(10);
    const [renameTarget, setRenameTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editNodeTarget, setEditNodeTarget] = useState(null);
    const [deletingNodeId, setDeletingNodeId] = useState(null);

    const {data, loading, error, refetch} = useQuery(GET_MANAGED_TAGS, {
        variables: {siteKey},
        fetchPolicy: 'cache-and-network'
    });

    const [renameTag, renameState] = useMutation(RENAME_TAG);
    const [deleteTag, deleteState] = useMutation(DELETE_TAG);
    const [deleteTagOnNode] = useMutation(DELETE_TAG_ON_NODE);
    const [renameTagOnNode, updateNodeState] = useMutation(RENAME_TAG_ON_NODE);

    const tags = useMemo(() => data?.admin?.jahia?.tagManager?.tags?.nodes || [], [data]);
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredTags = useMemo(() => {
        if (!normalizedSearch) {
            return tags;
        }

        return tags.filter(tag => tag.name.toLowerCase().includes(normalizedSearch));
    }, [normalizedSearch, tags]);

    const sortedTags = useMemo(() => sortTags(filteredTags, sort), [filteredTags, sort]);
    const paginatedTags = useMemo(() => {
        return sortedTags.slice(page * pageSize, (page * pageSize) + pageSize);
    }, [page, pageSize, sortedTags]);

    useEffect(() => {
        setSearchTerm('');
        setPage(0);
        setSelectedTag(null);
        setRenameTarget(null);
        setDeleteTarget(null);
        setEditNodeTarget(null);
        setDrawerPage(0);
    }, [siteKey]);

    useEffect(() => {
        setPage(0);
    }, [pageSize, searchTerm, sort]);

    useEffect(() => {
        const maxPage = sortedTags.length > 0 ? Math.floor((sortedTags.length - 1) / pageSize) : 0;
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [page, pageSize, sortedTags.length]);

    const refreshAfterMutation = useCallback(async () => {
        await refetch();
        await client.reFetchObservableQueries();
        triggerRefetch(refetchTypes.CONTENT_DATA);
        triggerRefetch(refetchTypes.CONTENT_TREE);
    }, [client, refetch]);

    const handleRename = async newName => {
        if (!renameTarget) {
            return;
        }

        try {
            const {data: mutationData} = await renameTag({
                variables: {
                    siteKey,
                    tag: renameTarget.name,
                    newName
                }
            });
            const result = mutationData?.admin?.jahia?.tagManager?.renameTag;
            await refreshAfterMutation();
            if (selectedTag === renameTarget.name) {
                setSelectedTag(newName);
            }

            notify(
                t('jcontent:label.contentManager.tagManager.notifications.renameSuccess', {
                    count: getImpactedItemsCount(result),
                    tag: renameTarget.name,
                    newTag: newName
                }),
                ['closeButton', 'closeAfter5s']
            );
            setRenameTarget(null);
        } catch (error) {
            notify(error.message, ['closeButton', 'noAutomaticClose']);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            const {data: mutationData} = await deleteTag({
                variables: {
                    siteKey,
                    tag: deleteTarget.name
                }
            });
            const result = mutationData?.admin?.jahia?.tagManager?.deleteTag;
            await refreshAfterMutation();
            if (selectedTag === deleteTarget.name) {
                setSelectedTag(null);
            }

            notify(
                t('jcontent:label.contentManager.tagManager.notifications.deleteSuccess', {
                    count: getImpactedItemsCount(result),
                    tag: deleteTarget.name
                }),
                ['closeButton', 'closeAfter5s']
            );
            setDeleteTarget(null);
        } catch (error) {
            notify(error.message, ['closeButton', 'noAutomaticClose']);
        }
    };

    const handleDeleteTagOnNode = async nodeId => {
        setDeletingNodeId(nodeId);
        try {
            const {data: mutationData} = await deleteTagOnNode({
                variables: {
                    siteKey,
                    tag: selectedTag,
                    nodeId
                }
            });
            const result = mutationData?.admin?.jahia?.tagManager?.deleteTagOnNode;
            await refreshAfterMutation();
            notify(
                t('jcontent:label.contentManager.tagManager.notifications.removeFromContentSuccess', {
                    count: getImpactedItemsCount(result),
                    tag: selectedTag
                }),
                ['closeButton', 'closeAfter5s']
            );
        } catch (error) {
            notify(error.message, ['closeButton', 'noAutomaticClose']);
        } finally {
            setDeletingNodeId(null);
        }
    };

    const handleEditTagOnNode = async newTag => {
        if (!editNodeTarget || !selectedTag) {
            return;
        }

        try {
            const {data: mutationData} = await renameTagOnNode({
                variables: {
                    siteKey,
                    tag: selectedTag,
                    newName: newTag,
                    nodeId: editNodeTarget.uuid
                }
            });
            const result = mutationData?.admin?.jahia?.tagManager?.renameTagOnNode;
            await refreshAfterMutation();
            notify(
                t('jcontent:label.contentManager.tagManager.notifications.updateOnContentSuccess', {
                    count: getImpactedItemsCount(result),
                    tag: selectedTag,
                    newTag,
                    contentName: editNodeTarget.displayName || editNodeTarget.path
                }),
                ['closeButton', 'closeAfter5s']
            );
            setEditNodeTarget(null);
        } catch (error) {
            notify(error.message, ['closeButton', 'noAutomaticClose']);
        }
    };

    return (
        <div className={styles.root} data-cm-role="tag-manager-root">
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderInner}>
                    <Header title={t('jcontent:label.contentManager.tagManager.header', {siteName: siteNode?.displayName || siteKey})}/>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.contentWrapper} data-cm-role="tag-manager-content-wrapper">
                    <div className={styles.paper} data-cm-role="tag-manager-content">
                        <div className={styles.controls}>
                            <SearchInput
                                size="default"
                                value={searchTerm}
                                className={styles.searchInput}
                                data-cm-role="tag-manager-search"
                                placeholder={t('jcontent:label.contentManager.tagManager.search.placeholder')}
                                variant="outlined"
                                onClear={() => setSearchTerm('')}
                                onChange={event => setSearchTerm(event.target.value)}
                            />
                            <Typography variant="caption" className={styles.resultsCount}>
                                {t('jcontent:label.contentManager.tagManager.search.results', {count: filteredTags.length})}
                            </Typography>
                        </div>

                        {loading ? (
                            <div className={styles.loaderContainer}>
                                <Loader size="big"/>
                            </div>
                        ) : error ? (
                            <div className={styles.emptyState}>
                                <Typography variant="heading">{t('jcontent:label.contentManager.error.contentUnavailable')}</Typography>
                                <Typography>{t('jcontent:label.contentManager.error.queryingContent', {details: error.message})}</Typography>
                            </div>
                        ) : filteredTags.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Typography variant="heading">{t('jcontent:label.contentManager.tagManager.empty.title')}</Typography>
                                <Typography>{normalizedSearch ? t('jcontent:label.contentManager.tagManager.empty.search') : t('jcontent:label.contentManager.tagManager.empty.description')}</Typography>
                            </div>
                        ) : (
                            <TagManagerTable
                                tags={paginatedTags}
                                selectedTag={selectedTag}
                                totalCount={filteredTags.length}
                                page={page}
                                pageSize={pageSize}
                                sort={sort}
                                onSort={setSort}
                                onPageChange={setPage}
                                onPageSizeChange={newPageSize => setPageSize(newPageSize)}
                                onView={tag => {
                                    setSelectedTag(tag.name);
                                    setDrawerPage(0);
                                }}
                                onRename={setRenameTarget}
                                onDelete={setDeleteTarget}
                            />
                        )}
                    </div>

                    <TagManagerDrawer
                        siteKey={siteKey}
                        tag={selectedTag}
                        isOpen={Boolean(selectedTag)}
                        page={drawerPage}
                        pageSize={drawerPageSize}
                        deletingNodeId={deletingNodeId}
                        onClose={() => setSelectedTag(null)}
                        onPageChange={setDrawerPage}
                        onPageSizeChange={newPageSize => {
                            setDrawerPageSize(newPageSize);
                            setDrawerPage(0);
                        }}
                        onEditTagOnNode={setEditNodeTarget}
                        onDeleteTagOnNode={handleDeleteTagOnNode}
                    />
                </div>
            </div>

            <RenameTagDialog
                siteKey={siteKey}
                siteName={siteNode?.displayName || siteKey}
                tag={renameTarget}
                isOpen={Boolean(renameTarget)}
                isLoading={renameState.loading}
                onClose={() => setRenameTarget(null)}
                onConfirm={handleRename}
            />

            <DeleteTagDialog
                siteName={siteNode?.displayName || siteKey}
                tag={deleteTarget}
                isOpen={Boolean(deleteTarget)}
                isLoading={deleteState.loading}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

            <EditNodeTagDialog
                siteKey={siteKey}
                tag={selectedTag}
                node={editNodeTarget}
                isOpen={Boolean(editNodeTarget)}
                isLoading={updateNodeState.loading}
                onClose={() => setEditNodeTarget(null)}
                onConfirm={handleEditTagOnNode}
            />
        </div>
    );
};

export default TagManager;
