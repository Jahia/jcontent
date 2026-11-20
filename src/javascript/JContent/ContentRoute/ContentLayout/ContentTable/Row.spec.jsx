import React from 'react';
import {shallow} from 'enzyme';
import {Row} from './Row';

jest.mock('~/JContent/dnd/useNodeDrop', () => ({useNodeDrop: () => [{isCanDrop: false}, jest.fn()]}));
jest.mock('~/JContent/dnd/useNodeDrag', () => ({useNodeDrag: () => [{dragging: false}, jest.fn()]}));
jest.mock('~/JContent/dnd/useFileDrop', () => ({useFileDrop: () => [{isCanDrop: false}, jest.fn()]}));

const node = {path: '/sites/site/contents/text', name: 'text', primaryNodeType: {name: 'jnt:text'}};

const renderRow = sidePanelSelection => {
    const onPreviewSelect = jest.fn();
    const cmp = shallow(
        <Row isPreviewOpened
             row={{original: node, cells: [], getRowProps: () => ({})}}
             selection={[]}
             sidePanelSelection={sidePanelSelection}
             setSelectedItemIndex={jest.fn()}
             tableConfig={{}}
             index={0}
             virtualizer={{measureElement: jest.fn()}}
             virtualRow={{index: 0, start: 0}}
             onPreviewSelect={onPreviewSelect}
        />
    );
    return {click: detail => cmp.find('TableRow').simulate('click', {detail}), onPreviewSelect};
};

describe('Row', () => {
    it('opens the side panel on the row that a click selects', () => {
        const {click, onPreviewSelect} = renderRow('/sites/site/contents/other');
        click(1);
        expect(onPreviewSelect).toHaveBeenCalledWith(node.path);
    });

    it('closes the side panel on a click on the row that is already selected', () => {
        const {click, onPreviewSelect} = renderRow(node.path);
        click(1);
        expect(onPreviewSelect).toHaveBeenCalledWith(null);
    });

    it('keeps the side panel open on the second click of a double-click', () => {
        const {click, onPreviewSelect} = renderRow(node.path);
        click(2);
        expect(onPreviewSelect).not.toHaveBeenCalled();
    });
});
