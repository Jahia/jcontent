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

    if (context.checkForUnpublication) {
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
            (context.allSubTree || node.aggregatedPublicationInfo.publicationStatus !== 'PUBLISHED');
    }

    if (context.checkIfLanguagesMoreThanOne) {
        enabled = enabled && node.site.languages.length > 1;
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

export const PublishActionComponent = ({context, render: Render, loading: Loading}) => {
    const {language} = useSelector(state => ({language: state.language}));
    const {t} = useTranslation();

    const res = useNodeChecks({path: context.path, paths: context.paths, language}, {
        getDisplayName: true,
        getProperties: ['jcr:mixinTypes'],
        getSiteLanguages: true,
        getAggregatedPublicationInfo: true,
        getOperationSupport: true,
        ...context
    });

    if (res.loading && Loading) {
        return <Loading context={context}/>;
    }

    if (!res.node && !res.nodes) {
        return false;
    }

    let {enabled, isVisible} = res.node ? checkAction(res, res.node, context) : res.nodes.reduce((acc, node) => mergeChecks(acc, checkAction(res, node, context)), {
        enabled: true,
        isVisible: true
    });

    const buttonLabelParams = res.node ? {
        displayName: _.escape(ellipsizeText(res.node.displayName, 40)),
        language: res.node.site ? _.escape(uppercaseFirst(getLanguageLabel(res.node.site.languages, language).displayName)) : null
    } : {
        displayName: t('jcontent:label.contentManager.selection.itemsSelected', {count: context.paths.length}),
        language: res.nodes[0].site ? _.escape(uppercaseFirst(getLanguageLabel(res.nodes[0].site.languages, language).displayName)) : null,
        menuDisplayName: t('jcontent:label.contentManager.selection.items', {count: context.paths.length})
    };

    return (
        <Render context={{
            ...context,
            buttonLabelParams,
            isVisible,
            enabled,
            onClick: () => {
                if (context.path) {
                    window.authoringApi.openPublicationWorkflow([res.node.uuid], context.allSubTree, context.allLanguages, context.checkForUnpublication);
                } else if (context.paths) {
                    window.authoringApi.openPublicationWorkflow(res.nodes.map(n => n.uuid), context.allSubTree, context.allLanguages, context.checkForUnpublication);
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

const publishAction = {
    component: PublishActionComponent
};

export default publishAction;
