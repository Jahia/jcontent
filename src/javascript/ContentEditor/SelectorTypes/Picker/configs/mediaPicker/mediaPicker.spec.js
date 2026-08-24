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
        it('should offer the formats a browser can render', () => {
            expect(mimeFiltersOf(configs.image, 'picker-media'))
                .toEqual(expect.arrayContaining(['jpeg', 'png', 'gif', 'webp', 'svg']));
        });

        it('should not offer image formats a browser cannot render', () => {
            // These are jmix:image too, so nothing else keeps them out of an image field.
            const offered = mimeFiltersOf(configs.image, 'picker-media');

            ['tiff', 'psd', 'photoshop', 'raw'].forEach(format => {
                expect(offered).not.toContain(format);
            });
        });

        it('should keep folders browsable, since they carry no mime type', () => {
            expect(configs.image.accordionItem['picker-media'].tableConfig.tableDisplayFilter)
                .toEqual(expect.arrayContaining([{evaluation: 'EQUAL', fieldName: 'isFile', value: 'false'}]));
        });

        it('should restrict search to the same formats, so it cannot surface the others', () => {
            expect(mimeFiltersOf(configs.image, 'picker-search'))
                .toEqual(mimeFiltersOf(configs.image, 'picker-media'));
        });

        it('should still select on image types, the restriction being about what is displayable', () => {
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
