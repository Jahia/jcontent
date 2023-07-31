import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {PickerTreeQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/queryHandlers';
import {renderer} from '~/ContentEditor/SelectorTypes/Picker/configs/renderer';
import {Collections} from '@jahia/moonstone';
import React from 'react';

export const registerFolderPicker = registry => {
    registry.add(Constants.pickerConfig, 'folder', {
        pickerInput: {
            emptyLabel: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalFolderTitle'
        },
        pickerDialog: {
            dialogTitle: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalFolderTitle',
            displayTree: false
        },
        searchContentType: 'jnt:folder',
        selectableTypesTable: ['jnt:folder'],
        selectionTable: {
            columns: ['publicationStatus', 'name', 'relPath']
        }
    });

    registry.add(Constants.ACCORDION_ITEM_NAME, 'picker-media-tree', {
        targets: ['folder:70'],
        icon: <Collections/>,
        label: 'jcontent:label.contentManager.navigation.media',
        rootPath: '/sites/{site}/files',
        tableConfig: {
            queryHandler: PickerTreeQueryHandler,
            hideRoot: false,
            defaultSort: {orderBy: 'lastModified.value', order: 'DESC'},
            openableTypes: ['jnt:folder'],
            columns: ['name', 'lastModified'],
            contextualMenu: 'contentPickerMenu'
        }
    }, renderer);
};
