import React, {useCallback} from 'react';
import {Typography, Button, Copy} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './ContentDetails.scss';

const DetailRow = ({label, value, children}) => {
    const {t} = useTranslation('jcontent');
    const notificationContext = useNotifications();

    const handleCopy = useCallback(() => {
        if (value) {
            navigator.clipboard.writeText(value).then(() => {
                notificationContext.notify(t('jcontent:label.contentEditor.sidePanel.copiedToClipboard'), ['closeButton']);
            });
        }
    }, [value, notificationContext, t]);

    if (!value && !children) {
        return null;
    }

    return (
        <div className={styles.detailRow}>
            <Typography variant="caption" className={styles.label}>
                {label}
            </Typography>
            <div className={styles.valueContainer}>
                <div className={styles.value}>
                    {children || <Typography variant="body">{value}</Typography>}
                </div>
                {value && (
                    <Button
                        icon={<Copy/>}
                        variant="ghost"
                        size="small"
                        onClick={handleCopy}
                        className={styles.copyButton}
                    />
                )}
            </div>
        </div>
    );
};

export const ContentDetails = () => {
    const {t} = useTranslation('jcontent');
    const {
        technicalInfo,
        details
    } = useContentEditorContext();

    return (
        <div className={styles.container}>
            {technicalInfo && technicalInfo.length > 0 && (
                <div className={styles.section}>
                    <Typography variant="subheading" className={styles.sectionTitle}>
                        {t('jcontent:label.contentEditor.sidePanel.technical')}
                    </Typography>

                    {technicalInfo.map((info, index) => (
                        <DetailRow
                            key={index}
                            label={info.label}
                            value={info.value}
                        />
                    ))}
                </div>
            )}

            {details && details.length > 0 && (
                <div className={styles.section}>
                    <Typography variant="subheading" className={styles.sectionTitle}>
                        {t('jcontent:label.contentEditor.sidePanel.additional')}
                    </Typography>

                    {details.map((detail, index) => (
                        <DetailRow
                            key={index}
                            label={detail.label}
                            value={detail.value}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
