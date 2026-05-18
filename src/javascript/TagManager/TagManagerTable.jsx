import React, {useCallback, useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {useTable} from 'react-table';
import {useTranslation} from 'react-i18next';
import {useMutation} from '@apollo/client';
import {useNotifications} from '@jahia/react-material';
import {
    Button,
    DeletePermanently,
    Edit,
    Loader,
    SearchInput,
    Table,
    TableBody,
    TableBodyCell,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
    Visibility
} from '@jahia/moonstone';
import {ContentListHeader} from '~/JContent/ContentRoute/ContentLayout/ContentTable/ContentListHeader';
import * as reactTable from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';
import {RENAME_TAG, DELETE_TAG} from './TagManager.gql-queries';
import {RenameTagDialog} from './RenameTagDialog';
import {DeleteTagDialog} from './DeleteTagDialog';
import {getImpactedItemsCount} from './TagManager.utils';
import styles from './TagManager.scss';

/* eslint-disable react/prop-types */
export const TagManagerTable = ({
    siteKey,
    siteName,
    tags,
    selectedTag = null,
    totalCount,
    loading,
    error,
    searchTerm,
    normalizedSearch,
    sort,
    onSearchChange,
    onSort,
    onView,
    onTagRenamed,
    onTagDeleted,
    onMutationComplete
}) => {
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [renameTarget, setRenameTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [renameTag, renameState] = useMutation(RENAME_TAG);
    const [deleteTag, deleteState] = useMutation(DELETE_TAG);

    useEffect(() => {
        setPage(0);
    }, [pageSize, searchTerm, sort]);

    useEffect(() => {
        const maxPage = totalCount > 0 ? Math.floor((totalCount - 1) / pageSize) : 0;
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [page, pageSize, totalCount]);

    const paginatedTags = useMemo(() => tags.slice(page * pageSize, (page + 1) * pageSize), [tags, page, pageSize]);

    const handleRename = useCallback(async newName => {
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
            await onMutationComplete();
            onTagRenamed(renameTarget.name, newName);
            notify(
                t('jcontent:label.contentManager.tagManager.notifications.renameSuccess', {
                    count: getImpactedItemsCount(result),
                    tag: renameTarget.name,
                    newTag: newName
                }),
                ['closeButton', 'closeAfter5s']
            );
            setRenameTarget(null);
        } catch (e) {
            notify(e.message, ['closeButton', 'noAutomaticClose']);
        }
    }, [renameTarget, renameTag, siteKey, onMutationComplete, onTagRenamed, notify, t]);

    const handleDelete = useCallback(async () => {
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
            await onMutationComplete();
            onTagDeleted(deleteTarget.name);
            notify(
                t('jcontent:label.contentManager.tagManager.notifications.deleteSuccess', {
                    count: getImpactedItemsCount(result),
                    tag: deleteTarget.name
                }),
                ['closeButton', 'closeAfter5s']
            );
            setDeleteTarget(null);
        } catch (e) {
            notify(e.message, ['closeButton', 'noAutomaticClose']);
        }
    }, [deleteTarget, deleteTag, siteKey, onMutationComplete, onTagDeleted, notify, t]);

    const columns = useMemo(() => ([
        {
            Header: reactTable.Header,
            accessor: 'name',
            property: 'name',
            label: 'jcontent:label.contentManager.tagManager.table.name',
            sortable: true,
            Cell: ({value, cell, column, row}) => (
                <TableBodyCell key={row.id + column.id}
                               {...cell.getCellProps()}
                               data-cm-role="tag-manager-name"
                >
                    <Typography>{value}</Typography>
                </TableBodyCell>
            )
        },
        {
            Header: reactTable.Header,
            accessor: 'occurrences',
            property: 'occurrences',
            label: 'jcontent:label.contentManager.tagManager.table.usages',
            sortable: true,
            width: 180,
            Cell: ({value, cell, column, row}) => (
                <TableBodyCell key={row.id + column.id}
                               {...cell.getCellProps()}
                               width={column.width}
                               data-cm-role="tag-manager-occurrences"
                >
                    <Typography>{value}</Typography>
                </TableBodyCell>
            )
        },
        {
            Header: () => <Typography weight="bold">{t('jcontent:label.contentManager.tagManager.table.actions.label')}</Typography>,
            id: 'actions',
            width: 180,
            Cell: ({row, cell, column}) => (
                <TableBodyCell key={row.id + column.id}
                               {...cell.getCellProps()}
                               width={column.width}
                               data-cm-role="tag-manager-actions"
                >
                    <div className={styles.rowActions}>
                        <Tooltip label={t('jcontent:label.contentManager.tagManager.table.actions.view')}>
                            <Button
                                variant="ghost"
                                size="small"
                                data-cm-role="tag-manager-view"
                                icon={<Visibility/>}
                                onClick={() => onView(row.original)}
                            />
                        </Tooltip>
                        <Tooltip label={t('jcontent:label.contentManager.tagManager.table.actions.edit')}>
                            <Button
                                variant="ghost"
                                size="small"
                                data-cm-role="tag-manager-rename"
                                icon={<Edit/>}
                                onClick={() => setRenameTarget(row.original)}
                            />
                        </Tooltip>
                        <Tooltip label={t('jcontent:label.contentManager.tagManager.table.actions.remove')}>
                            <Button
                                variant="ghost"
                                color="danger"
                                size="small"
                                data-cm-role="tag-manager-delete"
                                icon={<DeletePermanently/>}
                                onClick={() => setDeleteTarget(row.original)}
                            />
                        </Tooltip>
                    </div>
                </TableBodyCell>
            )
        }
    ]), [onView, t]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({
        columns,
        data: paginatedTags,
        sort,
        onSort: (column, order) => onSort({order, orderBy: column.property})
    }, reactTable.useSort);

    return (
        <>
            <div className={styles.paper} data-cm-role="tag-manager-content">
                <div className={styles.controls}>
                    <SearchInput
                        size="default"
                        value={searchTerm}
                        className={styles.searchInput}
                        data-cm-role="tag-manager-search"
                        placeholder={t('jcontent:label.contentManager.tagManager.search.placeholder')}
                        variant="outlined"
                        onClear={() => onSearchChange('')}
                        onChange={event => onSearchChange(event.target.value)}
                    />
                    <Typography variant="caption" className={styles.resultsCount}>
                        {t('jcontent:label.contentManager.tagManager.search.results', {count: totalCount})}
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
                ) : totalCount === 0 ? (
                    <div className={styles.emptyState}>
                        <Typography variant="heading">{t('jcontent:label.contentManager.tagManager.empty.title')}</Typography>
                        <Typography>{normalizedSearch ? t('jcontent:label.contentManager.tagManager.empty.search') : t('jcontent:label.contentManager.tagManager.empty.description')}</Typography>
                    </div>
                ) : (
                    <div className={styles.tableSection}>
                        <div className={styles.tableWrapper}>
                            <Table {...getTableProps()} style={{width: '100%', minWidth: '720px'}}>
                                <ContentListHeader headerGroups={headerGroups}/>
                                <TableBody {...getTableBodyProps()}>
                                    {rows.map(row => {
                                        prepareRow(row);
                                        const isSelected = row.original.name === selectedTag;
                                        return (
                                            <TableRow
                                                key={row.id}
                                                {...row.getRowProps()}
                                                data-cm-role="tag-manager-row"
                                                data-tag-name={row.original.name}
                                                className={isSelected ? styles.selectedRow : undefined}
                                            >
                                                {row.cells.map(cell => (
                                                    <React.Fragment key={cell.column.id}>
                                                        {cell.render('Cell')}
                                                    </React.Fragment>
                                                ))}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
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
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            onPageChange={nextPage => setPage(nextPage - 1)}
                            onRowsPerPageChange={newPageSize => setPageSize(newPageSize)}
                        />
                    </div>
                )}
            </div>

            <RenameTagDialog
                key={renameTarget?.name}
                siteKey={siteKey}
                siteName={siteName}
                tag={renameTarget}
                isOpen={Boolean(renameTarget)}
                isLoading={renameState.loading}
                onClose={() => setRenameTarget(null)}
                onConfirm={handleRename}
            />

            <DeleteTagDialog
                siteName={siteName}
                tag={deleteTarget}
                isOpen={Boolean(deleteTarget)}
                isLoading={deleteState.loading}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </>
    );
};

TagManagerTable.propTypes = {
    siteKey: PropTypes.string.isRequired,
    siteName: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        occurrences: PropTypes.number.isRequired
    })).isRequired,
    selectedTag: PropTypes.string,
    totalCount: PropTypes.number.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.object,
    searchTerm: PropTypes.string.isRequired,
    normalizedSearch: PropTypes.string.isRequired,
    sort: PropTypes.shape({
        order: PropTypes.string.isRequired,
        orderBy: PropTypes.string.isRequired
    }).isRequired,
    onSearchChange: PropTypes.func.isRequired,
    onSort: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    onTagRenamed: PropTypes.func.isRequired,
    onTagDeleted: PropTypes.func.isRequired,
    onMutationComplete: PropTypes.func.isRequired
};
