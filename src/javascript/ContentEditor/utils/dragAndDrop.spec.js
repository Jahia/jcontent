import {onListReorder} from './dragAndDrop.utils';

describe('onListReorder', () => {
    const list = [
        'item1',
        'item2',
        'item3'
    ];

    const fieldName = 'Mylist';
    const dropped = `${fieldName}[${1}]`;

    it('should place item2 before item1', () => {
        let result = onListReorder(list, dropped, 0, fieldName);
        expect(result[0]).toBe('item2');
    });

    it('should place item2 after item3', () => {
        let result = onListReorder(list, dropped, 2, fieldName);
        expect(result[2]).toBe('item2');
    });
});
