import React, {useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import {gql, useQuery} from '@apollo/client';
import {Typography, Button, Copy} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {useSidePanelContext} from '~/JContent/SidePanel';
import {getPreviewPath} from '~/ContentEditor/editorTabs/EditPanelContent/Preview/Preview.utils';
import styles from './ContentDetails.scss';

const GET_CONTENT_LINKS = gql`
    query getContentLinks($path: String!, $languages: [String]!) {
        live: jcr(workspace: LIVE) {
            nodeByPath(path: $path) {
                vanityUrls(languages: $languages) {
                    url
                    active
                    default
                    language
                    workspace
                }
            }
        }
        edit: jcr(workspace: EDIT) {
            nodeByPath(path: $path) {
                vanityUrls(languages: $languages) {
                    url
                    active
                    default
                    language
                    workspace
                }
            }
        }
    }
`;

const DetailRow = ({label, value, isCopyable = true, children}) => {
    const {t} = useTranslation('jcontent');
    const notificationContext = useNotifications();

    const handleCopy = useCallback(() => {
        if (value) {
            try {
                const copyPromise = navigator.clipboard?.writeText(value);
                copyPromise?.then(() => {
                    notificationContext.notify(t('jcontent:label.contentEditor.sidePanel.copiedToClipboard'), ['closeButton']);
                });
            } catch (error) {
                console.error('Unable to copy to clipboard', error);
            }
        }
    }, [value, notificationContext, t]);

    if (!value && !children) {
        return null;
    }

    return (
        <div className={styles.detailRow} data-sel-role="detail-row" data-sel-label={label}>
            <Typography variant="caption" className={styles.label}>
                {label}
            </Typography>
            <div className={styles.value}>
                {children || <Typography variant="body" component="span">{value}</Typography>}
                {value && isCopyable && (
                    <Button
                        icon={<Copy/>}
                        variant="ghost"
                        className={styles.copyButton}
                        onClick={handleCopy}
                    />
                )}
            </div>
        </div>
    );
};

DetailRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    isCopyable: PropTypes.bool,
    children: PropTypes.node
};

const LinkRow = ({label, displayValue, copyValue}) => {
    const {t} = useTranslation('jcontent');
    const notificationContext = useNotifications();

    const handleCopy = useCallback(() => {
        if (copyValue) {
            const copyPromise = navigator.clipboard?.writeText(copyValue);
            copyPromise?.then(() => {
                notificationContext.notify(t('jcontent:label.contentEditor.sidePanel.linksCopied'), ['closeButton']);
            });
        }
    }, [copyValue, notificationContext, t]);

    if (!displayValue || !copyValue) {
        return null;
    }

    return (
        <div className={styles.detailRow} data-sel-role="detail-row" data-sel-label={label}>
            <Typography variant="caption" className={styles.label}>
                {label}
            </Typography>
            <div className={styles.value}>
                <Typography variant="body" component="span" className={styles.linkValue}>
                    {displayValue}
                </Typography>
                <Button
                    icon={<Copy/>}
                    variant="ghost"
                    className={styles.copyButton}
                    onClick={handleCopy}
                />
            </div>
        </div>
    );
};

LinkRow.propTypes = {
    label: PropTypes.string.isRequired,
    displayValue: PropTypes.string,
    copyValue: PropTypes.string
};

// URL-encode each segment of a JCR path while keeping the slashes intact
const encodePathSegments = path => (path || '')
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

const ContentLinks = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData, siteInfo, hasPreview} = useSidePanelContext();

    const linksPath = nodeData ? getPreviewPath(nodeData) : null;
    const encodedLinksPath = encodePathSegments(linksPath);
    const isFullPage = Boolean(nodeData?.displayableNode && !nodeData.displayableNode.isFolder);
    const contextPath = window.contextJsParameters?.contextPath || '';
    const baseUrl = `${window.location.protocol}//${window.location.host}`;

    const languages = useMemo(
        () => siteInfo?.languages?.map(l => l.language) || [],
        [siteInfo]
    );

    const {data} = useQuery(GET_CONTENT_LINKS, {
        variables: {path: linksPath, languages},
        skip: !hasPreview || !linksPath || languages.length === 0
    });

    const linksByLanguage = useMemo(() => {
        const liveLabel = t('jcontent:label.contentEditor.sidePanel.linksLive');
        const stagingLabel = t('jcontent:label.contentEditor.sidePanel.linksDefault');
        const vanityLabel = t('jcontent:label.contentEditor.sidePanel.linksVanity');
        const defaultVanityLabel = t('jcontent:label.contentEditor.sidePanel.linksDefaultVanity');

        return (siteInfo?.languages || []).map(({language, displayName}) => {
            const links = [];
            const encodedLanguage = encodeURIComponent(language);

            if (isFullPage) {
                links.push({
                    label: liveLabel,
                    displayValue: `/cms/render/live/${language}${linksPath}.html`,
                    copyValue: `${baseUrl}${contextPath}/cms/render/live/${encodedLanguage}${encodedLinksPath}.html`
                });
            }

            links.push({
                label: stagingLabel,
                displayValue: `/cms/render/default/${language}${linksPath}.html`,
                copyValue: `${baseUrl}${contextPath}/cms/render/default/${encodedLanguage}${encodedLinksPath}.html`
            });

            ['live', 'edit'].forEach(workspace => {
                (data?.[workspace]?.nodeByPath?.vanityUrls || [])
                    .filter(v => v.active && v.language === language)
                    .forEach(v => {
                        const wsLabel = workspace === 'live' ? liveLabel : stagingLabel;
                        const suffix = v.default ? ` - ${defaultVanityLabel}` : '';
                        links.push({
                            label: `${vanityLabel} (${wsLabel}${suffix})`,
                            displayValue: v.url,
                            copyValue: `${baseUrl}${encodePathSegments(v.url)}`
                        });
                    });
            });

            return {language, displayName, links};
        });
    }, [baseUrl, contextPath, data, isFullPage, linksPath, encodedLinksPath, siteInfo, t]);

    if (!hasPreview) {
        return null;
    }

    const hasLinks = linksByLanguage.some(g => g.links.length > 0);
    const isMultiLanguage = languages.length > 1;

    if (!isFullPage && !hasLinks) {
        return null;
    }

    return (
        <div className={styles.section} data-sel-role="details-section" data-sel-content="links">
            <Typography variant="subheading" className={styles.sectionTitle}>
                {t('jcontent:label.contentEditor.sidePanel.links')}
            </Typography>

            {linksByLanguage.map(({language, displayName, links}) => (
                <div key={language}>
                    {isMultiLanguage && (
                        <Typography variant="caption" weight="bold" className={styles.languageLabel}>
                            {displayName.toUpperCase()}
                        </Typography>
                    )}
                    {links.map(link => (
                        <LinkRow
                            key={`${language}-${link.label}-${link.displayValue}`}
                            label={link.label}
                            displayValue={link.displayValue}
                            copyValue={link.copyValue}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export const ContentDetails = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData, technicalInfo, details} = useSidePanelContext();
    const isDevMode = window.contextJsParameters?.config?.operatingMode === 'development';

    if (!nodeData) {
        return (
            <div className={styles.empty}>
                <Typography variant="body">
                    {t('jcontent:label.contentEditor.sidePanel.noDetailsAvailable')}
                </Typography>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {details && details.length > 0 && (
                <div className={styles.section} data-sel-role="details-section" data-sel-content="additional">
                    <Typography variant="subheading" className={styles.sectionTitle}>
                        {t('jcontent:label.contentEditor.sidePanel.additional')}
                    </Typography>

                    <div className={styles.detailsGrid}>
                        {details.map(detail => (
                            <DetailRow
                                key={detail.label + detail.value}
                                label={detail.label}
                                value={detail.value}
                                isCopyable={detail.copyable}
                            />
                        ))}
                    </div>
                </div>
            )}

            <ContentLinks/>

            {isDevMode && technicalInfo && technicalInfo.length > 0 && (
                <div className={styles.section} data-sel-role="details-section" data-sel-content="technical">
                    <Typography variant="subheading" className={styles.sectionTitle}>
                        {t('jcontent:label.contentEditor.sidePanel.technical')}
                    </Typography>

                    {technicalInfo.map(info => (
                        <DetailRow
                            key={info.label + info.value}
                            label={info.label}
                            value={info.value}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
