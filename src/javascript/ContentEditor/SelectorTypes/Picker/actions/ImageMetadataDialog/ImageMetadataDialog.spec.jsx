import React from 'react';
import {shallow} from '@jahia/test-framework';

import {useNodeFileMetadata} from '~/JContent/SidePanel/ContentDetails/useFileMetadata';
import {ImageMetadataDialog} from './ImageMetadataDialog';

jest.mock('~/JContent/SidePanel/ContentDetails/useFileMetadata', () => ({
    useNodeFileMetadata: jest.fn()
}));

jest.mock('~/JContent/SidePanel/ContentDetails', () => ({
    DetailRow: () => null
}));

const IPTC = {
    name: 'jmix:iptc',
    displayName: 'XMP/IPTC',
    entries: [
        {label: 'Caption', value: 'A sunset over the Tagus'},
        {label: 'Credit', value: 'AFP'}
    ]
};

const EXIF = {
    name: 'jmix:exif',
    displayName: 'EXIF',
    entries: [{label: 'Make', value: 'Canon'}]
};

const render = (props = {}) => shallow(
    <ImageMetadataDialog uuid="u1" lang="en" displayName="Sunset" onExit={jest.fn()} {...props}/>
);

describe('ImageMetadataDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useNodeFileMetadata.mockReturnValue([IPTC, EXIF]);
    });

    it('opens on render', () => {
        expect(render().find('WithStyles(Dialog)').prop('open')).toBe(true);
    });

    it('lists a row per value across every group', () => {
        expect(render().find('DetailRow')).toHaveLength(3);
    });

    it('reads the image it was given', () => {
        render();
        expect(useNodeFileMetadata).toHaveBeenCalledWith({uuid: 'u1', lang: 'en'});
    });

    it('closes when a value is copied, so the editor lands back on the field to paste into', () => {
        const cmp = render();
        cmp.find('DetailRow').first().prop('onCopied')();

        expect(cmp.find('WithStyles(Dialog)').prop('open')).toBe(false);
    });

    it('stays open until a copy actually happens', () => {
        const cmp = render();
        expect(cmp.find('WithStyles(Dialog)').prop('open')).toBe(true);
    });

    it('says so when the image carries no metadata', () => {
        useNodeFileMetadata.mockReturnValue([]);
        const cmp = render();

        expect(cmp.find('[data-sel-role="image-metadata-empty"]').exists()).toBe(true);
        expect(cmp.find('DetailRow')).toHaveLength(0);
    });

    it('hands the close back to the caller once the dialog has finished exiting', () => {
        const onExit = jest.fn();
        const cmp = render({onExit});

        expect(cmp.find('WithStyles(Dialog)').prop('onExited')).toBe(onExit);
    });
});
