import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {PickerTreeQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/queryHandlers';

const pagesOpenableTypes = ['jmix:mainResource', 'jnt:page', 'jnt:navMenuText'];
const contentOpenableTypes = ['jmix:mainResource', 'jnt:contentFolder'];

export const PickerEditorialLinkQueryHandler = {
    ...PickerTreeQueryHandler,

    // The types of the rows that open, in either view
    openableTypes: [...new Set([...pagesOpenableTypes, ...contentOpenableTypes])],

    getTreeParams: options => {
        const treeParams = PickerTreeQueryHandler.getTreeParams(options);

        if (options.tableView.viewType === Constants.tableView.type.PAGES) {
            treeParams.openableTypes = pagesOpenableTypes;
            treeParams.selectableTypes = ['jnt:page', 'jmix:mainResource'];
        } else { // Content
            treeParams.openableTypes = contentOpenableTypes;
            treeParams.selectableTypes = ['jmix:mainResource'];
        }

        treeParams.recursionTypesFilter = {
            multi: 'NONE',
            types: [
                'jmix:mainResource',
                'jnt:contentFolder',
                'jnt:page',
                'jnt:folder',
                'jnt:navMenuText',
                'jnt:usersFolder',
                'jnt:groupsFolder'
            ]
        };

        return treeParams;
    }
};
