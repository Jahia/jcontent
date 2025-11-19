import {truncate, truncateMiddle} from './truncate';

describe('truncate', () => {
    it('should truncate string length greater than threshold', () => {
        expect(truncate('Florent', 2)).toBe('Fl...');
    });

    it('should not truncate string length smaller than or equals to threshold', () => {
        expect(truncate('Florent', 100)).toBe('Florent');
    });
});
