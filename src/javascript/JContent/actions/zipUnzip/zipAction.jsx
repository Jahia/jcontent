import React, {useContext} from 'react';
import {withNotifications} from '@jahia/react-material';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import zipUnzipQueries from './zipUnzip.gql-queries';
import zipUnzipMutations from './zipUnzip.gql-mutations';
import {getNewCounter, removeFileExtension} from '~/JContent/JContent.utils';
import {cmClearSelection} from '../../ContentRoute/ContentLayout/contentSelection.redux';
import {useDispatch} from 'react-redux';
import {useApolloClient} from '@apollo/react-hooks';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS, PATH_FILES_ITSELF} from '../actions.constants';
import {TransparentLoaderOverlay} from '~/JContent/TransparentLoaderOverlay';

export const ZipActionComponent = withNotifications()(({path, paths, render: Render, loading: Loading, notificationContext, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const client = useApolloClient();
    const dispatch = useDispatch();

    const res = useNodeChecks(
        {path, paths},
        {
            getParent: true,
            requiredPermission: ['jcr:addChildNodes'],
            requiredSitePermission: [ACTION_PERMISSIONS.zipAction],
            showOnNodeTypes: ['jnt:file', 'jnt:folder'],
            hideForPaths: [PATH_FILES_ITSELF]
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    let isVisible = res.checksResult;

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isVisible}
            onClick={() => {
                let name = res.node ? res.node.name : (res.nodes.length > 1 ? res.nodes[0].parent.name : res.nodes[0].name);
                let nameWithoutExtension = removeFileExtension(name);
                let paths = res.node ? [res.node.path] : res.nodes.map(n => n.path);
                let uuid = res.node ? res.node.uuid : res.nodes[0].uuid;
                let parentPath = res.node ? res.node.parent.path : res.nodes[0].parent.path;

                // Query to have zip files in the same directory with the same name to add a counter
                let siblings = client.query({
                    query: zipUnzipQueries.siblingsWithSameNameQuery,
                    variables: {uuid: uuid, name: nameWithoutExtension, extension: '.zip'},
                    fetchPolicy: 'network-only'
                });

                let newName = '';
                siblings.then(function (siblingsRes) {
                    if (siblingsRes.data && siblingsRes.data.jcr && siblingsRes.data.jcr.nodeById.parent.filteredSubNodes.nodes.length > 0) {
                        let siblings = siblingsRes.data.jcr.nodeById.parent.filteredSubNodes.nodes;
                        newName = nameWithoutExtension.concat(getNewCounter(siblings) + '.zip');
                    } else {
                        newName = removeFileExtension(name).concat('.zip');
                    }

                    componentRenderer.render('progressOverlay', TransparentLoaderOverlay);
                    // Zip mutation after calculating the new name of zip file
                    client.mutate({
                        variables: {parentPathOrId: parentPath, name: newName, paths: paths},
                        mutation: zipUnzipMutations.zip,
                        refetchQueries: [{
                            query: zipUnzipQueries.siblingsWithSameNameQuery,
                            variables: {uuid: uuid, name: nameWithoutExtension, extension: '.zip'}
                        }]
                    }).then(() => {
                        dispatch(cmClearSelection());
                        triggerRefetchAll();
                        componentRenderer.destroy('progressOverlay');
                    }).catch((reason => {
                        componentRenderer.destroy('progressOverlay');
                        notificationContext.notify(reason.toString(), ['closeButton', 'noAutomaticClose']);
                    }));
                });
            }}
        />
    );
});

ZipActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
