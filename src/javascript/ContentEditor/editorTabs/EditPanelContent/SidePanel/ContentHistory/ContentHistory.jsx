import React, {useState, useCallback} from 'react';
import {useQuery, gql} from '@apollo/client';
import {useSelector} from 'react-redux';
import {
    Table,
    TableBody,
    TableHead,
    TableHeadCell,
    TableRow,
    TableBodyCell,
    TablePagination,
    Dropdown,
    Typography,
    Chip,
    Tooltip,
    AddCircle,
    Edit,
    Delete,
    HandleMove,
    Publish,
    Visibility,
    File
} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import styles from './ContentHistory.scss';

const GET_CONTENT_HISTORY = gql`
    query getNodeHistory($path: String!, $withLanguageNodes: Boolean!, $action: String, $offset: Int!, $limit: Int!, $uiLanguage: String!) {
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
                        propertyNameDisplay(language: $uiLanguage)
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

const getActionChip = (action, t) => {
    const actionConfig = {
        // Node actions
        created: {icon: AddCircle, label: t('jcontent:label.contentEditor.history.actions.created'), color: 'accent'},
        updated: {icon: Edit, label: t('jcontent:label.contentEditor.history.actions.updated'), color: 'default'},
        deleted: {icon: Delete, label: t('jcontent:label.contentEditor.history.actions.deleted'), color: 'danger'},
        moved: {icon: HandleMove, label: t('jcontent:label.contentEditor.history.actions.moved'), color: 'default'},

        // Property actions
        added: {icon: AddCircle, label: t('jcontent:label.contentEditor.history.actions.added'), color: 'accent'},
        changed: {icon: Edit, label: t('jcontent:label.contentEditor.history.actions.changed'), color: 'default'},
        removed: {icon: Delete, label: t('jcontent:label.contentEditor.history.actions.removed'), color: 'danger'},

        // Publication actions
        published: {icon: Publish, label: t('jcontent:label.contentEditor.history.actions.published'), color: 'success'},
        unpublished: {icon: Publish, label: t('jcontent:label.contentEditor.history.actions.unpublished'), color: 'warning'},

        // View/Access actions
        accessed: {icon: File, label: t('jcontent:label.contentEditor.history.actions.accessed'), color: 'default'},
        viewed: {icon: Visibility, label: t('jcontent:label.contentEditor.history.actions.viewed'), color: 'default'}
    };

    const config = actionConfig[action];
    if (!config) {
        return null;
    }

    const IconComponent = config.icon;
    return (
        <Tooltip label={config.label}>
            <Chip
                icon={<IconComponent/>}
                color={config.color}
                size="small"
            />
        </Tooltip>
    );
};

export const ContentHistory = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData} = useContentEditorContext();
    const uiLanguage = useSelector(state => state.uilang);
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
            limit: pageSize,
            uiLanguage: uiLanguage
        },
        fetchPolicy: 'cache-and-network'
    });

    const formatDate = useCallback(dateString => {
        if (!dateString) {
            return '-';
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
            ...Array.from(actions).sort().map(action => {
                const chip = getActionChip(action, t);
                return {
                    value: action,
                    label: action,
                    iconStart: chip
                };
            })
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
        <div>
            <div>
                <Dropdown
                    value={actionFilter}
                    data={getActionOptions()}
                    size="small"
                    variant="outlined"
                    onChange={(e, option) => {
                        setActionFilter(option.value);
                        setPage(1);
                    }}
                />
            </div>

            <div>
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
                                {t('jcontent:label.contentEditor.history.languageShort')}
                            </TableHeadCell>
                            <TableHeadCell>
                                {t('jcontent:label.contentEditor.history.modifiedBy')}
                            </TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries.length === 0 ? (
                            <TableRow>
                                <TableBodyCell colSpan={4}>
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
                                        <Typography variant="body" isNowrap>
                                            {getActionChip(entry.action, t)}
                                            {entry.propertyNameDisplay || entry.propertyName || '-'}
                                        </Typography>
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {entry.language ? (
                                            <span>
                                                {entry.language.toUpperCase()}
                                            </span>
                                        ) : (
                                            <Typography variant="body">-</Typography>
                                        )}
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
