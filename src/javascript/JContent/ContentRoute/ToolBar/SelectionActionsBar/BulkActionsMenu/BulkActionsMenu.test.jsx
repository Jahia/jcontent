import React from 'react';
import {shallow} from '@jahia/test-framework';
import {BULK_ACTIONS_MENU, BulkActionsMenu} from './BulkActionsMenu';

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

    it('should hide itself when no entry of the menu is visible', () => {
        const props = shallow(<BulkActionsMenu paths={['/sites/test/a']}/>).find('DisplayAction').props();
        expect(props.isMenuPreload).toBe(true);
    });

    it('should merge the button props with the defaults', () => {
        const props = shallow(<BulkActionsMenu paths={['/sites/test/a']} buttonProps={{'data-sel-role': 'my-bulk'}}/>)
            .find('DisplayAction').props();
        expect(props.buttonProps).toEqual({size: 'default', variant: 'ghost', 'data-sel-role': 'my-bulk'});
    });
});
