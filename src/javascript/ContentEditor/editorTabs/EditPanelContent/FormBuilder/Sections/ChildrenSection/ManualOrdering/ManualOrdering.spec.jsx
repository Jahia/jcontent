import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {ManualOrdering} from './ManualOrdering';

describe('Manual ordering component', () => {
    let props;

    beforeEach(() => {
        props = {
            onChange: jest.fn(),
            field: {
                value: [{
                    name: 'subNode1',
                    primaryNodeType: {
                        displayName: 'subNode1',
                        icon: '/icon'
                    }
                }, {
                    name: 'subNode2',
                    primaryNodeType: {
                        displayName: 'subNode2',
                        icon: '/icon'
                    }
                }]
            },
            form: {
                setFieldValue: jest.fn(),
                setFieldTouched: jest.fn()
            }
        };
    });

    it('should display children', () => {
        const cmp = buildFieldCmp();
        // +1 for the bottom droppable div
        expect(cmp.find('DraggableReference').length).toBe(props.field.value.length + 1);
    });

    let buildFieldCmp = () => {
        const cmp = shallowWithTheme(
            <ManualOrdering/>,
            {},
            dsGenericTheme
        );

        return cmp.find('FormikConnect(FastFieldInner)').renderProp('children')(props);
    };
});
