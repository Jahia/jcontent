import React from 'react';
import {composeActions, componentRendererAction} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {withDxContextAction} from '../withDxContextAction';
import Export from './Export';

export default composeActions(requirementsAction, withDxContextAction, componentRendererAction, {

    init: context => {
        context.initRequirements({});
    },

    onClick: context => {
        let handler = context.renderComponent(
            <Export
                open
                contextPath={context.dxContext.contextPath}
                path={context.node.path}
                onClose={() => {
                    handler.setProps({open: false});
                }}
                onExited={() => {
                    handler.destroy();
                }}
            />
        );
    }
});
