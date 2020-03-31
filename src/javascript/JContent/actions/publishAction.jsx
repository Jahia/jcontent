import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {ellipsizeText, getLanguageLabel, isMarkedForDeletion, uppercaseFirst} from '../JContent.utils';
import * as _ from 'lodash';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

function checkAction(res, node, context) {
    let enabled = true;
    let isVisible = res.checksResult && node.operationsSupport.publication;

    if (context.publishType === 'unpublish') {
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
            (context.publishType === 'publishAll' || node.aggregatedPublicationInfo.publicationStatus !== 'PUBLISHED');
    }

    if (context.allLanguages) {
        isVisible = isVisible && node.site.languages.length > 1;
    }

    return {enabled, isVisible};
}

const mergeChecks = (v1, v2) => {
    const res = {};
    Object.keys(v1).forEach(key => {
        res[key] = v1[key] && v2[key];
    });
    return res;
};

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

export const PublishActionComponent = ({context, render: Render, loading: Loading}) => {
    const {language} = useSelector(state => ({language: state.language}));
    const {t} = useTranslation();

    const res = useNodeChecks({path: context.path, paths: context.paths, language}, {
        getDisplayName: true,
        getProperties: ['jcr:mixinTypes'],
        getSiteLanguages: true,
        getAggregatedPublicationInfo: true,
        getOperationSupport: true,
        requiredPermission: ['publish', 'publication-start'],
        ...constraintsByType[context.publishType]
    });

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    let {enabled, isVisible} = res.node ? checkAction(res, res.node, context) : res.nodes.reduce((acc, node) => mergeChecks(acc, checkAction(res, node, context)), {
        enabled: true,
        isVisible: true
    });

    const buttonLabelParams = res.node ? {
        displayName: _.escape(ellipsizeText(res.node.displayName, 40)),
        language: res.node.site ? _.escape(uppercaseFirst(getLanguageLabel(res.node.site.languages, language).displayName)) : null
    } : {
        displayName: t('jcontent:label.contentManager.selection.items', {count: context.paths.length}),
        language: res.nodes[0].site ? _.escape(uppercaseFirst(getLanguageLabel(res.nodes[0].site.languages, language).displayName)) : null
    };

    return (
        <Render context={{
            ...context,
            buttonLabelParams,
            isVisible,
            enabled,
            onClick: () => {
                if (context.path) {
                    window.authoringApi.openPublicationWorkflow([res.node.uuid], context.publishType === 'publishAll', context.allLanguages, context.publishType === 'unpublish');
                } else if (context.paths) {
                    window.authoringApi.openPublicationWorkflow(res.nodes.map(n => n.uuid), context.publishType === 'publishAll', context.allLanguages, context.publishType === 'unpublish');
                }
            }
        }}/>
    );
};

PublishActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
