import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';

import {DraggableReference} from './DraggableReference';

jest.mock('react-dnd', () => {
    return {
        ...jest.requireActual('react-dnd'),
        useDrop: jest.fn(() => [{handlerId: 'abacaba'}, jest.fn()]),
        useDrag: jest.fn(() => [{isDragging: false}, jest.fn(), jest.fn()])
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

    it('should display the reference', () => {
        const cmp = shallowWithTheme(
            <DraggableReference child={child}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.debug()).toContain('ReferenceCard');
    });

    it('should contains display name when component displayed', () => {
        const cmp = shallowWithTheme(
            <DraggableReference child={child}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('ReferenceCard').props().fieldData.displayName).toBe(child.displayName);
    });
});
