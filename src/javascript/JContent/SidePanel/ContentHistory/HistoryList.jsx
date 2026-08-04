import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {Chip, Language, Pill, Typography} from '@jahia/moonstone';
import styles from './ContentHistory.scss';
import {ACTION_CONFIG} from './ContentHistory';
import {formatDatetime} from 'date-formatter';

const MAX_DISPLAY_NAME_LENGTH = 80;

const truncateDisplayName = str => {
    if (!str || str.length <= MAX_DISPLAY_NAME_LENGTH) {
        return str;
    }

    return str.slice(0, MAX_DISPLAY_NAME_LENGTH) + '\u2026';
};

const getTargetInfo = entry => {
    const isProperty = Boolean(entry.propertyName);
    const fullDisplayName = isProperty ?
        (entry.propertyNameDisplay || entry.propertyName) :
        (entry.nodeNameDisplay || entry.nodeName || entry.path?.split('/').findLast(Boolean) || '-');
    const technicalName = isProperty ?
        entry.propertyName :
        (entry.nodeName || entry.path?.split('/').findLast(Boolean) || '-');
    return {
        typeLabelKey: isProperty ?
            'jcontent:label.contentEditor.history.property' :
            'jcontent:label.contentEditor.history.node',
        displayName: truncateDisplayName(fullDisplayName),
        fullDisplayName,
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

const HistoryList = React.memo(({entries, uiLanguage, t}) => {
    const formatDate = useCallback(dateString => {
        if (!dateString) {
            return '-';
        }

        return formatDatetime(dateString, {locale: uiLanguage});
    }, [uiLanguage]);

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

    return entries.map(entry => {
        const {typeLabelKey, displayName, fullDisplayName, technicalName} = getTargetInfo(entry);
        return (
            <div key={entry.id} className={styles.historyItem} data-sel-role="history-item">
                <div className={styles.itemAction}>
                    {getActionChip(entry.action, t)}
                    <Typography variant="caption" isNowrap className={styles.typeLabel}>
                        {t(typeLabelKey)}
                    </Typography>
                </div>
                <div className={styles.itemContent}>
                    <div className={styles.itemNames}>
                        <Typography variant="body" weight="bold" isNowrap className={`${styles.targetName} moon-flexFluid`} title={fullDisplayName}>
                            {displayName}
                        </Typography>
                        {technicalName !== displayName && (
                            <Typography variant="body" isNowrap className={styles.technicalName}>
                                ({technicalName})
                            </Typography>
                        )}
                    </div>
                    <Typography variant="caption" isNowrap className={styles.metadata}>
                        {t('jcontent:label.contentEditor.history.dateBy', {date: formatDate(entry.date), user: getUserDisplayName(entry)})}
                    </Typography>
                </div>
                {entry.language ? (
                    <Pill className={styles.itemLanguage} label={entry.language?.toUpperCase()} color="default"/>
                ) : (
                    <Pill className={styles.itemLanguage} label={<Language size="small"/>} color="default"/>
                )}
            </div>
        );
    });
});

HistoryList.displayName = 'HistoryList';

HistoryList.propTypes = {
    entries: PropTypes.arrayOf(PropTypes.object).isRequired,
    uiLanguage: PropTypes.string,
    t: PropTypes.func.isRequired
};

export {HistoryList};
