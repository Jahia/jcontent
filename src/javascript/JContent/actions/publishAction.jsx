import React, {useEffect} from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {ellipsizeText, getLanguageLabel, isMarkedForDeletion, uppercaseFirst} from '../JContent.utils';
import * as _ from 'lodash';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {setRefetcher, unsetRefetcher} from '../JContent.refetches';

function checkAction(res, node, publishType, allLanguages) {
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

    if (allLanguages) {
        isVisible = isVisible && node.site.languages.length > 1;
    }

    if (enabled && !node.publish && !node['publication-start']) {
        enabled = false;
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

export const PublishActionComponent = ({id, path, paths, language, publishType, allLanguages, render: Render, loading: Loading, ...others}) => {
    const {languageToUse} = useSelector(state => ({language: language ? language : state.language}));
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
        return (Loading && <Loading {...others}/>) || false;
    }

    let {enabled, isVisible} = res.node ? checkAction(res, res.node, publishType, allLanguages) : res.nodes.reduce((acc, node) => mergeChecks(acc, checkAction(res, node, publishType, allLanguages)), {
        enabled: true,
        isVisible: true
    });

    const buttonLabelParams = res.node ? {
        displayName: _.escape(ellipsizeText(res.node.displayName, 40)),
        language: res.node.site ? _.escape(uppercaseFirst(getLanguageLabel(res.node.site.languages, languageToUse).displayName)) : null
    } : {
        displayName: t('jcontent:label.contentManager.selection.items', {count: paths.length}),
        language: res.nodes[0].site ? _.escape(uppercaseFirst(getLanguageLabel(res.nodes[0].site.languages, languageToUse).displayName)) : null
    };

    return (
        <Render
            {...others}
            buttonLabelParams={buttonLabelParams}
            isVisible={isVisible}
            enabled={enabled}
            onClick={() => {
                if (path) {
                    window.authoringApi.openPublicationWorkflow([res.node.uuid], publishType === 'publishAll', allLanguages, publishType === 'unpublish');
                } else if (paths) {
                    window.authoringApi.openPublicationWorkflow(res.nodes.map(n => n.uuid), publishType === 'publishAll', allLanguages, publishType === 'unpublish');
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

    publishType: PropTypes.oneOf(['publish', 'publishAll', 'unpublish']),

    allLanguages: PropTypes.bool,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
