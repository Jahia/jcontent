import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {SiteWeb} from '@jahia/moonstone';
import {PickerBaseQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/queryHandlers';
import {renderer} from '~/ContentEditor/SelectorTypes/Picker/configs/renderer';
import React from 'react';
import * as reactTable from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable';
import {NoIconPickerCaption} from '~/ContentEditor/SelectorTypes/Picker/configs/NoIconPickerCaption';

const nameColumn = {
    id: 'name',
    accessor: 'displayName',
    label: 'jcontent:label.contentManager.listColumns.name',
    sortable: true,
    property: 'displayName',
    Cell: reactTable.CellNameNoIcon,
    Header: reactTable.Header,
    width: '300px'
};

export const registerSitePicker = registry => {
    registry.add(Constants.pickerConfig, 'site', {
        searchContentType: 'jnt:virtualsite',
        selectableTypesTable: ['jnt:virtualsite'],
        pickerCaptionComponent: NoIconPickerCaption,
        pickerInput: {
            emptyLabel: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalSiteTitle'
        },
        pickerDialog: {
            dialogTitle: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalSiteTitle',
            displayTree: false,
            displaySiteSwitcher: false
        },
        selectionTable: {
            columns: [nameColumn]
        }
    });

    registry.add(Constants.ACCORDION_ITEM_NAME, `picker-${Constants.ACCORDION_ITEM_TYPES.SITE}`, {
        targets: ['site:60'],
        icon: <SiteWeb/>,
        label: 'jcontent:label.contentEditor.picker.navigation.sites',
        rootPath: '/sites',
        canDisplayItem: ({selectionNode, folderNode}) => selectionNode ? /^\/sites\/[^/]*/.test(selectionNode.path) : folderNode.path === '/sites',
        tableConfig: {
            queryHandler: PickerBaseQueryHandler,
            defaultSort: {orderBy: 'displayName', order: 'ASC'},
            columns: [nameColumn]
        }
    }, renderer);
};
