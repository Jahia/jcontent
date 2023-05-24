import React, {useContext} from 'react';
import {withNotifications} from '@jahia/react-material';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {useApolloClient} from '@apollo/client';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {isMarkedForDeletion} from '~/JContent/JContent.utils';
import zipUnzipMutations from './zipUnzip.gql-mutations';
import {ACTION_PERMISSIONS, PATH_FILES_ITSELF} from '../actions.constants';
import {TransparentLoaderOverlay} from '~/JContent/TransparentLoaderOverlay';

export const UnzipActionComponent = withNotifications()(({path, paths, render: Render, loading: Loading, notificationContext, ...others}) => {
    const language = useSelector(state => state.language);
    const componentRenderer = useContext(ComponentRendererContext);
    const client = useApolloClient();

    const res = useNodeChecks(
        {path, paths, language},
        {
            getParent: true,
            getMimeType: true,
            getProperties: ['jcr:mixinTypes'],
            requiredPermission: ['jcr:addChildNodes'],
            requiredSitePermission: [ACTION_PERMISSIONS.unzipAction],
            showOnNodeTypes: ['jnt:file'],
            hideForPaths: [PATH_FILES_ITSELF]
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    let isVisible = res.checksResult && (res.node.mimeType === 'application/zip' || res.node.mimeType === 'application/x-zip-compressed') && !isMarkedForDeletion(res.node);

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                componentRenderer.render('progressOverlay', TransparentLoaderOverlay);
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
            }}
        />
    );
});

UnzipActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
