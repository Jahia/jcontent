import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import {PickerTreeQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/queryHandlers';

export const PickerEditorialLinkQueryHandler = {
    ...PickerTreeQueryHandler,

    // The types of the rows that open in a view, for the tree and for the ancestors of the selection
    getOpenableTypes: viewType => (viewType === Constants.tableView.type.PAGES ?
        ['jmix:mainResource', 'jnt:page', 'jnt:navMenuText'] :
        ['jmix:mainResource', 'jnt:contentFolder']),

    getTreeParams(options) {
        const treeParams = PickerTreeQueryHandler.getTreeParams(options);
        treeParams.openableTypes = this.getOpenableTypes(options.tableView.viewType);

        if (options.tableView.viewType === Constants.tableView.type.PAGES) {
            treeParams.selectableTypes = ['jnt:page', 'jmix:mainResource'];
        } else { // Content
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
