import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';

import {DraggableReference} from './DraggableReference';
import {useDrag, useDrop} from 'react-dnd';

jest.mock('react-dnd', () => {
    return {
        ...jest.requireActual('react-dnd'),
        useDrop: jest.fn(() => ['drop', 'drop']),
        useDrag: jest.fn(() => ['drop', 'drop'])
    };
});

describe('DraggableReference component', () => {
    const child = {
        name: 'subNode1',
        displayName: 'This sub node',
        primaryNodeType: {
            displayName: 'subNode1',
            icon: '/icon'
        }
    };

    it('should display the reference when not dragging', () => {
        useDrag.mockImplementation(() => ([{isDragging: false}]));

        const cmp = shallowWithTheme(
            <DraggableReference child={child}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.debug()).toContain('ReferenceCard');
    });

    it('should not display the reference when dragging', () => {
        useDrag.mockImplementation(() => ([{isDragging: true}]));

        const cmp = shallowWithTheme(
            <DraggableReference child={child}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.debug()).not.toContain('ReferenceCard');
    });

    it('should contains display name when component displayed', () => {
        useDrag.mockImplementation(() => ([{isDragging: false}]));

        const cmp = shallowWithTheme(
            <DraggableReference child={child}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('ReferenceCard').props().fieldData.displayName).toBe(child.displayName);
    });

    it('should call onReorder when drop', () => {
        const item = {name: 'subNode1'};
        useDrag.mockImplementation(() => ([{isDragging: true}]));
        useDrop.mockImplementation(obj => {
            obj.drop(item);
            return [jest.fn(), {}];
        });

        const handleReorder = jest.fn();

        shallowWithTheme(
            <DraggableReference child={child} index={42} onReorder={handleReorder}/>,
            {},
            dsGenericTheme
        );

        expect(handleReorder).toHaveBeenCalledWith(item.name, 42);
    });
});
