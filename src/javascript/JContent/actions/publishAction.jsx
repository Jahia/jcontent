import React, {useEffect} from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {ellipsizeText, getLanguageLabel, isMarkedForDeletion, uppercaseFirst} from '../JContent.utils';
import * as _ from 'lodash';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {setRefetcher, unsetRefetcher} from '../JContent.refetches';

function checkAction(res, node, publishType, isPublishingAllLanguages) {
    let enabled = true;
    let isVisible = res.checksResult && node.operationsSupport.publication;

    if (publishType === 'unpublish') {
        isVisible = isVisible &&
            !isMarkedForDeletion(node);
        enabled = enabled &&
            node.aggregatedPublicationInfo.publicationStatus !== 'NOT_PUBLISHED' &&
            node.aggregatedPublicationInfo.publicationStatus !== 'MANDATORY_LANGUAGE_UNPUBLISHABLE' &&
            node.aggregatedPublicationInfo.publicationStatus !== 'UNPUBLISHED';
    } else {
        isVisible = isVisible &&
            !isMarkedForDeletion(node);
        enabled = enabled &&
            (publishType === 'publishAll' || node.aggregatedPublicationInfo.publicationStatus !== 'PUBLISHED');
    }

    if (enabled && !node.publish && !node['publication-start']) {
        enabled = false;
    }

    if (isPublishingAllLanguages) {
        // Always enable all languages operations.
        enabled = true;
        isVisible = isVisible && node.site.languages.length > 1;
    }

    return {enabled, isVisible};
}

function checkActionOnNodes(res, publishType, isPublishingAllLanguages) {
    const defaults = {
        enabled: true,
        isVisible: true
    };

    return res.nodes ? res.nodes.reduce((acc, node) => mergeChecks(acc, checkAction(res, node, publishType, isPublishingAllLanguages)), defaults) : defaults;
}

const mergeChecks = (v1, v2) => {
    const res = {};
    Object.keys(v1).forEach(key => {
        res[key] = v1[key] && v2[key];
    });
    return res;
};

function getButtonLabelParams(paths, language, res, t) {
    if (!res.nodes) {
        return {
            displayName: t('jcontent:label.contentManager.selection.items', {count: 0}),
            language
        };
    }

    return {
        displayName: t('jcontent:label.contentManager.selection.items', {count: paths.length}),
        language: res.nodes[0]?.site ? _.escape(uppercaseFirst(getLanguageLabel(res.nodes[0].site.languages, language).displayName)) : null
    };
}

const constraintsByType = {
    publish: {
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:contentFolder', 'nt:folder']
    },
    publishAll: {
        showOnNodeTypes: ['jnt:folder', 'jnt:contentFolder', 'jnt:page']
    },
    unpublish: {
        hideOnNodeTypes: ['jnt:virtualsite']
    }
};

export const PublishActionComponent = props => {
    const {id, path, paths, language, publishType, isPublishingAllLanguages, enabled, isVisible,
        isMediumLabel, render: Render, loading: Loading} = props;
    const languageToUse = useSelector(state => language ? language : state.language);
    const {t} = useTranslation();

    const res = useNodeChecks({path, paths, language: languageToUse}, {
        getDisplayName: true,
        getProperties: ['jcr:mixinTypes'],
        getSiteLanguages: true,
        getAggregatedPublicationInfo: {subNodes: true},
        getOperationSupport: true,
        getPermissions: ['publish', 'publication-start'],
        ...constraintsByType[publishType]
    });

    useEffect(() => {
        setRefetcher(id, {
            refetch: res.refetch
        });

        return () => unsetRefetcher(id);
    }, [res.refetch, id]);

    if (res.loading) {
        return (Loading && <Loading {...props}/>) || false;
    }

    let actionChecks = res.node ? checkAction(res, res.node, publishType, isPublishingAllLanguages) : checkActionOnNodes(res, publishType, isPublishingAllLanguages);
    const actionEnabled = enabled === undefined ? actionChecks.enabled : (enabled && actionChecks.enabled);
    const actionVisible = isVisible === undefined ? actionChecks.isVisible : (isVisible && actionChecks.isVisible);

    const buttonLabelParams = res.node ? {
        displayName: _.escape(ellipsizeText(res.node.displayName, 40)),
        language: res.node.site ? _.escape(uppercaseFirst(getLanguageLabel(res.node.site.languages, languageToUse).displayName)) : null
    } : getButtonLabelParams(paths, languageToUse, res, t);

    let {buttonLabel, buttonLabelShort} = props;
    if (isMediumLabel) {
        buttonLabel += 'Medium';
        buttonLabelParams.language = _.escape(languageToUse).toUpperCase();
        const siteLanguages = res?.nodes ? res.nodes[0].site?.languages : res?.node?.site?.languages;
        if ((siteLanguages || []).length > 1) {
            // Display language in publish button by disabling short label
            buttonLabelShort = '';
        }
    }

    return (
        <Render
            {...props}
            buttonLabel={buttonLabel}
            buttonLabelShort={buttonLabelShort}
            buttonLabelParams={buttonLabelParams}
            isVisible={actionVisible}
            enabled={actionEnabled}
            onClick={() => {
                if (path) {
                    window.authoringApi.openPublicationWorkflow([res.node.uuid], publishType === 'publishAll', isPublishingAllLanguages, publishType === 'unpublish');
                } else if (paths) {
                    window.authoringApi.openPublicationWorkflow(res.nodes.map(n => n.uuid), publishType === 'publishAll', isPublishingAllLanguages, publishType === 'unpublish');
                }
            }}
        />
    );
};

PublishActionComponent.propTypes = {
    id: PropTypes.string,
    path: PropTypes.string,
    paths: PropTypes.arrayOf(PropTypes.string),
    language: PropTypes.string,
    enabled: PropTypes.bool,
    isVisible: PropTypes.bool,
    publishType: PropTypes.oneOf(['publish', 'publishAll', 'unpublish']),
    isPublishingAllLanguages: PropTypes.bool,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func,
    buttonLabelShort: PropTypes.string,
    buttonLabel: PropTypes.string.isRequired,
    isMediumLabel: PropTypes.bool
};
