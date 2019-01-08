import React from 'react';
import LeftDrawerContent from '../LeftNavigation/LeftDrawerContent';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {reduxAction} from './reduxAction';

export default composeActions(requirementsAction, reduxAction(state => ({statePath: state.path, mode: state.mode})), {
    init: context => {
        context.initRequirements();

        if (context.drawer && context.drawer.drawerOpen && context.drawer.openDrawerMenu === context.menu &&
                context.drawer.site !== undefined && context.drawer.site !== context.site) {
            // Drawer is open on the current menu and the site has changed: reopen the drawer to "refresh" the action list
            context.drawer.handleDrawerClose();
            context.drawer.handleDrawerOpen({
                content: <LeftDrawerContent context={context} actionPath={context.actionKey}/>,
                title: context.buttonLabel,
                site: context.site
            },
            context.menu);
        }

        if (context.mode === 'apps' && !context.drawer.drawerOpen && context.statePath) {
            if (context.statePath.split('/')[0] === context.actionKey) {
                context.drawer.handleDrawerOpen({
                    content: <LeftDrawerContent context={context} actionPath={context.actionKey}/>,
                    title: context.buttonLabel,
                    site: context.site
                }, context.menu);
            }
        }
    },

    onClick: context => {
        if (context.drawer.drawerOpen && context.drawer.openDrawerMenu === context.menu) {
            if (context.mode !== 'apps') {
                context.drawer.handleDrawerClose();
            }
        } else {
            context.drawer.handleDrawerOpen({content: <LeftDrawerContent context={context} actionPath={context.actionKey}/>, title: context.buttonLabel, site: context.site}, context.menu);
        }
    },

    onDestroy: context => {
        if (context.drawer.openDrawerMenu === context.menu) {
            context.drawer.handleDrawerClose();
        }
    }

});
