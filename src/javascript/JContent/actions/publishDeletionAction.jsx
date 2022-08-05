import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../JContent.utils';
import {useSelector} from 'react-redux';

const checkActionOnNodes = res => {
    return res.nodes ? res.nodes.reduce((acc, node) => acc && checkAction(node), true) : true;
};

const checkAction = node => node.operationsSupport.publication &&
    isMarkedForDeletion(node) &&
    (node.aggregatedPublicationInfo.publicationStatus !== 'NOT_PUBLISHED' ||
        (node.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED' &&
            (node.aggregatedPublicationInfo.existsInLive === undefined ? false : node.aggregatedPublicationInfo.existsInLive)));

export const PublishDeletionActionComponent = ({path, paths, isAllSubTree, isPublishingAllLanguages, buttonProps, render: Render, loading: Loading, ...others}) => {
    const language = useSelector(state => state.language);

    const res = useNodeChecks({path, paths, language}, {
        getProperties: ['jcr:mixinTypes'],
        getAggregatedPublicationInfo: true,
        getOperationSupport: true,
        requiredPermission: ['publish'],
        hideOnNodeTypes: ['jnt:virtualsite']
    });

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    let isVisible = res.node ? checkAction(res.node) : checkActionOnNodes(res);

    return (
        <Render
            {...others}
            isVisible={isVisible}
            buttonProps={{...buttonProps, color: 'danger'}}
            onClick={() => {
                if (path) {
                    window.authoringApi.openPublicationWorkflow([res.node.uuid], isAllSubTree, isPublishingAllLanguages);
                } else if (paths) {
                    window.authoringApi.openPublicationWorkflow(res.nodes.map(n => n.uuid), isAllSubTree, isPublishingAllLanguages);
                }
            }}
        />
    );
};

PublishDeletionActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    buttonProps: PropTypes.object,

    isAllSubTree: PropTypes.bool,

    isPublishingAllLanguages: PropTypes.bool,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
