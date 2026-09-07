import i18next from 'i18next';
import en from '../../../../../../main/resources/javascript/locales/en.json';
import fr from '../../../../../../main/resources/javascript/locales/fr.json';
import {errorTranslationOptions} from './field.utils';

/**
 * What the reader actually ends up seeing, as opposed to which options were passed.
 *
 * Field.spec covers the wiring -- that the component hands these options to t(). This covers the
 * behaviour they exist for, by translating through the shipped locale bundles with a real
 * i18next: the errors here carry text jContent did not write, and i18next escapes interpolated
 * values by default, so an apostrophe in a constraint message reached the screen as "&#39;"
 * (jcontent#2748). Both halves are needed. The wiring test alone would still pass if i18next
 * changed what the option means; this one alone would still pass if the component stopped
 * passing it.
 *
 * react-i18next is mocked project-wide (see @jahia/test-framework's jestConfig.moduleNameMapper),
 * which is why this drives i18next directly rather than rendering the component.
 */
describe('error message translation', () => {
    const ERRORS = 'jcontent:label.contentEditor.edit.errors';
    const field = {name: 'youtubeId', displayName: 'Youtube ID'};

    let t;
    let i18n;
    beforeAll(async () => {
        i18n = i18next.createInstance();
        await i18n.init({
            lng: 'en',
            fallbackLng: 'en',
            resources: {en: {jcontent: en}, fr: {jcontent: fr}}
        });
        t = (key, options) => i18n.t(key, options);
    });

    const translateError = (key, ...args) => t(`${ERRORS}.${key}`, errorTranslationOptions(field, args));

    it('should keep an apostrophe in a constraint message as an apostrophe', () => {
        // The exact message from the ticket: a French constraint.error.message.
        expect(translateError('constraintViolation', 'L\'entrée est invalide'))
            .toBe('L\'entrée est invalide');
    });

    it('should not turn any of the escaped characters into entities', () => {
        // Every character i18next escapes -- & < > " ' and / -- is legitimate in a message
        // somebody wrote in a resource bundle.
        const message = 'Use & < > " \' / freely';
        expect(translateError('constraintViolation', message)).toBe(message);
    });

    it('should keep a link in the broken-link message readable', () => {
        // The broken-link message interpolates a path the server supplied, so it was the worse
        // case of the two: slashes became &#x2F; and a query separator became &amp;.
        expect(translateError('invalidLink', '/sites/luxe/home?a=1&b=2'))
            .toBe('The link /sites/luxe/home?a=1&b=2 is broken');
    });

    it('should leave a message untouched in every shipped language', () => {
        // The locale files each carry their own copy of these keys, so the guarantee has to hold
        // per language rather than just for the one that happens to be loaded.
        const message = 'L\'entrée est invalide';
        ['en', 'fr'].forEach(language => {
            const translated = i18n.getFixedT(language, 'jcontent')(
                'label.contentEditor.edit.errors.constraintViolation',
                errorTranslationOptions(field, [message])
            );
            expect(translated).toBe(message);
        });
    });
});
