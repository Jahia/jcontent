import {getBestSourceLanguage, getBestTargetLanguage} from './translateLanguages';

// Check the rules stated in https://github.com/Jahia/jcontent/issues/2484

// Scenario 1: "Advanced edit in a language, then switch to translate".
describe('getBestSourceLanguage', () => {
    it('picks the first translated language alphabetically when the default is the target', () => {
        expect(getBestSourceLanguage('en', ['de', 'en', 'fr'], 'en')).toBe('de');
    });

    it('prefers the default language when it is translated and not the target', () => {
        expect(getBestSourceLanguage('fr', ['de', 'en', 'fr'], 'en')).toBe('en');
    });

    it('ignores the default language when it has no translation', () => {
        expect(getBestSourceLanguage('fr', ['de', 'fr'], 'en')).toBe('de');
    });

    it('only considers languages that have an existing translation', () => {
        expect(getBestSourceLanguage('en', ['en', 'fr'], 'en')).toBe('fr');
    });

    it('falls back to the target language when nothing else is translated', () => {
        expect(getBestSourceLanguage('en', ['en'], 'en')).toBe('en');
    });

    it('falls back to the target language when the site default is unknown (incomplete data)', () => {
        expect(getBestSourceLanguage('en', ['de', 'en', 'fr'], undefined)).toBe('en');
    });

    it('is resilient to an empty translation list', () => {
        expect(getBestSourceLanguage('en', [], 'en')).toBe('en');
    });
});

// Scenario 2: "Right click > Translate to".
describe('getBestTargetLanguage', () => {
    it('returns the first untranslated active language alphabetically, excluding the source', () => {
        expect(getBestTargetLanguage('en', ['en'], ['de', 'en', 'fr'])).toBe('de');
    });

    it('skips languages that already have a translation', () => {
        expect(getBestTargetLanguage('en', ['de', 'en'], ['de', 'en', 'fr'])).toBe('fr');
    });

    it('picks the first non default language when the node is fully translated', () => {
        expect(getBestTargetLanguage('de', ['de', 'en', 'fr'], ['de', 'en', 'fr'])).toBe('en');
    });

    it('falls back to the source language when it is the only active one', () => {
        expect(getBestTargetLanguage('en', ['en'], ['en'])).toBe('en');
    });

    it('is resilient to an empty active-languages list', () => {
        expect(getBestTargetLanguage('en', [], [])).toBe('en');
    });
});
