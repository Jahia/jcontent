import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {ManualOrderingField} from './ManualOrdering';

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
        expect(cmp.find('DraggableReference').length).toBe(props.field.value.length);
    });

    let buildFieldCmp = () => {
        const cmp = shallowWithTheme(
            <ManualOrderingField {...props}/>,
            {},
            dsGenericTheme
        );

        return cmp;
    };
});
