import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {Chip, Language, Pill, Typography} from '@jahia/moonstone';
import styles from './ContentHistory.scss';
import {ACTION_CONFIG} from './ContentHistory';
import dayjs from 'dayjs';

const getTargetInfo = entry => {
    const isProperty = Boolean(entry.propertyName);
    const displayName = isProperty ?
        (entry.propertyNameDisplay || entry.propertyName) :
        (entry.nodeNameDisplay || entry.nodeName || entry.path?.split('/').filter(Boolean).pop() || '-');
    const technicalName = isProperty ?
        entry.propertyName :
        (entry.nodeName || entry.path?.split('/').filter(Boolean).pop() || '-');
    return {
        typeLabelKey: isProperty ?
            'jcontent:label.contentEditor.history.property' :
            'jcontent:label.contentEditor.history.node',
        displayName,
        technicalName
    };
};

const getUserDisplayName = entry => {
    const {user, userKey} = entry;
    if (user) {
        const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ');
        return fullName || user.displayName || user.username || userKey || '-';
    }

    return userKey || '-';
};

const HistoryList = React.memo(({isLoading, error, entries, data, uiLanguage, t}) => {
    const formatDate = useCallback(dateString => {
        if (!dateString) {
            return '-';
        }

        return dayjs(dateString).locale(uiLanguage).format('L HH:mm');
    }, [uiLanguage]);

    if (isLoading && !data) {
        return <LoaderOverlay/>;
    }

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
        const {typeLabelKey, displayName, technicalName} = getTargetInfo(entry);
        return (
            <div key={entry.id} className={styles.historyItem} data-sel-role="history-item">
                <div className={styles.itemAction}>
                    {getActionChip(entry.action, t)}
                </div>
                <div className={styles.itemContent}>
                    <div className={styles.itemNames}>
                        <Typography variant="body" weight="bold" className={styles.targetName}>
                            {displayName}
                        </Typography>
                        {technicalName !== displayName && (
                            <Typography variant="body" className={styles.technicalName}>
                                ({technicalName})
                            </Typography>
                        )}
                        <Typography variant="caption" weight="bold" className={styles.typeLabel}>
                            {t(typeLabelKey)}
                        </Typography>
                    </div>
                    <Typography variant="caption" className={styles.metadata}>
                        {t('jcontent:label.contentEditor.history.dateBy', {date: formatDate(entry.date), user: getUserDisplayName(entry)})}
                    </Typography>
                </div>
                <div className={styles.itemLanguage}>
                    {entry.language ? (
                        <Pill label={entry.language.toUpperCase()} color="default"/>
                    ) : (
                        <Pill label={<Language/>} color="default"/>
                    )}
                </div>
            </div>
        );
    });
});

HistoryList.displayName = 'HistoryList';

HistoryList.propTypes = {
    isLoading: PropTypes.bool,
    error: PropTypes.object,
    entries: PropTypes.arrayOf(PropTypes.object).isRequired,
    data: PropTypes.object,
    uiLanguage: PropTypes.string,
    t: PropTypes.func.isRequired
};

HistoryList.defaultProps = {
    isLoading: false,
    error: undefined,
    data: undefined
};

export {HistoryList};
