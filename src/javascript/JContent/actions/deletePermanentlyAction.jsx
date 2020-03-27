import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../JContent.utils';
import {useSelector} from 'react-redux';

const checkAction = node => node.operationsSupport.markForDeletion &&
    isMarkedForDeletion(node) &&
    node.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED';

export const DeletePermanentlyActionComponent = ({context, render: Render, loading: Loading}) => {
    const {language} = useSelector(state => ({language: state.language}));

    const res = useNodeChecks({path: context.path, paths: context.paths, language}, {
        getDisplayName: true,
        getProperties: ['jcr:mixinTypes'],
        getAggregatedPublicationInfo: true,
        getOperationSupport: true,
        requiredPermission: ['jcr:removeNode'],
        ...context
    });

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    let isVisible = res.node ? checkAction(res.node) : res.nodes.reduce((acc, node) => acc && checkAction(node), true);

    return (
        <Render context={{
            ...context,
            isVisible,
            displayActionProps: {
                ...context.displayActionProps,
                color: 'danger'
            },
            onClick: () => {
                if (context.path) {
                    window.authoringApi.deleteContent(res.node.uuid, res.node.path, res.node.displayName, ['jnt:content'], ['nt:base'], false, true);
                } else if (context.paths) {
                    window.authoringApi.deleteContents(res.nodes.map(node => ({uuid: node.uuid, path: node.path, displayName: node.displayName, nodeTypes: ['jnt:content'], inheritedNodeTypes: ['nt:base']})), false, true);
                }
            }
        }}/>
    );
};

DeletePermanentlyActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
