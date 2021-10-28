import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../JContent.utils';
import {useSelector} from 'react-redux';
import {PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from './actions.constants';

const checkActionOnNodes = res => {
    return res.nodes ? res.nodes.reduce((acc, node) => acc && checkAction(node), true) : true;
};

const checkAction = node => node.operationsSupport.markForDeletion &&
    isMarkedForDeletion(node) &&
    node.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED' &&
    (node.aggregatedPublicationInfo.existsInLive === undefined ? true : !node.aggregatedPublicationInfo.existsInLive);

export const DeletePermanentlyActionComponent = ({path, paths, buttonProps, render: Render, loading: Loading, ...others}) => {
    const {language} = useSelector(state => ({language: state.language}));

    const res = useNodeChecks(
        {path, paths, language},
        {
            getDisplayName: true,
            getProperties: ['jcr:mixinTypes'],
            getAggregatedPublicationInfo: true,
            getOperationSupport: true,
            requiredPermission: ['jcr:removeNode'],
            hideOnNodeTypes: ['jnt:virtualsite'],
            hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
        }
    );

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
                    window.authoringApi.deleteContent(res.node.uuid, res.node.path, res.node.displayName, ['jnt:content'], ['nt:base'], false, true);
                } else if (paths) {
                    window.authoringApi.deleteContents(res.nodes.map(node => ({
                        uuid: node.uuid,
                        path: node.path,
                        displayName: node.displayName,
                        nodeTypes: ['jnt:content'],
                        inheritedNodeTypes: ['nt:base']
                    })), false, true);
                }
            }}
        />
    );
};

DeletePermanentlyActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    buttonProps: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
