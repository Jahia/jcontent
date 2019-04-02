import React from 'react';
import {composeActions, componentRendererAction} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import CreateFolderDialog from './CreateFolderDialog';

export default composeActions(requirementsAction, componentRendererAction, {
    init: context => {
        context.initRequirements({requiredPermission: 'jcr:addChildNodes'});
    },
    onClick: context => {
        const onExit = () => {
            handler.destroy();
        };
        let handler = context.renderComponent(
            <CreateFolderDialog node={context.node}
                                contentType={context.contentType}
                                onExit={onExit}/>
        );
    }
});
