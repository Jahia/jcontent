import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {getPagesSearchContextData} from '~/ContentEditor/SelectorTypes/Picker/configs/getPagesSearchContextData';
import {PickerTreeQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/queryHandlers';
import {renderer} from '~/ContentEditor/SelectorTypes/Picker/configs/renderer';

export const registerPagePicker = registry => {
    registry.add(Constants.pickerConfig, 'page', {
        pickerInput: {
            emptyLabel: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalPageTitle'
        },
        pickerDialog: {
            dialogTitle: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalPageTitle',
            isSiteEnabled: siteKey => siteKey !== 'systemsite',
            displayTree: false
        },
        selectionTable: {
            columns: ['publicationStatus', 'name', 'relPath']
        },
        searchContentType: 'jnt:page',
        selectableTypesTable: ['jnt:page']
    });

    const pagesItem = registry.get(Constants.ACCORDION_ITEM_NAME, Constants.ACCORDION_ITEM_TYPES.PAGES);
    if (pagesItem) {
        // Pages tree
        registry.add(Constants.ACCORDION_ITEM_NAME, 'picker-pages-tree', {
            ...pagesItem,
            targets: ['page:50'],
            getPathForItem: null,
            getSearchContextData: getPagesSearchContextData,
            tableConfig: {
                queryHandler: PickerTreeQueryHandler,
                defaultSort: {orderBy: ''},
                columns: ['publicationStatus', 'name', 'lastModified'],
                contextualMenu: 'contentPickerMenu',
                openableTypes: ['jmix:navMenuItem']
            },
            treeConfig: {
                ...pagesItem.treeConfig,
                dnd: {}
            }
        }, renderer);
    }
};
