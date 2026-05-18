import React, {useState, useCallback} from 'react';
import {useQuery, gql} from '@apollo/client';
import {useSelector} from 'react-redux';
import {
    Dropdown,
    Typography,
    Chip,
    Pill,
    AddCircle,
    Edit,
    Delete,
    HandleMove,
    CloudUpload,
    NoCloud,
    Visibility,
    File,
    Language,
    Pagination,
    Workflow
} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import dayjs from '~/ContentEditor/date.config';
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
                        user {
                            username
                            firstname
                            lastname
                            displayName
                        }
                        message
                        language
                    }
                }
            }
        }
    }
`;

const ACTION_CONFIG = {
    // --- Confirmed actions observed in production ---
    added: {icon: AddCircle, labelKey: 'jcontent:label.contentEditor.history.actions.added', color: 'accent', used: true},
    changed: {icon: Edit, labelKey: 'jcontent:label.contentEditor.history.actions.changed', color: 'warning', used: true},
    created: {icon: AddCircle, labelKey: 'jcontent:label.contentEditor.history.actions.created', color: 'accent', used: true},
    deleted: {icon: Delete, labelKey: 'jcontent:label.contentEditor.history.actions.deleted', color: 'danger', used: true},
    moved: {icon: HandleMove, labelKey: 'jcontent:label.contentEditor.history.actions.moved', color: 'default', used: true},
    published: {icon: CloudUpload, labelKey: 'jcontent:label.contentEditor.history.actions.published', color: 'success', used: true},
    removed: {icon: Delete, labelKey: 'jcontent:label.contentEditor.history.actions.removed', color: 'danger', used: true},
    unpublished: {icon: NoCloud, labelKey: 'jcontent:label.contentEditor.history.actions.unpublished', color: 'default', used: true},
    // --- Not yet observed; kept for rendering if they appear in the history stream ---
    // Updated: triggered by some legacy or external integrations writing directly to JCR
    updated: {icon: Edit, labelKey: 'jcontent:label.contentEditor.history.actions.updated', color: 'warning', used: false},
    // Viewed/accessed: requires the metrics/access-tracking module to be enabled
    viewed: {icon: Visibility, labelKey: 'jcontent:label.contentEditor.history.actions.viewed', color: 'default', used: false},
    accessed: {icon: File, labelKey: 'jcontent:label.contentEditor.history.actions.accessed', color: 'default', used: false},
    // Previewed: triggered when a contributor previews a draft in the rendering engine
    previewed: {icon: Visibility, labelKey: 'jcontent:label.contentEditor.history.actions.previewed', color: 'default', used: false},
    // Workflow_started/finished: require the Jahia workflow module and a workflow definition on the content type
    /* eslint-disable camelcase */
    workflow_started: {icon: Workflow, labelKey: 'jcontent:label.contentEditor.history.actions.workflow_started', color: 'default', used: false},
    workflow_finished: {icon: Workflow, labelKey: 'jcontent:label.contentEditor.history.actions.workflow_finished', color: 'success', used: false}
    /* eslint-enable camelcase */
};

const getTargetInfo = entry => {
    const isProperty = Boolean(entry.propertyName);
    const name = isProperty ?
        (entry.propertyNameDisplay || entry.propertyName) :
        (entry.path ? entry.path.split('/').filter(Boolean).pop() || entry.path : '-');
    return {
        typeLabelKey: isProperty ?
            'jcontent:label.contentEditor.history.property' :
            'jcontent:label.contentEditor.history.node',
        name
    };
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

const getUserDisplayName = entry => {
    const {user, userKey} = entry;
    if (user) {
        const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ');
        return fullName || user.displayName || user.username || userKey || '-';
    }

    return userKey || '-';
};

export const ContentHistory = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData} = useContentEditorContext();
    const uiLanguage = useSelector(state => state.uilang);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
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

        return dayjs(dateString).locale(uiLanguage).format('LLL');
    }, [uiLanguage]);

    const getActionOptions = useCallback(() => {
        const trackedOptions = Object.entries(ACTION_CONFIG)
            .filter(([, config]) => config.used)
            .map(([value]) => ({value, label: getActionChip(value, t)}));
        return [
            {value: null, label: t('jcontent:label.contentEditor.history.allActions')},
            ...trackedOptions
        ];
    }, [t]);

    const entries = data?.jcr?.nodeByPath?.history?.entries || [];
    const totalCount = data?.jcr?.nodeByPath?.history?.count || 0;

    const renderListContent = () => {
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

        if (entries.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <Typography variant="body">
                        {t('jcontent:label.contentEditor.history.noEntries')}
                    </Typography>
                </div>
            );
        }

        return entries.map(entry => {
            const {typeLabelKey, name} = getTargetInfo(entry);
            return (
                <React.Fragment key={entry.id}>
                    <div className={styles.historyItem} data-sel-role="history-item">
                        <div className={styles.itemHeader}>
                            <div className={styles.itemLeft}>
                                {entry.language ? (
                                    <Pill label={entry.language.toUpperCase()} color="accent"/>
                                ) : (
                                    <Pill label={<Language/>} color="default"/>
                                )}
                                <Typography variant="caption" className={styles.typeLabel}>
                                    {t(typeLabelKey)}
                                </Typography>
                                <Typography variant="body" weight="bold" className={styles.targetName}>
                                    {name}
                                </Typography>
                            </div>
                            <div className={styles.itemRight}>
                                {getActionChip(entry.action, t)}
                            </div>
                        </div>
                        <div className={styles.itemFooter}>
                            <Typography variant="caption" className={styles.metadata}>
                                {t('jcontent:label.contentEditor.history.dateBy', {date: formatDate(entry.date), user: getUserDisplayName(entry)})}
                            </Typography>
                        </div>
                    </div>
                    <div className={styles.separator}/>
                </React.Fragment>
            );
        });
    };

    return (
        <div className={styles.container} data-sel-role="history-container">
            <div className={styles.filters} data-sel-role="history-action-filter">
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
                {renderListContent()}
            </div>

            {totalCount > 0 && (
                <div className={styles.paginationContainer}>
                    <Pagination
                        totalOfItems={totalCount}
                        currentPage={page + 1}
                        itemsPerPage={pageSize}
                        itemsPerPageOptions={[20, 50, 100]}
                        i18n={{
                            itemsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                            of: t('jcontent:label.pagination.of')
                        }}
                        onPageChange={newPage => setPage(newPage - 1)}
                        onItemsPerPageChange={newPageSize => {
                            setPageSize(newPageSize);
                            setPage(0);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
