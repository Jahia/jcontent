import React, {useState, useCallback} from 'react';
import {useQuery, gql} from '@apollo/client';
import {useSelector} from 'react-redux';
import {
    Dropdown,
    Typography,
    Chip,
    Pill,
    Button,
    ChevronLeft,
    ChevronRight,
    ChevronFirstPage,
    ChevronLastPage,
    AddCircle,
    Edit,
    Delete,
    HandleMove,
    Publish,
    Visibility,
    File,
    Language
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

const ACTION_CONFIG = {
    created: {icon: AddCircle, labelKey: 'jcontent:label.contentEditor.history.actions.created', color: 'accent'},
    updated: {icon: Edit, labelKey: 'jcontent:label.contentEditor.history.actions.updated', color: 'warning'},
    deleted: {icon: Delete, labelKey: 'jcontent:label.contentEditor.history.actions.deleted', color: 'danger'},
    moved: {icon: HandleMove, labelKey: 'jcontent:label.contentEditor.history.actions.moved', color: 'default'},
    added: {icon: AddCircle, labelKey: 'jcontent:label.contentEditor.history.actions.added', color: 'accent'},
    changed: {icon: Edit, labelKey: 'jcontent:label.contentEditor.history.actions.changed', color: 'warning'},
    removed: {icon: Delete, labelKey: 'jcontent:label.contentEditor.history.actions.removed', color: 'danger'},
    published: {icon: Publish, labelKey: 'jcontent:label.contentEditor.history.actions.published', color: 'success'},
    unpublished: {icon: Publish, labelKey: 'jcontent:label.contentEditor.history.actions.unpublished', color: 'default'},
    accessed: {icon: File, labelKey: 'jcontent:label.contentEditor.history.actions.accessed', color: 'default'},
    viewed: {icon: Visibility, labelKey: 'jcontent:label.contentEditor.history.actions.viewed', color: 'default'}
};

const getActionLabel = (action, t) => {
    const config = ACTION_CONFIG[action];
    return config ? t(config.labelKey) : action || '-';
};

const getActionChip = (action, t) => {
    const config = ACTION_CONFIG[action];
    if (!config) {
        return null;
    }

    const IconComponent = config.icon;
    return (
        <Chip
            label={t(config.labelKey)}
            icon={<IconComponent/>}
            color={config.color}
        />
    );
};

export const ContentHistory = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData} = useContentEditorContext();
    const uiLanguage = useSelector(state => state.uilang);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [actionFilter, setActionFilter] = useState(null);

    const {data, loading, error} = useQuery(GET_CONTENT_HISTORY, {
        variables: {
            path: nodeData.path,
            withLanguageNodes: true,
            action: actionFilter,
            offset: page * pageSize,
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
        return [
            {value: null, label: t('jcontent:label.contentEditor.history.allActions')},
            {value: 'created', label: getActionChip('created', t)},
            {value: 'updated', label: getActionChip('updated', t)},
            {value: 'deleted', label: getActionChip('deleted', t)},
            {value: 'moved', label: getActionChip('moved', t)},
            {value: 'added', label: getActionChip('added', t)},
            {value: 'changed', label: getActionChip('changed', t)},
            {value: 'removed', label: getActionChip('removed', t)},
            {value: 'published', label: getActionChip('published', t)},
            {value: 'unpublished', label: getActionChip('unpublished', t)},
            {value: 'accessed', label: getActionChip('accessed', t)},
            {value: 'viewed', label: getActionChip('viewed', t)}
        ];
    }, [t]);

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
                    value={actionFilter}
                    data={getActionOptions()}
                    className={styles.dropDown}
                    variant="outlined"
                    onChange={(e, option) => {
                        setActionFilter(option.value);
                        setPage(0);
                    }}
                />
            </div>

            <div className={styles.listContainer}>
                {entries.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Typography variant="body">
                            {t('jcontent:label.contentEditor.history.noEntries')}
                        </Typography>
                    </div>
                ) : (
                    <>
                        <div className={styles.separator}/>
                        {entries.map(entry => (
                            <React.Fragment key={entry.id}>
                                <div className={styles.historyItem}>
                                    <div className={styles.itemHeader}>
                                        <div className={styles.itemLeft}>
                                            {entry.language ? (
                                                <Pill label={entry.language.toUpperCase()} color="accent"/>
                                            ) : (
                                                <Pill label={<Language/>} color="default"/>
                                            )}
                                            <Typography variant="body" weight="bold">
                                                {entry.propertyNameDisplay || entry.propertyName || getActionLabel(entry.action, t)}
                                            </Typography>
                                        </div>
                                        <div className={styles.itemRight}>
                                            {getActionChip(entry.action, t)}
                                        </div>
                                    </div>
                                    <div className={styles.itemFooter}>
                                        <Typography variant="caption" className={styles.metadata}>
                                            {formatDate(entry.date)} by {entry.userKey || '-'}
                                        </Typography>
                                    </div>
                                </div>
                                <div className={styles.separator}/>
                            </React.Fragment>
                        ))}
                    </>
                )}
            </div>

            {totalCount > pageSize && (
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationControls}>
                        <Button
                            icon={<ChevronFirstPage/>}
                            variant="ghost"
                            size="small"
                            disabled={page === 0}
                            onClick={() => setPage(0)}
                        />
                        <Button
                            icon={<ChevronLeft/>}
                            variant="ghost"
                            size="small"
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                        />
                        <Typography variant="caption" className={styles.paginationInfo}>
                            {(page * pageSize) + 1}-{Math.min(((page + 1) * pageSize), totalCount)} {t('jcontent:label.pagination.of')} {totalCount}
                        </Typography>
                        <Button
                            icon={<ChevronRight/>}
                            variant="ghost"
                            size="small"
                            disabled={(page + 1) * pageSize >= totalCount}
                            onClick={() => setPage(page + 1)}
                        />
                        <Button
                            icon={<ChevronLastPage/>}
                            variant="ghost"
                            size="small"
                            disabled={(page + 1) * pageSize >= totalCount}
                            onClick={() => setPage(Math.ceil(totalCount / pageSize) - 1)}
                        />
                        <Dropdown
                            value={pageSize}
                            data={[
                                {value: 10, label: '10'},
                                {value: 25, label: '25'},
                                {value: 50, label: '50'},
                                {value: 100, label: '100'}
                            ]}
                            size="small"
                            variant="outlined"
                            onChange={(e, option) => {
                                setPageSize(option.value);
                                setPage(0);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
