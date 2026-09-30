import {getChildrenOrder, getHiddenChildrenCount, keepLockedChildrenInPlace} from '~/ContentEditor/utils/index';

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

    it('should not modify anything if the sub-pages keep their order after an area', () => {
        const formValue = {
            'Children::Order': [{name: 'A'}, {name: 'B'}, {name: 'C'}]
        };
        const nodeData = {
            children: {
                nodes: [{name: 'main'}, {name: 'A'}, {name: 'B'}, {name: 'C'}]
            }
        };
        expect(getChildrenOrder(formValue, nodeData)).toEqual({shouldModifyChildren: false, childrenOrder: []});
    });

    it('should return the new sub-page order when sub-pages are reordered after an area', () => {
        const formValue = {
            'Children::Order': [{name: 'B'}, {name: 'A'}, {name: 'C'}]
        };
        const nodeData = {
            children: {
                nodes: [{name: 'main'}, {name: 'A'}, {name: 'B'}, {name: 'C'}]
            }
        };
        expect(getChildrenOrder(formValue, nodeData)).toEqual({
            shouldModifyChildren: true,
            childrenOrder: ['B', 'A', 'C']
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

    it('should not reorder when some sub-pages are hidden from the user', () => {
        const formValue = {
            'Children::Order': [{name: 'B'}, {name: 'A'}]
        };
        const nodeData = {
            isPage: true,
            hiddenSubPagesCount: 1,
            children: {
                nodes: [{name: 'A'}, {name: 'B'}]
            }
        };
        expect(getChildrenOrder(formValue, nodeData)).toEqual({shouldModifyChildren: false, childrenOrder: []});
    });
});

describe('getHiddenChildrenCount', () => {
    it('should count only the hidden sub-pages of a page', () => {
        expect(getHiddenChildrenCount({isPage: true, hiddenSubPagesCount: 2, hiddenChildrenCount: 5})).toBe(2);
    });

    it('should count all the hidden children of another node', () => {
        expect(getHiddenChildrenCount({isPage: false, hiddenSubPagesCount: 2, hiddenChildrenCount: 5})).toBe(5);
    });

    it('should count 0 when the node gives no count', () => {
        expect(getHiddenChildrenCount({})).toBe(0);
    });
});

describe('keepLockedChildrenInPlace', () => {
    const a = {name: 'A'};
    const b = {name: 'B'};
    const locked = {name: 'readOnly', canMove: false};
    const d = {name: 'D'};

    it('should keep a locked child in its position when a child crosses it', () => {
        expect(keepLockedChildrenInPlace([a, b, locked, d], [d, a, b, locked])).toEqual([d, a, locked, b]);
    });

    it('should put a locked child back in its position when it was moved', () => {
        expect(keepLockedChildrenInPlace([a, b, locked, d], [locked, a, b, d])).toEqual([a, b, locked, d]);
    });
});
