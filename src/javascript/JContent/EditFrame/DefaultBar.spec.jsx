import React from 'react';
import {shallow} from 'enzyme';
import {Chip} from '@jahia/moonstone';
import {LabelBar} from './DefaultBar';

const AREA_LABEL = 'translated_jcontent:label.contentManager.contentType.area';
const ABSOLUTE_AREA_LABEL = 'translated_jcontent:label.contentManager.contentType.absoluteArea';
const LIST_LABEL = 'translated_jcontent:label.contentManager.contentType.list';

const node = (name, displayName) => ({
    displayName: 'My box',
    primaryNodeType: {name, displayName, icon: '/icons/somewhere'}
});

const genericList = node('jnt:contentList', 'Content list');

const labelOf = (boxNode, area) => shallow(<LabelBar node={boxNode} area={area}/>).find(Chip).prop('label');

describe('LabelBar', () => {
    beforeEach(() => {
        globalThis.contextJsParameters = {contextPath: ''};
    });

    it('should name a list by its own type, which is what the author recognizes the box by', () => {
        expect(labelOf(node('luxen:section', 'Section'), {isList: true})).toBe('Section');
    });

    it('should fall back to the generic label for a list that is only a content list', () => {
        expect(labelOf(genericList, {isList: true})).toBe(LIST_LABEL);
    });

    it('should name an area', () => {
        expect(labelOf(genericList, {isArea: true})).toBe(AREA_LABEL);
    });

    it('should name an absolute area', () => {
        expect(labelOf(genericList, {isAbsolute: true})).toBe(ABSOLUTE_AREA_LABEL);
    });

    it('should keep naming an area by its own type when it has a more specific one', () => {
        expect(labelOf(node('jnt:mainResourceDisplay', 'Main resource'), {isArea: true})).toBe('Main resource');
    });

    it('should not fail on a node whose type is unknown', () => {
        expect(labelOf({displayName: 'My box'}, {isList: true})).toBe(LIST_LABEL);
    });
});
