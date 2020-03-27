import React, {useContext} from 'react';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {triggerRefetchAll} from '../../JContent.refetches';
import {useApolloClient} from '@apollo/react-hooks';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {isMarkedForDeletion} from '../../JContent.utils';
import zipUnzipMutations from './zipUnzip.gql-mutations';

export const UnzipActionComponent = ({context, render: Render, loading: Loading, notificationContext}) => {
    const language = useSelector(state => state.language);
    const componentRenderer = useContext(ComponentRendererContext);
    const client = useApolloClient();

    const res = useNodeChecks(
        {path: context.path, paths: context.paths, language},
        {
            ...context,
            getParent: true,
            getMimeType: true,
            getProperties: ['jcr:mixinTypes'],
            requiredPermission: ['jcr:addChildNodes']
        }
    );

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    let isVisible = res.checksResult && (res.node.mimeType === 'application/zip' || res.node.mimeType === 'application/x-zip-compressed') && !isMarkedForDeletion(res.node);

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                componentRenderer.render('progressOverlay', ProgressOverlay);
                client.mutate({
                    variables: {pathOrId: res.node.path, path: res.node.parent.path},
                    mutation: zipUnzipMutations.unzip
                }).then(() => {
                    triggerRefetchAll();
                    componentRenderer.destroy('progressOverlay');
                }).catch((reason => {
                    componentRenderer.destroy('progressOverlay');
                    notificationContext.notify(reason.toString(), ['closeButton', 'noAutomaticClose']);
                }));
            }
        }}/>
    );
};

UnzipActionComponent.propTypes = {
    context: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func,
    notificationContext: PropTypes.object.isRequired
};

const unzipAction = {
    component: withNotifications()(UnzipActionComponent)
};

export default unzipAction;
