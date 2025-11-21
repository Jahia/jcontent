import {truncate, truncateMiddle} from './truncate';

describe('truncate', () => {
    it('should truncate string length greater than threshold', () => {
        expect(truncate('Florent', 2)).toBe('Fl...');
    });

    it('should not truncate string length smaller than or equals to threshold', () => {
        expect(truncate('Florent', 100)).toBe('Florent');
    });
});

describe('truncateMiddle', () => {
    it('should not truncate if string is within limit', () => {
        expect(truncateMiddle('short', 10)).toBe('short');
        expect(truncateMiddle('application/word', 25))
            .toBe('application/word');
    });

    it('should truncate in the middle for long string, prioritizing back chars', () => {
        // Available=4, back=3 (60%), front=1 (40%)
        expect(truncateMiddle('abcdefghij', 7)).toBe('a...hij');
    });

    it('should keep front context if possible', () => {
        // Available=22, back=14 (60%), backContext=4; include front context since in between
        expect(truncateMiddle('application/vnd.openxmlformats-officedocument.word', 25))
            .toBe('application/...ument.word');
    });

    it('should keep back context', () => {
        // Available=22, back=14 (60%), backContext=4; include front context since in between
        expect(truncateMiddle('application/word', 14))
            .toBe('appl...on/word');
    });

    it('should handle string with no slash, prioritizing back chars', () => {
        // MaxLength=6, ellipsis=3, available=3, back=2 (60%), front=1 (40%)
        expect(truncateMiddle('abcdefghij', 6)).toBe('a...ij');
    });

    it('should handle very small maxLength', () => {
        expect(truncateMiddle('abcdefghij', 3)).toBe('abc...');
        expect(truncateMiddle('abcdefghij', 2)).toBe('ab...');
    });

    it('should handle empty string', () => {
        expect(truncateMiddle('', 5)).toBe('');
    });
});
