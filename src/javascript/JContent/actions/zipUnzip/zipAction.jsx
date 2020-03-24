import React, {useContext} from 'react';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {triggerRefetchAll} from '../../JContent.refetches';
import zipUnzipQueries from './zipUnzip.gql-queries';
import zipUnzipMutations from './zipUnzip.gql-mutations';
import {getNewCounter, removeFileExtension} from '../../JContent.utils';
import {cmClearSelection} from '../../ContentRoute/ContentLayout/contentSelection.redux';
import {useDispatch} from 'react-redux';
import {useApolloClient} from '@apollo/react-hooks';
import {useNodeChecks} from '@jahia/data-helper';
import {ComponentRendererContext} from '@jahia/ui-extender';
import PropTypes from 'prop-types';

export const ZipActionComponent = ({context, render: Render, loading: Loading, notificationContext}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const client = useApolloClient();
    const dispatch = useDispatch();

    const res = useNodeChecks(
        {path: context.path, paths: context.paths},
        {
            ...context,
            getParent: true,
            requiredPermission: ['jcr:addChildNodes']
        }
    );

    if (res.loading && Loading) {
        return <Loading context={context}/>;
    }

    if (!res.node && !res.nodes) {
        return false;
    }

    let isVisible = res.checksResult;

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
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

                    componentRenderer.render('progressOverlay', ProgressOverlay);
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
            }
        }}/>
    );
};

ZipActionComponent.propTypes = {
    context: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func,
    notificationContext: PropTypes.object.isRequired
};

const zipAction = {
    component: withNotifications()(ZipActionComponent)
};

export default zipAction;
