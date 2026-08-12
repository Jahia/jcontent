import {hasAccentedCharacters, buildAccentVariants, buildTitleSearchConstraint} from './ContentTreeSearch.utils';

describe('hasAccentedCharacters', () => {
    it('should return false for a plain unaccented term', () => {
        expect(hasAccentedCharacters('cafe')).toBe(false);
    });

    it('should return true when the term contains an accented character', () => {
        expect(hasAccentedCharacters('café')).toBe(true);
    });
});

describe('buildAccentVariants', () => {
    it('should return every plausible accented spelling of an unaccented term', () => {
        expect(buildAccentVariants('ce')).toEqual(['ce', 'cé', 'cè', 'cê', 'cë', 'çe', 'çé', 'çè', 'çê', 'çë']);
    });

    it('should lower-case the term before generating variants', () => {
        expect(buildAccentVariants('CE')).toEqual(expect.arrayContaining(['ce', 'cé']));
    });

    it('should return the term as-is when it has no accentable letters', () => {
        expect(buildAccentVariants('xyz')).toEqual(['xyz']);
    });

    it('should fall back to the plain lower-cased term when the combination count is too large', () => {
        expect(buildAccentVariants('aeiouaeiou')).toEqual(['aeiouaeiou']);
    });
});

describe('buildTitleSearchConstraint', () => {
    it('should build a single exact-match constraint when the term already has an accent', () => {
        expect(buildTitleSearchConstraint('café')).toEqual({
            any: [
                {like: '%café%', property: 'jcr:title', function: 'LOWER_CASE'}
            ]
        });
    });

    it('should build an any-list of every accented variant when the term is unaccented', () => {
        const constraint = buildTitleSearchConstraint('ce');

        expect(constraint.any).toEqual(expect.arrayContaining([
            {like: '%ce%', property: 'jcr:title', function: 'LOWER_CASE'},
            {like: '%cé%', property: 'jcr:title', function: 'LOWER_CASE'}
        ]));
        expect(constraint.any).toHaveLength(10);
    });
});
