import React from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../JContent.utils';
import {useSelector} from 'react-redux';

const checkAction = node => node.operationsSupport.publication &&
    isMarkedForDeletion(node) &&
    node.aggregatedPublicationInfo.publicationStatus !== 'NOT_PUBLISHED';

export const PublishDeletionActionComponent = ({context, render: Render, loading: Loading}) => {
    const {language} = useSelector(state => ({language: state.language}));

    const res = useNodeChecks({path: context.path, paths: context.paths, language}, {
        getProperties: ['jcr:mixinTypes'],
        getAggregatedPublicationInfo: true,
        getOperationSupport: true,
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
                    window.authoringApi.openPublicationWorkflow([res.node.uuid], context.allSubTree, context.allLanguages, context.checkForUnpublication);
                } else if (context.paths) {
                    window.authoringApi.openPublicationWorkflow(res.nodes.map(n => n.uuid), context.allSubTree, context.allLanguages, context.checkForUnpublication);
                }
            }
        }}/>
    );
};

PublishDeletionActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};

const publishDeletionAction = {
    component: PublishDeletionActionComponent
};

export default publishDeletionAction;
