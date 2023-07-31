import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styles from './Usages.scss';
import {Table, TableBody, TablePagination, TableRow, Typography} from '@jahia/moonstone';
import {useTable} from 'react-table';
import {allColumnData} from '~/ContentEditor/SelectorTypes/Picker/reactTable/columns';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {ContentListHeader} from '~/JContent/ContentRoute/ContentLayout/ContentTable';
import * as reactTable from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';
import {useQuery} from '@apollo/client';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {UsagesQuery} from './Usages.gql-queries';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';

const defaultCols = ['publicationStatus', 'name', 'type', 'location'];
const columns = defaultCols.map(c => (typeof c === 'string') ? allColumnData.find(col => col.id === c) : c);

export const Usages = () => {
    const {t} = useTranslation('jcontent');

    const {nodeData} = useContentEditorContext();
    const {lang} = useContentEditorConfigContext();
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const {data, loading} = useQuery(UsagesQuery, {
        variables: {
            path: nodeData.path,
            language: lang,
            pageSize: pageSize,
            currentPage: currentPage * pageSize
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
            sort: {orderBy: 'name'}
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

Usages.propTypes = {};
