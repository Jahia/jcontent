import React, {useState, useMemo} from 'react';
import {useQuery} from '@apollo/client';
import {GetContentHistoryQuery} from './ContentHistory.gql-queries';
import {useSelector} from 'react-redux';
import {
    Dropdown,
    AddCircle,
    Edit,
    Delete,
    HandleMove,
    CloudUpload,
    NoCloud,
    Pagination
} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useSidePanelContext} from '~/JContent/SidePanel';
import styles from './ContentHistory.scss';
import {HistoryList} from '~/JContent/SidePanel/ContentHistory/HistoryList';

export const ACTION_CONFIG = {
    // --- Confirmed actions observed in production ---
    added: {icon: AddCircle, labelKey: 'jcontent:label.contentEditor.history.actions.added', color: 'accent', used: true, group: 'property'},
    changed: {icon: Edit, labelKey: 'jcontent:label.contentEditor.history.actions.changed', color: 'warning', used: true, group: 'property'},
    created: {icon: AddCircle, labelKey: 'jcontent:label.contentEditor.history.actions.created', color: 'accent', used: true, group: 'node'},
    deleted: {icon: Delete, labelKey: 'jcontent:label.contentEditor.history.actions.deleted', color: 'danger', used: true, group: 'node'},
    moved: {icon: HandleMove, labelKey: 'jcontent:label.contentEditor.history.actions.moved', color: 'default', used: true, group: 'node'},
    published: {icon: CloudUpload, labelKey: 'jcontent:label.contentEditor.history.actions.published', color: 'success', used: true, group: 'node'},
    removed: {icon: Delete, labelKey: 'jcontent:label.contentEditor.history.actions.removed', color: 'danger', used: true, group: 'property'},
    unpublished: {icon: NoCloud, labelKey: 'jcontent:label.contentEditor.history.actions.unpublished', color: 'default', used: true, group: 'node'}
    // --- Not yet observed; kept for rendering if they appear in the history stream ---
    // Updated: triggered by some legacy or external integrations writing directly to JCR
    // updated: {icon: Edit, labelKey: 'jcontent:label.contentEditor.history.actions.updated', color: 'warning', used: false, group: 'node'},
    // Viewed/accessed: requires the metrics/access-tracking module to be enabled
    // viewed: {icon: Visibility, labelKey: 'jcontent:label.contentEditor.history.actions.viewed', color: 'default', used: false, group: 'node'},
    // accessed: {icon: File, labelKey: 'jcontent:label.contentEditor.history.actions.accessed', color: 'default', used: false, group: 'node'},
    // Previewed: triggered when a contributor previews a draft in the rendering engine
    // previewed: {icon: Visibility, labelKey: 'jcontent:label.contentEditor.history.actions.previewed', color: 'default', used: false, group: 'node'},
    // Workflow_started/finished: require the Jahia workflow module and a workflow definition on the content type
    // workflow_started: {icon: Workflow, labelKey: 'jcontent:label.contentEditor.history.actions.workflow_started', color: 'default', used: false, group: 'node'},
    // workflow_finished: {icon: Workflow, labelKey: 'jcontent:label.contentEditor.history.actions.workflow_finished', color: 'success', used: false, group: 'node'}
};

export const ContentHistory = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData} = useSidePanelContext();
    const uiLanguage = useSelector(state => state.uilang);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [actionFilter, setActionFilter] = useState(null);

    const {data, loading, error} = useQuery(GetContentHistoryQuery, {
        variables: {
            path: nodeData?.path,
            withLanguageNodes: true,
            action: actionFilter,
            offset: page * pageSize,
            limit: pageSize,
            uiLanguage: uiLanguage
        },
        skip: !nodeData?.path,
        fetchPolicy: 'cache-and-network'
    });

    const getActionOptions = useMemo(() => {
        const toOption = ([value, config]) => ({
            value,
            label: t(config.labelKey),
            iconStart: React.createElement(config.icon)
        });

        const nodeOptions = Object.entries(ACTION_CONFIG)
            .filter(([, config]) => config.used && config.group === 'node')
            .map(toOption);

        const propertyOptions = Object.entries(ACTION_CONFIG)
            .filter(([, config]) => config.used && config.group === 'property')
            .map(toOption);

        return [
            {groupLabel: '', options: [{value: null, label: t('jcontent:label.contentEditor.history.allActions')}]},
            {groupLabel: t('jcontent:label.contentEditor.history.node'), options: nodeOptions},
            {groupLabel: t('jcontent:label.contentEditor.history.property'), options: propertyOptions}
        ];
    }, [t]);

    const entries = data?.jcr?.nodeByPath?.history?.entries || [];
    const totalCount = data?.jcr?.nodeByPath?.history?.count || 0;

    return (
        <div className={styles.container} data-sel-role="history-container">
            <div className={styles.filters} data-sel-role="history-action-filter">
                <Dropdown
                    value={actionFilter}
                    data={getActionOptions}
                    className={styles.dropDown}
                    variant="outlined"
                    onChange={(e, option) => {
                        setActionFilter(option.value);
                        setPage(0);
                    }}
                />
            </div>

            <div className={styles.listContainer}>
                <HistoryList
                    isLoading={loading}
                    error={error}
                    entries={entries}
                    data={data}
                    uiLanguage={uiLanguage}
                    t={t}
                />
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
