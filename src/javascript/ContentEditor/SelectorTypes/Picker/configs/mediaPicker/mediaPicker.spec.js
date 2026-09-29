import {registerMediaPickers} from './mediaPicker';

jest.mock('~/JContent/ContentRoute/ToolBar/FileModeSelector', () => ({}));

const registerAll = () => {
    const configs = {};
    registerMediaPickers({
        add: (type, key, config) => {
            configs[key] = config;
        },
        // The accordion items registered afterwards are not what this spec is about; returning
        // nothing here skips them and leaves the picker configs to inspect.
        get: () => undefined,
        addOrReplace: () => undefined
    });
    return configs;
};

const mimeFiltersOf = (config, accordion) => (config.accordionItem?.[accordion]?.tableConfig?.tableDisplayFilter || [])
    .filter(filter => filter.fieldName === 'content.mimeType.value')
    .map(filter => filter.value);

describe('media pickers', () => {
    let configs;

    beforeEach(() => {
        configs = registerAll();
    });

    describe('image picker', () => {
        // The jmix:image mixin covers formats a browser cannot display - TIFF, PSD, camera raw.
        // Filtering those out of the picker was tried and deliberately dropped: editors reference
        // print resolution files on purpose, and the picker is not the place to overrule them. It
        // goes on the node type alone, so anything the repository counts as an image stays pickable.
        it('should offer every image type, including formats a browser cannot display', () => {
            expect(mimeFiltersOf(configs.image, 'picker-media')).toEqual([]);
            expect(mimeFiltersOf(configs.image, 'picker-search')).toEqual([]);
        });

        it('should select on image types', () => {
            expect(configs.image.selectableTypesTable).toEqual(['jmix:image']);
        });
    });

    describe('other media pickers', () => {
        it('should leave the file picker unrestricted, it exists to pick any file', () => {
            expect(mimeFiltersOf(configs.file, 'picker-media')).toEqual([]);
            expect(configs.file.selectableTypesTable).toEqual(['jnt:file']);
        });

        it('should leave the pdf picker on its own filter', () => {
            expect(mimeFiltersOf(configs.pdf, 'picker-media')).toEqual(['pdf']);
        });
    });
});
