import {onListIndexReorder} from '~/ContentEditor/utils/useReorderList';

describe('onListIndexReorder', () => {
    const list = [
        'item1',
        'item2',
        'item3'
    ];

    it('should rearrange', () => {
        let result = onListIndexReorder(list, 0, 1);
        expect(result).toEqual(['item2', 'item1', 'item3']);
    });
});
