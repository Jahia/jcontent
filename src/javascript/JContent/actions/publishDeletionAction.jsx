import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../JContent.utils';
import {useSelector} from 'react-redux';

const checkAction = node => node.operationsSupport.publication &&
    isMarkedForDeletion(node) &&
    (node.aggregatedPublicationInfo.publicationStatus !== 'NOT_PUBLISHED' ||
        (node.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED' &&
            (node.aggregatedPublicationInfo.existsInLive === undefined ? false : node.aggregatedPublicationInfo.existsInLive)));

export const PublishDeletionActionComponent = ({path, paths, allSubTree, allLanguages, render: Render, loading: Loading, ...others}) => {
    const {language} = useSelector(state => ({language: state.language}));

    const res = useNodeChecks({path, paths, language}, {
        getProperties: ['jcr:mixinTypes'],
        getAggregatedPublicationInfo: true,
        getOperationSupport: true,
        requiredPermission: ['publish'],
        hideOnNodeTypes: ['jnt:virtualsite', 'jnt:page']
    });

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    let isVisible = res.node ? checkAction(res.node) : res.nodes.reduce((acc, node) => acc && checkAction(node), true);

    return (
        <Render
            {...others}
            isVisible={isVisible}
            color="danger"
            onClick={() => {
                if (path) {
                    window.authoringApi.openPublicationWorkflow([res.node.uuid], allSubTree, allLanguages);
                } else if (paths) {
                    window.authoringApi.openPublicationWorkflow(res.nodes.map(n => n.uuid), allSubTree, allLanguages);
                }
            }}
        />
    );
};

PublishDeletionActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    allSubTree: PropTypes.bool,

    allLanguages: PropTypes.bool,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
