import React, {useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import {gql, useQuery} from '@apollo/client';
import {Typography, Button, Copy} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from './ContentDetails.scss';

const GET_CONTENT_LINKS = gql`
    query getContentLinks($path: String!, $language: String!) {
        live: jcr(workspace: LIVE) {
            nodeByPath(path: $path) {
                vanityUrls(languages: [$language]) {
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
                vanityUrls(languages: [$language]) {
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

const DetailRow = ({label, value, children}) => {
    const {t} = useTranslation('jcontent');
    const notificationContext = useNotifications();

    const handleCopy = useCallback(() => {
        if (value) {
            const copyPromise = navigator.clipboard?.writeText(value);
            copyPromise?.then(() => {
                notificationContext.notify(t('jcontent:label.contentEditor.sidePanel.copiedToClipboard'), ['closeButton']);
            });
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
                {value && (
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

const ContentLinks = () => {
    const {t} = useTranslation('jcontent');
    const {nodeData, lang} = useContentEditorContext();
    const linksPath = nodeData.displayableNode?.path || nodeData.path;
    const isFullPage = Boolean(nodeData.displayableNode && !nodeData.displayableNode.isFolder);
    const contextPath = window.contextJsParameters?.contextPath || '';
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const {data} = useQuery(GET_CONTENT_LINKS, {
        variables: {
            path: linksPath,
            language: lang
        },
        skip: !linksPath || !lang
    });

    const directLinks = useMemo(() => {
        const buildDirectLink = workspace => {
            const relativePath = `/cms/render/${workspace}/${lang}${linksPath}.html`;

            return {
                label: t(`jcontent:label.contentEditor.sidePanel.${workspace === 'live' ? 'linksLive' : 'linksDefault'}`),
                displayValue: relativePath,
                copyValue: `${baseUrl}${contextPath}${relativePath}`
            };
        };

        const links = [buildDirectLink('default')];

        if (isFullPage) {
            links.unshift(buildDirectLink('live'));
        }

        return links;
    }, [baseUrl, contextPath, isFullPage, lang, linksPath, t]);

    const vanityLinks = useMemo(() => {
        const workspaceLabels = {
            live: t('jcontent:label.contentEditor.sidePanel.linksLive'),
            edit: t('jcontent:label.contentEditor.sidePanel.linksDefault')
        };

        return ['live', 'edit'].flatMap(workspace => (
            (data?.[workspace]?.nodeByPath?.vanityUrls || [])
                .filter(vanity => vanity.active)
                .map(vanity => ({
                    label: `${t('jcontent:label.contentEditor.sidePanel.linksVanity')} (${workspaceLabels[workspace]}${vanity.default ? ` - ${t('jcontent:label.contentEditor.sidePanel.linksDefaultVanity')}` : ''})`,
                    displayValue: vanity.url,
                    copyValue: `${baseUrl}${vanity.url}`
                }))
        ));
    }, [baseUrl, data, t]);

    if (!isFullPage && vanityLinks.length === 0) {
        return null;
    }

    return (
        <div className={styles.section} data-sel-role="details-section" data-sel-content="links">
            <Typography variant="subheading" className={styles.sectionTitle}>
                {t('jcontent:label.contentEditor.sidePanel.links')}
            </Typography>

            {[...directLinks, ...vanityLinks].map(link => (
                <LinkRow
                    key={`${link.label}-${link.displayValue}`}
                    label={link.label}
                    displayValue={link.displayValue}
                    copyValue={link.copyValue}
                />
            ))}
        </div>
    );
};

export const ContentDetails = () => {
    const {t} = useTranslation('jcontent');
    const {
        technicalInfo,
        details
    } = useContentEditorContext();
    const isDevMode = window.contextJsParameters?.config?.operatingMode === 'development';

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
