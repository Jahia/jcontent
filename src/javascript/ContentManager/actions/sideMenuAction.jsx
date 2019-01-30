import React from 'react';
import {LeftDrawerContent} from '@jahia/layouts';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, reduxAction(state => ({statePath: state.path, mode: state.mode})), {
    init: context => {
        context.initRequirements();
    },

    onClick: context => {
        if (context.drawer.drawerOpen && context.drawer.openDrawerMenu === context.menu) {
            context.drawer.handleDrawerClose();
        } else {
            context.drawer.handleDrawerOpen({content: <LeftDrawerContent context={context} actionPath={context.actionKey}/>, title: context.buttonLabel}, context.menu);
        }
    },

    onDestroy: context => {
        if (context.drawer.openDrawerMenu === context.menu) {
            context.drawer.handleDrawerClose();
        }
    }

});
