import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {useFormikContext} from 'formik';
import {FilenameMimeTypeBadge} from './FilenameMimeTypeBadge';

jest.mock('formik');

let mockEditorContext;
jest.mock('~/ContentEditor/contexts', () => {
    return {
        useContentEditorContext: () => (mockEditorContext)
    };
});

describe('FilenameMimeTypeBadge', () => {
    const systemNameField = {name: 'nt:base_ce:systemName', displayName: 'Filename'};

    const render = field => shallowWithTheme(
        <FilenameMimeTypeBadge field={field || systemNameField}/>,
        {},
        dsGenericTheme
    );

    const chips = cmp => cmp.find('Chip');

    beforeEach(() => {
        mockEditorContext = {
            nodeData: {
                name: 'photo.jpg',
                content: {mimeType: {value: 'image/png'}}
            }
        };
        useFormikContext.mockReturnValue({values: {}});
    });

    it('should warn when the name does not match the stored mime type', () => {
        expect(chips(render()).length).toBe(1);
    });

    it('should not warn when the name matches the stored mime type', () => {
        mockEditorContext.nodeData.name = 'photo.png';
        expect(chips(render()).length).toBe(0);
    });

    it('should not warn for a field that is not the system name', () => {
        expect(chips(render({name: 'jnt:file_jcr:title', displayName: 'Title'})).length).toBe(0);
    });

    it('should not warn for content that has no binary', () => {
        delete mockEditorContext.nodeData.content;
        expect(chips(render()).length).toBe(0);
    });

    it('should judge the name being edited rather than the saved one', () => {
        // Saved name is wrong, but the value in the form has been corrected already
        useFormikContext.mockReturnValue({values: {'nt:base_ce:systemName': 'photo.png'}});
        expect(chips(render()).length).toBe(0);
    });

    it('should warn once the name being edited stops matching', () => {
        mockEditorContext.nodeData.name = 'photo.png';
        useFormikContext.mockReturnValue({values: {'nt:base_ce:systemName': 'photo.gif'}});
        expect(chips(render()).length).toBe(1);
    });
});
