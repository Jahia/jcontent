import React from 'react';
import {shallow} from 'enzyme';
import {Typography} from '@jahia/moonstone';
import {CellType} from './CellType';

const AREA_LABEL = 'translated_jcontent:label.contentManager.contentType.area';

const render = (node, value) => shallow(
    <CellType
        value={value ?? node.primaryNodeType.displayName}
        row={{id: 'row1', original: node}}
        column={{id: 'type', width: '180px'}}
        cell={{getCellProps: () => ({})}}
    />
).find(Typography).prop('children');

describe('CellType', () => {
    it('should show the type of an ordinary node', () => {
        expect(render({primaryNodeType: {name: 'luxen:section', displayName: 'Section'}})).toBe('Section');
    });

    it('should name an area, which is stored as a content list', () => {
        expect(render({
            primaryNodeType: {name: 'jnt:contentList', displayName: 'Content list'},
            mixinTypes: [{name: 'jmix:isAreaList'}]
        })).toBe(AREA_LABEL);
    });

    it('should leave an ordinary content list alone', () => {
        expect(render({
            primaryNodeType: {name: 'jnt:contentList', displayName: 'Content list'},
            mixinTypes: [{name: 'jmix:autoPublish'}]
        })).toBe('Content list');
    });

    it('should show the mime type of a file rather than its type', () => {
        expect(render({
            primaryNodeType: {name: 'jnt:file', displayName: 'File'},
            content: {mimeType: {value: 'image/png'}}
        })).toBe('image/png');
    });
});
