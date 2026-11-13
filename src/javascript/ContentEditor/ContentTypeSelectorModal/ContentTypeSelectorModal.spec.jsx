import React from 'react';
import {shallow} from 'enzyme';
import {registry} from '@jahia/ui-extender';
import {ContentTypeSelectorModal, CONTENT_TYPE_SELECTOR_PANE} from './ContentTypeSelectorModal';

jest.mock('react-i18next', () => ({useTranslation: () => ({t: key => key})}));
jest.mock('@jahia/ui-extender', () => ({registry: {find: jest.fn(() => [])}}));

const props = {
    nodeTypesTree: [],
    isOpen: true,
    onClose: jest.fn(),
    onExited: jest.fn(),
    onCreateContent: jest.fn(),
    name: 'slot',
    editorConfig: {uuid: 'parent-uuid', lang: 'en'},
    onCreated: jest.fn()
};

const paneSelector = '[data-sel-role="content-type-selector-pane"]';

describe('ContentTypeSelectorModal pane', () => {
    it('renders no pane when none is registered', () => {
        registry.find.mockReturnValue([]);
        const cmp = shallow(<ContentTypeSelectorModal {...props}/>);

        expect(cmp.find(paneSelector).exists()).toBe(false);
        expect(cmp.find('[data-sel-role="content-type-tree"]').exists()).toBe(true);
    });

    it('renders the first enabled pane with the create context', () => {
        const Disabled = () => null;
        const Pane = () => null;
        registry.find.mockReturnValue([
            {key: 'off', isEnabled: () => false, component: Disabled},
            {key: 'samples', component: Pane}
        ]);
        const cmp = shallow(<ContentTypeSelectorModal {...props}/>);

        expect(registry.find).toHaveBeenCalledWith({type: CONTENT_TYPE_SELECTOR_PANE});
        expect(cmp.find(paneSelector).prop('data-sel-pane')).toBe('samples');
        expect(cmp.find(Disabled).exists()).toBe(false);
        expect(cmp.find(Pane).props()).toEqual({
            selectedType: null,
            name: 'slot',
            editorConfig: props.editorConfig,
            onClose: props.onClose,
            onCreated: props.onCreated
        });
    });

    it('skips a pane whose isEnabled throws', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const Pane = () => null;
        registry.find.mockReturnValue([
            {key: 'broken', isEnabled: () => {
                throw new Error('broken');
            }, component: () => null},
            {key: 'samples', component: Pane}
        ]);
        const cmp = shallow(<ContentTypeSelectorModal {...props}/>);

        expect(cmp.find(paneSelector).prop('data-sel-pane')).toBe('samples');
    });

    it('asks each pane whether it accepts the create', () => {
        const isEnabled = jest.fn(() => false);
        registry.find.mockReturnValue([{key: 'samples', isEnabled, component: () => null}]);
        const cmp = shallow(<ContentTypeSelectorModal {...props}/>);

        expect(isEnabled).toHaveBeenCalledWith({name: 'slot', editorConfig: props.editorConfig});
        expect(cmp.find(paneSelector).exists()).toBe(false);
    });
});
