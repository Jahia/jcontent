import {getChildrenOrder} from '~/ContentEditor/utils/index';

describe('getChildrenOrder', () => {
    it('should not modify anything if there is no Children Order field', () => {
        expect(getChildrenOrder({})).toEqual({shouldModifyChildren: false, childrenOrder: []});
    });

    it('should not modify anything if there is no changes in Children Order field', () => {
        const formValue = {
            'Children::Order': [{name: 'ac'}, {name: 'dc'}]
        };
        const nodeData = {
            children: {
                nodes: [{name: 'ac'}, {name: 'dc'}]
            }
        };
        expect(getChildrenOrder(formValue, nodeData)).toEqual({shouldModifyChildren: false, childrenOrder: []});
    });

    it('should return the new children order, only names', () => {
        const formValue = {
            'Children::Order': [{name: 'dc'}, {name: 'ac'}]
        };
        const nodeData = {
            children: {
                nodes: [{name: 'ac'}, {name: 'dc'}]
            }
        };
        expect(getChildrenOrder(formValue, nodeData)).toEqual({
            shouldModifyChildren: true,
            childrenOrder: ['dc', 'ac']
        });
    });

    it('should not modify children order when jmix:orderedList fieldset is readOnly', () => {
        const formValue = {
            'Children::Order': [{name: 'dc'}, {name: 'ac'}]
        };
        const nodeData = {
            children: {
                nodes: [{name: 'ac'}, {name: 'dc'}]
            }
        };
        const sections = [
            {
                fieldSets: [
                    {name: 'jmix:orderedList', readOnly: true}
                ]
            }
        ];
        expect(getChildrenOrder(formValue, nodeData, sections)).toEqual({shouldModifyChildren: false, childrenOrder: []});
    });
});
