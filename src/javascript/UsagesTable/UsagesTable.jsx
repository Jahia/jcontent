import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styles from './UsagesTable.scss';
import {Table, TableBody, TablePagination, TableRow, Typography} from '@jahia/moonstone';
import {useTable} from 'react-table';
import {allColumnData} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns';
import {ContentListHeader} from '~/JContent/ContentRoute/ContentLayout/ContentTable';
import * as reactTable from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';
import {useQuery} from '@apollo/client';
import {UsagesQuery} from './UsagesTable.gql-queries';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import PropTypes from 'prop-types';

const defaultCols = ['publicationStatus', 'name', 'type', 'location'];
const columns = defaultCols.map(c => (typeof c === 'string') ? allColumnData.find(col => col.id === c) : c);

export const UsagesTable = ({path, language}) => {
    const {t} = useTranslation('jcontent');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState({order: 'ASC', orderBy: 'displayName'});
    const {data, loading} = useQuery(UsagesQuery, {
        variables: {
            path,
            language,
            pageSize: pageSize,
            currentPage: currentPage * pageSize,
            fieldSorter: sort.orderBy === '' ? null : {
                sortType: sort.order === '' ? null : (sort.order === 'DESC' ? 'DESC' : 'ASC'),
                fieldName: sort.orderBy === '' ? null : 'node.' + sort.orderBy,
                ignoreCase: true
            }
        }
    });

    const usages = data?.jcr?.nodeByPath?.usages?.nodes ? Object.values(data.jcr.nodeByPath.usages.nodes.reduce((acc, ref) => (
        {
            ...acc,
            [ref.node.uuid]: {
                ...ref.node,
                locales: acc[ref.node.uuid] ? [...acc[ref.node.uuid]?.locales, ref.language] : [ref.language]
            }
        }
    ), {})) : [];

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow
    } = useTable(
        {
            columns: columns,
            data: usages,
            sort,
            onSort: (column, order) => {
                setSort({order, orderBy: column.property});
            }
        },
        reactTable.useSort
    );

    if (loading) {
        return <LoaderOverlay/>;
    }

    if (usages.length === 0) {
        return (
            <section className={styles.container}>
                <Typography variant="heading">
                    {t('jcontent:label.contentEditor.edit.advancedOption.usages.none')}
                </Typography>
                <Typography variant="body">
                    {t('jcontent:label.contentEditor.edit.advancedOption.usages.noneDescription')}
                </Typography>
            </section>
        );
    }

    return (
        <section className={styles.tableContainer}>
            <Table aria-labelledby="tableUsages"
                   data-cm-role="table-usages-list"
                   {...getTableProps()}
            >
                <ContentListHeader headerGroups={headerGroups} headerClasses={styles}/>
                <TableBody {...getTableBodyProps()}>
                    {tableRows.map(row => {
                        prepareRow(row);
                        return (
                            <TableRow key={'row' + row.id}
                                      {...row}
                            >
                                {row.cells.map(cell => (
                                    <React.Fragment
                                        key={cell.column.id}
                                    >{cell.render('Cell')}
                                    </React.Fragment>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
                <TablePagination totalNumberOfRows={data?.jcr?.nodeByPath?.usages?.pageInfo.totalCount}
                                 currentPage={currentPage + 1}
                                 rowsPerPage={pageSize}
                                 label={{
                                     rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                                     of: t('jcontent:label.pagination.of')
                                 }}
                                 rowsPerPageOptions={[10, 20, 50]}
                                 onPageChange={page => setCurrentPage(page - 1)}
                                 onRowsPerPageChange={size => setPageSize(size)}
                />
            </Table>
        </section>
    );
};

UsagesTable.propTypes = {
    path: PropTypes.string.isRequired,

    language: PropTypes.string.isRequired
};
