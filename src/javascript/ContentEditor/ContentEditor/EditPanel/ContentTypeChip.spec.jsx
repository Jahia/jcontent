import React from 'react';
import {shallow} from 'enzyme';
import {Area, Chip} from '@jahia/moonstone';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {ContentTypeChip} from './ContentTypeChip';

jest.mock('~/ContentEditor/contexts', () => ({useContentEditorContext: jest.fn()}));

const AREA_LABEL = 'translated_jcontent:label.contentManager.contentType.area';

const chipFor = context => {
    useContentEditorContext.mockReturnValue(context);
    return shallow(<ContentTypeChip/>).find(Chip);
};

describe('ContentTypeChip', () => {
    it('should show the display name of an ordinary type', () => {
        const chip = chipFor({
            nodeData: {mixinTypes: []},
            nodeTypeName: 'luxen:section',
            nodeTypeDisplayName: 'Section'
        });

        expect(chip.prop('label')).toBe('Section');
    });

    it('should name an area and picture it the way Page Builder does', () => {
        const chip = chipFor({
            nodeData: {mixinTypes: [{name: 'jmix:isAreaList'}]},
            nodeTypeName: 'jnt:contentList',
            nodeTypeDisplayName: 'Content list'
        });

        expect(chip.prop('label')).toBe(AREA_LABEL);
        expect(chip.prop('icon').type).toBe(Area);
    });

    it('should leave an ordinary content list alone', () => {
        const chip = chipFor({
            nodeData: {mixinTypes: [{name: 'jmix:autoPublish'}]},
            nodeTypeName: 'jnt:contentList',
            nodeTypeDisplayName: 'Content list'
        });

        expect(chip.prop('label')).toBe('Content list');
        expect(chip.prop('icon').type).not.toBe(Area);
    });

    it('should keep showing the mime type of a file', () => {
        const chip = chipFor({
            nodeData: {isFile: true, mixinTypes: [], content: {mimeType: {value: 'image/png'}}},
            nodeTypeName: 'jnt:file',
            nodeTypeDisplayName: 'File'
        });

        expect(chip.prop('label')).toBe('image/png');
    });
});
