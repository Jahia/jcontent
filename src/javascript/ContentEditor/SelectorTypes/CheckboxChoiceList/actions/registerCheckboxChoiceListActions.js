import React from 'react';

import {unsetFieldAction} from '~/ContentEditor/SelectorTypes/actions/unsetFieldAction';
import {Add, Close, MoreVert} from '@jahia/moonstone';
import {selectAllAction} from '../../ChoiceList/actions/selectAllAction';

export const registerCheckboxChoiceListActions = registry => {
    registry.add('action', 'content-editor/field/CheckboxChoiceList', registry.get('action', 'menuAction'), {
        buttonIcon: <MoreVert/>,
        buttonLabel: 'label.contentEditor.edit.action.fieldMoreOptions',
        menuTarget: 'content-editor/field/CheckboxChoiceList',
        menuItemProps: {
            isShowIcons: true
        }
    });

    registry.add('action', 'unsetFieldActionCheckboxChoiceList', unsetFieldAction, {
        buttonIcon: <Close/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.fields.actions.clear',
        targets: ['content-editor/field/CheckboxChoiceList:1']
    });

    registry.add('action', 'selectAllActionCheckboxChoiceList', selectAllAction, {
        buttonIcon: <Add/>,
        buttonLabel: 'jcontent:label.contentEditor.edit.fields.actions.selectAll',
        targets: ['content-editor/field/CheckboxChoiceList:2']
    });
};
