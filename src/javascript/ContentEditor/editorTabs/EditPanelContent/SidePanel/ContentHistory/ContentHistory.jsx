import React, {useState, useCallback} from 'react';
import {useQuery, gql} from '@apollo/client';
import {
    Table,
    TableBody,
    TableHead,
    TableHeadCell,
    TableRow,
    TableBodyCell,
    TablePagination,
    Dropdown,
    Typography
} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import styles from './ContentHistory.scss';

const GET_CONTENT_HISTORY = gql`
    query getNodeHistory($path: String!, $withLanguageNodes: Boolean!, $action: String, $offset: Int!, $limit: Int!) {
        jcr {
            nodeByPath(path: $path) {
                uuid
                history {
                    count(withLanguageNodes: $withLanguageNodes, action: $action)
                    entries(withLanguageNodes: $withLanguageNodes, action: $action, offset: $offset, limit: $limit) {
                        id
                        date
                        path
                        uuid
                        action
                        propertyName
                        userKey
                        message
                        language
                    }
                }
            }
        }
    }
`;

const GET_ALL_ACTIONS = gql`
    query getAllActions($path: String!, $withLanguageNodes: Boolean!) {
        jcr {
            nodeByPath(path: $path) {
                uuid
                history {
                    entries(withLanguageNodes: $withLanguageNodes, offset: 0, limit: 1000) {
                        action
                    }
                }
            }
        }
    }
`;

export const ContentHistory = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData} = useContentEditorContext();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [actionFilter, setActionFilter] = useState(null);

    const {data: actionsData} = useQuery(GET_ALL_ACTIONS, {
        variables: {
            path: nodeData.path,
            withLanguageNodes: true
        },
        fetchPolicy: 'cache-first'
    });

    const {data, loading, error} = useQuery(GET_CONTENT_HISTORY, {
        variables: {
            path: nodeData.path,
            withLanguageNodes: true,
            action: actionFilter,
            offset: (page - 1) * pageSize,
            limit: pageSize
        },
        fetchPolicy: 'cache-and-network'
    });

    const formatDate = useCallback(dateString => {
        if (!dateString) {
            return '';
        }

        return new Date(dateString).toLocaleString();
    }, []);

    const getActionOptions = useCallback(() => {
        const actions = new Set();
        if (actionsData?.jcr?.nodeByPath?.history?.entries) {
            actionsData.jcr.nodeByPath.history.entries.forEach(entry => {
                if (entry.action) {
                    actions.add(entry.action);
                }
            });
        }

        return [
            {value: null, label: t('jcontent:label.contentEditor.history.allActions')},
            ...Array.from(actions).sort().map(action => ({
                value: action,
                label: action
            }))
        ];
    }, [actionsData, t]);

    const entries = data?.jcr?.nodeByPath?.history?.entries || [];
    const totalCount = data?.jcr?.nodeByPath?.history?.count || 0;

    if (loading && !data) {
        return <LoaderOverlay/>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <Typography variant="body">
                    {t('jcontent:label.contentEditor.history.errorLoading')}
                </Typography>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <Dropdown
                    label={t('jcontent:label.contentEditor.history.filterByAction')}
                    value={actionFilter}
                    data={getActionOptions()}
                    size="small"
                    onChange={(e, option) => {
                        setActionFilter(option.value);
                        setPage(1);
                    }}
                />
            </div>

            <div className={styles.tableContainer}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell>
                                {t('jcontent:label.contentEditor.history.date')}
                            </TableHeadCell>
                            <TableHeadCell>
                                {t('jcontent:label.contentEditor.history.property')}
                            </TableHeadCell>
                            <TableHeadCell>
                                {t('jcontent:label.contentEditor.history.language')}
                            </TableHeadCell>
                            <TableHeadCell>
                                {t('jcontent:label.contentEditor.history.modifiedBy')}
                            </TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries.length === 0 ? (
                            <TableRow>
                                <TableBodyCell colSpan={4} className={styles.emptyCell}>
                                    <Typography variant="body">
                                        {t('jcontent:label.contentEditor.history.noEntries')}
                                    </Typography>
                                </TableBodyCell>
                            </TableRow>
                        ) : (
                            entries.map(entry => (
                                <TableRow key={entry.id}>
                                    <TableBodyCell>
                                        <Typography variant="body">
                                            {formatDate(entry.date)}
                                        </Typography>
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Typography variant="body">
                                            {entry.propertyName || '-'}
                                        </Typography>
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Typography variant="body">
                                            {entry.language || '-'}
                                        </Typography>
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <Typography variant="body">
                                            {entry.userKey || '-'}
                                        </Typography>
                                    </TableBodyCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalCount > pageSize && (
                <div className={styles.pagination}>
                    <TablePagination
                        totalNumberOfRows={totalCount}
                        rowsPerPage={pageSize}
                        currentPage={page}
                        label={{
                            rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                            of: t('jcontent:label.pagination.of')
                        }}
                        onPageChange={(page, newPage) => setPage(page)}
                        onRowsPerPageChange={rowsPerPage => {
                            setPageSize(rowsPerPage);
                            setPage(1);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
