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

    it('should lock a child that the user cannot move', () => {
        props.field.value[1].canMove = false;
        const cmp = buildFieldCmp();
        expect(cmp.find('DraggableReference').map(ref => ref.props().isLocked)).toEqual([false, true]);
    });

    it('should show how many children are hidden from the user', () => {
        props.hiddenChildrenCount = 2;
        const cmp = buildFieldCmp();
        expect(cmp.find('[data-sel-role="hidden-children-message"]').length).toBe(1);
    });

    it('should not show the hidden children message when no child is hidden', () => {
        const cmp = buildFieldCmp();
        expect(cmp.find('[data-sel-role="hidden-children-message"]').length).toBe(0);
    });

    it('should move a child over a locked child and keep the locked child in its position', () => {
        props.field.name = 'Children::Order';
        props.field.value.push({name: 'subNode3', primaryNodeType: {displayName: 'subNode3', icon: '/icon'}});
        props.field.value[1].canMove = false;
        const [first, locked, third] = props.field.value;
        const cmp = buildFieldCmp();
        cmp.find('DraggableReference').at(0).props().onValueMove('Children::Order[0]', 'down');
        expect(props.form.setFieldValue).toHaveBeenCalledWith('Children::Order', [third, locked, first]);
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
