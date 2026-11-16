import React from 'react';
import {shallow} from '@jahia/test-framework';
import {BULK_ACTIONS_MENU, BULK_ACTIONS_TARGET, BulkActionsMenu} from './BulkActionsMenu';

jest.mock('@jahia/ui-extender', () => ({
    DisplayAction: () => false
}));

jest.mock('~/utils/getButtonRenderer', () => ({
    ButtonRenderer: () => false
}));

describe('BulkActionsMenu', () => {
    it('should render nothing without a selection', () => {
        expect(shallow(<BulkActionsMenu paths={[]}/>).find('DisplayAction').length).toEqual(0);
        expect(shallow(<BulkActionsMenu/>).find('DisplayAction').length).toEqual(0);
    });

    it('should pass a single selected item as path', () => {
        const props = shallow(<BulkActionsMenu paths={['/sites/test/a']}/>).find('DisplayAction').props();
        expect(props.actionKey).toEqual(BULK_ACTIONS_MENU);
        expect(props.path).toEqual('/sites/test/a');
        expect(props.paths).toBeUndefined();
    });

    it('should pass several selected items as paths', () => {
        const paths = ['/sites/test/a', '/sites/test/b'];
        const props = shallow(<BulkActionsMenu paths={paths}/>).find('DisplayAction').props();
        expect(props.paths).toEqual(paths);
        expect(props.path).toBeUndefined();
    });

    it('should read the default target and hide itself when the menu is empty', () => {
        const props = shallow(<BulkActionsMenu paths={['/sites/test/a']}/>).find('DisplayAction').props();
        expect(props.menuTarget).toEqual(BULK_ACTIONS_TARGET);
        expect(props.isMenuPreload).toBe(true);
    });

    it('should keep only the listed action keys', () => {
        const filter = shallow(<BulkActionsMenu paths={['/sites/test/a']} actionKeys={['bulkTag', 'bulkExport']}/>)
            .find('DisplayAction').props().menuFilter;
        expect(filter({key: 'bulkTag'})).toBe(true);
        expect(filter({key: 'bulkExport'})).toBe(true);
        expect(filter({key: 'bulkCategorize'})).toBe(false);
    });

    it('should combine the listed action keys with a filter', () => {
        const filter = shallow(
            <BulkActionsMenu paths={['/sites/test/a']} actionKeys={['bulkTag', 'bulkExport']} menuFilter={action => action.key !== 'bulkExport'}/>
        ).find('DisplayAction').props().menuFilter;
        expect(filter({key: 'bulkTag'})).toBe(true);
        expect(filter({key: 'bulkExport'})).toBe(false);
    });

    it('should let the caller choose the entries and extend their context', () => {
        const menuFilter = () => true;
        const props = shallow(
            <BulkActionsMenu
                paths={['/sites/test/a']}
                menuTarget={['bulkActions', 'myModuleBulkActions']}
                menuFilter={menuFilter}
                contentType="jnt:news"
                buttonProps={{'data-sel-role': 'my-bulk'}}
            />
        ).find('DisplayAction').props();
        expect(props.menuTarget).toEqual(['bulkActions', 'myModuleBulkActions']);
        expect(props.menuFilter).toBe(menuFilter);
        expect(props.contentType).toEqual('jnt:news');
        expect(props.buttonProps).toEqual({size: 'default', variant: 'ghost', 'data-sel-role': 'my-bulk'});
    });
});
