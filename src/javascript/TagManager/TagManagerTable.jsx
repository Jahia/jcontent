import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {useTable} from 'react-table';
import {useTranslation} from 'react-i18next';
import {
    Button,
    DeletePermanently,
    Edit,
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
import styles from './TagManager.scss';

/* eslint-disable react/prop-types */
export const TagManagerTable = ({
    tags,
    selectedTag,
    totalCount,
    page,
    pageSize,
    sort,
    onSort,
    onPageChange,
    onPageSizeChange,
    onView,
    onRename,
    onDelete
}) => {
    const {t} = useTranslation('jcontent');

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
                                onClick={() => onRename(row.original)}
                            />
                        </Tooltip>
                        <Tooltip label={t('jcontent:label.contentManager.tagManager.table.actions.remove')}>
                            <Button
                                variant="ghost"
                                color="danger"
                                size="small"
                                data-cm-role="tag-manager-delete"
                                icon={<DeletePermanently/>}
                                onClick={() => onDelete(row.original)}
                            />
                        </Tooltip>
                    </div>
                </TableBodyCell>
            )
        }
    ]), [onDelete, onRename, onView, t]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({
        columns,
        data: tags,
        sort,
        onSort: (column, order) => onSort({order, orderBy: column.property})
    }, reactTable.useSort);

    return (
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
                onPageChange={nextPage => onPageChange(nextPage - 1)}
                onRowsPerPageChange={onPageSizeChange}
            />
        </div>
    );
};

TagManagerTable.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        occurrences: PropTypes.number.isRequired
    })).isRequired,
    selectedTag: PropTypes.string,
    totalCount: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    sort: PropTypes.shape({
        order: PropTypes.string.isRequired,
        orderBy: PropTypes.string.isRequired
    }).isRequired,
    onSort: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onPageSizeChange: PropTypes.func.isRequired,
    onView: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

TagManagerTable.defaultProps = {
    selectedTag: null
};
