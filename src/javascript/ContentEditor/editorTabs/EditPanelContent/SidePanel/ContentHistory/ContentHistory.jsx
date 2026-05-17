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
    VisibilityCondition,
    File,
    Language,
    Link,
    Lock,
    ContentReference,
    Pagination,
    Workflow
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
                        user {
                            username
                            firstname
                            lastname
                            displayName
                        }
                        message
                        language
                        childNodeType
                        subNodeName
                        nodeDisplayName
                        acePrincipal {
                            verb
                            principalType
                            principalName
                            user {
                                username
                                firstname
                                lastname
                                displayName
                            }
                        }
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

/**
 * Configuration for each HistoryEntry.ChildNodeType value.
 * icon: Moonstone icon component for the sub-node badge (null = no badge for MAIN)
 * color: Pill colour
 * labelKey: i18n key for the type label
 */
const CHILD_NODE_TYPE_CONFIG = {
    MAIN: {icon: ContentReference, color: 'default', labelKey: 'jcontent:label.contentEditor.history.childNodeType.main'},
    PROPERTY: {icon: Language, color: 'default', labelKey: 'jcontent:label.contentEditor.history.childNodeType.property'},
    TRANSLATION: {icon: Language, color: 'accent', labelKey: 'jcontent:label.contentEditor.history.childNodeType.translation'},
    ACL: {icon: Lock, color: 'default', labelKey: 'jcontent:label.contentEditor.history.childNodeType.acl'},
    VISIBILITY: {icon: VisibilityCondition, color: 'default', labelKey: 'jcontent:label.contentEditor.history.childNodeType.visibility'},
    VISIBILITY_PROPERTY: {icon: VisibilityCondition, color: 'default', labelKey: 'jcontent:label.contentEditor.history.childNodeType.visibility'},
    VANITY_URL: {icon: Link, color: 'default', labelKey: 'jcontent:label.contentEditor.history.childNodeType.vanityUrl'},
    VANITY_URL_PROPERTY: {icon: Link, color: 'default', labelKey: 'jcontent:label.contentEditor.history.childNodeType.vanityUrl'},
    OTHER: {icon: File, color: 'default', labelKey: 'jcontent:label.contentEditor.history.childNodeType.other'}
};

/**
 * Returns the left-side Pill badge for a history entry.
 * When childNodeType is available (path-based API), uses a semantic icon.
 * ACL badges are coloured: green (success) for GRANT, red (danger) for DENY.
 * Falls back to the language-based pill for legacy entries (childNodeType is null).
 */
const getSubNodeBadge = entry => {
    const {childNodeType, language, acePrincipal} = entry;

    if (!childNodeType) {
        // Legacy fallback: language pill or globe icon
        return language ?
            <Pill label={language.toUpperCase()} color="accent"/> :
            <Pill label={<Language/>} color="default"/>;
    }

    if (childNodeType === 'TRANSLATION' && language) {
        return <Pill label={language.toUpperCase()} color="accent"/>;
    }

    if (childNodeType === 'ACL' && acePrincipal) {
        const color = acePrincipal.verb === 'DENY' ? 'danger' : 'success';
        return <Pill label={<Lock/>} color={color}/>;
    }

    const config = CHILD_NODE_TYPE_CONFIG[childNodeType];
    const IconComponent = config?.icon ?? File;
    return <Pill label={<IconComponent/>} color={config?.color ?? 'default'}/>;
};

/**
 * Returns the translated type label for a history entry.
 * For VANITY_URL_PROPERTY and VISIBILITY_PROPERTY, the parent sub-node name is interpolated
 * into the label so the editor can see exactly which vanity/condition was affected.
 */
const getTypeLabel = (entry, t) => {
    const {childNodeType, propertyName, acePrincipal, subNodeName, path} = entry;

    if (!childNodeType) {
        return t(propertyName ?
            'jcontent:label.contentEditor.history.property' :
            'jcontent:label.contentEditor.history.node');
    }

    if (childNodeType === 'ACL' && acePrincipal) {
        if (propertyName) {
            return t('jcontent:label.contentEditor.history.acl.rolesFor');
        }

        return t(acePrincipal.verb === 'DENY' ?
            'jcontent:label.contentEditor.history.acl.deniedTo' :
            'jcontent:label.contentEditor.history.acl.grantedTo');
    }

    if (childNodeType === 'PROPERTY' ||
            (propertyName && (childNodeType === 'MAIN' || childNodeType === 'TRANSLATION'))) {
        return t('jcontent:label.contentEditor.history.property');
    }

    if (childNodeType === 'VANITY_URL_PROPERTY' || childNodeType === 'VISIBILITY_PROPERTY') {
        const nodeName = subNodeName || lastPathSegment(path);
        const key = childNodeType === 'VANITY_URL_PROPERTY' ?
            'jcontent:label.contentEditor.history.childNodeType.vanityUrlProperty' :
            'jcontent:label.contentEditor.history.childNodeType.visibilityProperty';
        return t(key, {nodeName});
    }

    const labelKey = CHILD_NODE_TYPE_CONFIG[childNodeType]?.labelKey ?? 'jcontent:label.contentEditor.history.node';
    return t(labelKey);
};

const getVanityNodeName = (subNodeName, path, propertyName) => {
    if (subNodeName) {
        return subNodeName;
    }

    // Fallback: parse from path for older Jahia versions
    const parts = path ? path.split('/').filter(Boolean) : [];
    const lastPart = parts[parts.length - 1];
    return lastPart === propertyName && parts.length >= 2 ?
        parts[parts.length - 2] :
        lastPart;
};

const lastPathSegment = path => path ? path.split('/').filter(Boolean).pop() || path : '-';

const getAcePrincipalName = (acePrincipal, t) => {
    const {principalType, principalName, user} = acePrincipal;
    return user?.displayName || user?.username ||
        (principalType === 'GROUP' ?
            t('jcontent:label.contentEditor.history.ace.group', {name: principalName}) :
            principalName);
};

/**
 * Returns the human-readable target name for a history entry.
 * Priority order:
 *  1. ACE principal display name (for ACL sub-nodes)
 *  2. VANITY_URL_PROPERTY / VISIBILITY_PROPERTY — sub-node name from service
 *  3. PROPERTY / legacy MAIN+propertyName / TRANSLATION+propertyName — property display name
 *  4. Legacy VANITY_URL+propertyName — vanity node name
 *  5. Language code for bare TRANSLATION entries
 *  6. Node display name for MAIN, last path segment otherwise
 */
const getTargetName = (entry, t) => {
    const {childNodeType, propertyName, propertyNameDisplay, path, language, acePrincipal, nodeDisplayName, subNodeName} = entry;

    if (acePrincipal) {
        return getAcePrincipalName(acePrincipal, t);
    }

    if (childNodeType === 'VANITY_URL_PROPERTY' || childNodeType === 'VISIBILITY_PROPERTY') {
        return subNodeName || lastPathSegment(path);
    }

    if (childNodeType === 'PROPERTY' ||
            (propertyName && (childNodeType === 'MAIN' || childNodeType === 'TRANSLATION'))) {
        return propertyNameDisplay || propertyName;
    }

    if (childNodeType === 'VANITY_URL' && propertyName) {
        return getVanityNodeName(subNodeName, path, propertyName) || null;
    }

    if (propertyName) {
        return propertyNameDisplay || propertyName;
    }

    if (childNodeType === 'TRANSLATION' && language) {
        return language.toUpperCase();
    }

    if (!childNodeType || childNodeType === 'MAIN') {
        return nodeDisplayName || lastPathSegment(path);
    }

    return lastPathSegment(path);
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

        return new Date(dateString).toLocaleString();
    }, []);

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
            const badge = getSubNodeBadge(entry);
            const typeLabel = getTypeLabel(entry, t);
            const targetName = getTargetName(entry, t);
            return (
                <React.Fragment key={entry.id}>
                    <div className={styles.historyItem} data-sel-role="history-item">
                        <div className={styles.itemHeader}>
                            <div className={styles.itemLeft}>
                                {badge}
                                <Typography variant="caption" className={styles.typeLabel}>
                                    {typeLabel}
                                </Typography>
                                {targetName && (
                                    <Typography variant="body" weight="bold" className={styles.targetName}>
                                        {targetName}
                                    </Typography>
                                )}
                            </div>
                            <div className={styles.itemRight}>
                                {getActionChip(entry.action, t)}
                            </div>
                        </div>
                        <div className={styles.itemFooter}>
                            <Typography variant="caption" className={styles.metadata}>
                                {formatDate(entry.date)} by {getUserDisplayName(entry)}
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
