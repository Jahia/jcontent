import React from 'react';
import {composeActions, componentRendererAction} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import Export from '../ContentLayout/Export';

export default composeActions(requirementsAction, componentRendererAction, {

    init: context => {
        context.initRequirements({});
    },

    onClick: context => {
        let handler = context.renderComponent(
            <Export open
                    onClose={() => {
                        handler.setProps({open: false});
                    }}
                    onExited={() => {
                        handler.destroy();
                        if (context.onExited) {
                            context.onExited();
                        }
                    }}
            />);
    }
});
