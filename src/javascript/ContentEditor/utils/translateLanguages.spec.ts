import {getFirstOtherLanguage, getTranslateSourceLanguage} from './translateLanguages';

// "First in alphabetical order" throughout means first by language *code* (e.g. 'de' < 'en' < 'fr'),
// which is what the existing translate-action Cypress assertions and the issue #2484 preview expect
// (source defaults to 'de' on an en/fr/de site).

describe('translateLanguages', () => {
    describe('getTranslateSourceLanguage (switch edit -> translate)', () => {
        it('picks the first translated language alphabetically when the default is the target', () => {
            // Editing in EN (default); FR and DE are also translated => DE (first by code, EN is the target)
            expect(getTranslateSourceLanguage({
                languages: ['de', 'en', 'fr'],
                translationLanguages: ['de', 'en', 'fr'],
                defaultLanguage: 'en',
                targetLanguage: 'en'
            })).toBe('de');
        });

        it('prefers the default language when it is an eligible candidate', () => {
            // Editing in FR; EN (default) and DE are translated => EN (default wins over alphabetical DE)
            expect(getTranslateSourceLanguage({
                languages: ['de', 'en', 'fr'],
                translationLanguages: ['de', 'en', 'fr'],
                defaultLanguage: 'en',
                targetLanguage: 'fr'
            })).toBe('en');
        });

        it('ignores languages that have no existing translation', () => {
            // Only FR is translated besides the target EN => FR, even though DE sorts first
            expect(getTranslateSourceLanguage({
                languages: ['de', 'en', 'fr'],
                translationLanguages: ['en', 'fr'],
                defaultLanguage: 'en',
                targetLanguage: 'en'
            })).toBe('fr');
        });

        it('ignores languages that are not active in edit', () => {
            // ES is translated but not active in edit => falls back to FR
            expect(getTranslateSourceLanguage({
                languages: ['en', 'fr'],
                translationLanguages: ['en', 'fr', 'es'],
                defaultLanguage: 'en',
                targetLanguage: 'en'
            })).toBe('fr');
        });

        it('falls back to the target language when no other language is translated', () => {
            expect(getTranslateSourceLanguage({
                languages: ['de', 'en', 'fr'],
                translationLanguages: ['en'],
                defaultLanguage: 'en',
                targetLanguage: 'en'
            })).toBe('en');
        });

        it('is resilient to missing inputs', () => {
            expect(getTranslateSourceLanguage({targetLanguage: 'en'})).toBe('en');
        });
    });

    describe('getFirstOtherLanguage (right-click Translate action)', () => {
        it('returns the first active language alphabetically that differs from the current one', () => {
            // Current EN, active EN/FR/DE => DE (first by code, != EN)
            expect(getFirstOtherLanguage({
                languages: ['en', 'fr', 'de'],
                currentLanguage: 'en'
            })).toBe('de');
        });

        it('skips the current language even when it sorts first', () => {
            expect(getFirstOtherLanguage({
                languages: ['de', 'en', 'fr'],
                currentLanguage: 'de'
            })).toBe('en');
        });

        it('falls back to the current language when it is the only one', () => {
            expect(getFirstOtherLanguage({
                languages: ['en'],
                currentLanguage: 'en'
            })).toBe('en');
        });

        it('is resilient to missing inputs', () => {
            expect(getFirstOtherLanguage({currentLanguage: 'en'})).toBe('en');
        });
    });
});
