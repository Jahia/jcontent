import React from 'react';
import DxContext from '../../DxContext/index';
import {composeActions, componentRendererAction} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import Export from './Export';

export default composeActions(requirementsAction, componentRendererAction, {

    init: context => {
        context.initRequirements({});
    },

    onClick: context => {
        let handler = context.renderComponent(
            <DxContext.Consumer>{dxContext => (
                <Export
                    open
                    contextPath={dxContext.contextPath}
                    path={context.node.path}
                    onClose={() => {
                        handler.setProps({open: false});
                    }}
                    onExited={() => {
                        handler.destroy();
                    }}
                />
            )}
            </DxContext.Consumer>
        );
    }
});
