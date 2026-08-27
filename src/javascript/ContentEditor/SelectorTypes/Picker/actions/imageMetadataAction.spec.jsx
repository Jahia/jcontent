import React from 'react';
import {shallow} from '@jahia/test-framework';

import {useNodeFileMetadata} from '~/JContent/SidePanel/ContentDetails/useFileMetadata';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {ImageMetadataActionComponent} from './imageMetadataAction';

jest.mock('~/JContent/SidePanel/ContentDetails/useFileMetadata', () => ({
    useNodeFileMetadata: jest.fn()
}));

jest.mock('~/ContentEditor/contexts', () => ({
    useContentEditorConfigContext: jest.fn()
}));

const mockRender = jest.fn();
const mockDestroy = jest.fn();

// UseContext falls back to the context's default value when no Provider wraps the component, which
// is exactly the case under shallow rendering.
jest.mock('@jahia/ui-extender', () => ({
    // Called through, rather than passed by reference: the factory runs while the mocks are still
    // in their temporal dead zone, so the lookup has to happen at call time.
    ComponentRendererContext: jest.requireActual('react').createContext({
        render: (...args) => mockRender(...args),
        destroy: (...args) => mockDestroy(...args)
    })
}));

const IPTC = {
    name: 'jmix:iptc',
    displayName: 'XMP/IPTC',
    entries: [{label: 'Caption', value: 'A sunset over the Tagus'}]
};

const contextWith = item => ({actionContext: {fieldData: item ? [item] : []}});
const image = {uuid: 'u1', name: 'sunset.jpg', displayName: 'Sunset', type: 'image/jpeg'};

const Render = () => null;

describe('imageMetadataAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useContentEditorConfigContext.mockReturnValue({lang: 'en'});
        useNodeFileMetadata.mockReturnValue([IPTC]);
    });

    it('offers the entry for an image carrying metadata', () => {
        const cmp = shallow(<ImageMetadataActionComponent render={Render} inputContext={contextWith(image)}/>);
        expect(cmp.find(Render).exists()).toBe(true);
    });

    it('hides the entry for an image carrying no metadata, rather than opening onto nothing', () => {
        useNodeFileMetadata.mockReturnValue([]);
        const cmp = shallow(<ImageMetadataActionComponent render={Render} inputContext={contextWith(image)}/>);
        expect(cmp.find(Render).exists()).toBe(false);
    });

    it('hides the entry when the picked file is not an image', () => {
        const cmp = shallow(<ImageMetadataActionComponent render={Render} inputContext={contextWith({uuid: 'u1', type: 'application/pdf'})}/>);
        expect(cmp.find(Render).exists()).toBe(false);
    });

    it('hides the entry while the field is empty', () => {
        const cmp = shallow(<ImageMetadataActionComponent render={Render} inputContext={contextWith(null)}/>);
        expect(cmp.find(Render).exists()).toBe(false);
    });

    it('does not query for a node it will not offer the entry for', () => {
        shallow(<ImageMetadataActionComponent render={Render} inputContext={contextWith({uuid: 'u1', type: 'application/pdf'})}/>);
        expect(useNodeFileMetadata).toHaveBeenCalledWith(expect.objectContaining({skip: true}));
    });

    it('survives an inputContext that has no field data yet', () => {
        expect(() => shallow(<ImageMetadataActionComponent render={Render} inputContext={undefined}/>)).not.toThrow();
    });

    it('opens the dialog on the picked image', () => {
        const cmp = shallow(<ImageMetadataActionComponent render={Render} inputContext={contextWith(image)}/>);
        cmp.find(Render).simulate('click');

        expect(mockRender).toHaveBeenCalledWith(
            'imageMetadataDialog',
            expect.anything(),
            expect.objectContaining({uuid: 'u1', lang: 'en', displayName: 'Sunset'})
        );
    });

    it('destroys the dialog once it has closed', () => {
        const cmp = shallow(<ImageMetadataActionComponent render={Render} inputContext={contextWith(image)}/>);
        cmp.find(Render).simulate('click');

        mockRender.mock.calls[0][2].onExit();
        expect(mockDestroy).toHaveBeenCalledWith('imageMetadataDialog');
    });
});
