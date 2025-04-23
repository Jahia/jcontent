import {onListReorder} from './dragAndDrop.utils';

describe('onListReorder', () => {
    const list = [
        'item1',
        'item2',
        'item3'
    ];

    const dropped = 'item2';

    it('should place item2 before item1', () => {
        let result = onListReorder(list, dropped, 0);
        expect(result[0]).toBe('item2');
    });

    it('should place item2 after item3', () => {
        let result = onListReorder(list, dropped, 2);
        expect(result[2]).toBe('item2');
    });

    it('should work with items names', () => {
        const list = [
            {value: 1, name: 'item1'},
            {value: 2, name: 'item2'},
            {value: 3, name: 'item3'}
        ];

        const dropped = 'item2';
        let result = onListReorder(list, dropped, 2);
        expect(result[2].value).toBe(2);
    });
});
