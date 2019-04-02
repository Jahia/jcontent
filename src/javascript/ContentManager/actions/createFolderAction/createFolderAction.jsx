import React from 'react';
import {composeActions, componentRendererAction} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import CreateFolderContainer from './CreateFolder/CreateFolder.container';

export default composeActions(requirementsAction, componentRendererAction, {
    init: context => {
        context.initRequirements({requiredPermission: 'jcr:addChildNodes'});
    },
    onClick: context => {
        const variables = {
            path: context.node.path,
            typesFilter: {
                types: [context.contentType]
            }
        };
        const onExit = () => {
            handler.destroy();
        };
        let handler = context.renderComponent(
            <CreateFolderContainer variables={variables}
                                   node={context.node}
                                   contentType={context.contentType}
                                   onExit={onExit}/>
        );
    }
});
