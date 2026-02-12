import React from 'react';
import {AddCircle, Save} from '@jahia/moonstone';

import {createContentActionWrapper} from './jcontent/createContent/createContentWrapper';
import {createContentActionWrapperPB} from './jcontent/createContent/createContentWrapperPB';
import {createAction} from './contenteditor/create/createAction';
import {batchActions} from 'redux-batched-actions';
import {booleanValue} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';
import {cmGoto} from '~/JContent/redux/JContent.redux';

export const registerCreateActions = registry => {
    registry.addOrReplace('action', 'createContent', createContentActionWrapper, {
        defaultIcon: <AddCircle/>,
        buttonLabel:
            'jcontent:label.contentEditor.CMMActions.createNewContent.menu',
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:content', 'jnt:category'],
        hideOnNodeTypes: ['jnt:navMenuText', 'jnt:page'],
        requiredPermission: ['jcr:addChildNodes'],
        hasBypassChildrenLimit: false
    });

    registry.addOrReplace('action', 'createContentPB', createContentActionWrapperPB, {
        defaultIcon: <AddCircle/>,
        buttonLabel:
            'jcontent:label.contentEditor.CMMActions.createNewContent.menu',
        showOnNodeTypes: ['jnt:contentFolder', 'jnt:content', 'jnt:category'],
        hideOnNodeTypes: ['jnt:navMenuText', 'jnt:page'],
        requiredPermission: ['jcr:addChildNodes'],
        hasBypassChildrenLimit: false
    });

    if (booleanValue(contextJsParameters.config.jcontent?.showPageBuilder)) {
        registry.addOrReplace('action', 'createPage', createContentActionWrapper, {
            buttonIcon: <AddCircle/>,
            showOnNodeTypes: ['jnt:page', 'jnt:navMenuText', 'jnt:virtualsite'],
            requiredPermission: ['jcr:addChildNodes'],
            nodeTypes: ['jnt:page'],
            isIncludeSubTypes: false,
            hasBypassChildrenLimit: true,
            onCreate: ({path}) => {
                window.jahia.reduxStore.dispatch(batchActions([{
                    type: 'CM_OPEN_PATHS', payload: [path.substring(0, path.lastIndexOf('/'))]
                }, cmGoto({path})]));
            }
        });

        registry.add('action', 'createNavMenuItemMenu', registry.get('action', 'menuAction'), {
            buttonIcon: <AddCircle/>,
            buttonLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.newMenu',
            menuTarget: 'createNavMenuItemMenu',
            isMenuPreload: true
        });

        registry.addOrReplace('action', 'createNavMenuItem', createContentActionWrapper, {
            buttonIcon: <AddCircle/>,
            showOnNodeTypes: ['jnt:page', 'jnt:navMenuText', 'jnt:virtualsite'],
            requiredPermission: ['jcr:addChildNodes'],
            nodeTypes: ['jnt:navMenuText', 'jnt:nodeLink', 'jnt:externalLink'],
            isIncludeSubTypes: false,
            hasBypassChildrenLimit: true
        });
    }

    // In app actions
    registry.add('action', 'createButton', createAction, {
        buttonLabel: 'jcontent:label.contentEditor.create.createButton.name',
        buttonIcon: <Save/>,
        color: 'accent',
        variant: 'outlined',
        dataSelRole: 'createButton'
    });
};
