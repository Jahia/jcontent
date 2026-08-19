import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {mutate, useQuery} from '@apollo/client';
import {EditFieldAllLanguagesModal} from './EditFieldAllLanguagesModal';

jest.mock('@apollo/client', () => {
    const mutate = jest.fn(() => Promise.resolve({}));

    return {
        mutate,
        useQuery: jest.fn(),
        useApolloClient: () => ({mutate, cache: {flushNodeEntryById: jest.fn()}})
    };
});
// The shared react-i18next mock returns the key and drops interpolation, so a label built from a
// template cannot be asserted - interpolate here the way i18next itself would.
jest.mock('react-i18next', () => {
    const templates = {
        'jcontent:label.contentEditor.edit.action.editAllLanguages.fieldOptionLabel': '{{fieldName}} ({{filled}}/{{total}})'
    };

    return {
        useTranslation: () => ({
            t: (key, params) => Object.entries(params || {}).reduce(
                (result, [name, value]) => result.split('{{' + name + '}}').join(value),
                templates[key] || key
            )
        })
    };
});
jest.mock('@jahia/react-material', () => ({useNotifications: () => ({notify: jest.fn()})}));
// Named so the rows can be found in the shallow tree, without pulling in the real field renderer.
jest.mock('./LanguageFieldRow', () => {
    const LanguageFieldRow = () => '';

    return {LanguageFieldRow};
});
// Value adaptation needs the selector-type registry, which is irrelevant to field navigation.
jest.mock('./editFieldAllLanguages.utils', () => ({
    adaptRowValue: (field, languageValue) => languageValue?.repositoryValue,
    hasValue: (field, value) => Boolean(value),
    hasValueChanged: (field, originalValue, currentValue) => originalValue !== currentValue,
    buildPropertyMutation: (field, language, value) => (value ?
        {toSave: {name: field.propertyName, language, value}} :
        {toDelete: {name: field.propertyName, language}})
}));

describe('EditFieldAllLanguagesModal field navigation', () => {
    let defaultProps;
    let filledLanguagesData;
    let queriedDocuments;
    let repositoryValues;

    const field = name => ({name, propertyName: name, displayName: name, i18n: true, multiple: false});

    beforeEach(() => {
        queriedDocuments = {};
        mutate.mockClear();
        repositoryValues = [
            {language: 'en', repositoryValue: '', values: [], readOnly: false},
            {language: 'fr', repositoryValue: '', values: [], readOnly: false}
        ];
        // 'summary' is filled in both languages, 'title' in one, 'teaser' in none.
        filledLanguagesData = {
            jcr: {
                nodeById: {
                    uuid: '12345-321456-1234565789',
                    l0: [{name: 'title'}, {name: 'summary'}],
                    l1: [{name: 'summary'}]
                }
            }
        };

        useQuery.mockImplementation(query => {
            queriedDocuments[query.definitions[0].name.value] = query;
            return query.definitions[0].name.value === 'fieldsFilledLanguages' ?
                {data: filledLanguagesData, loading: false, error: undefined} :
                {
                    data: {forms: {fieldValuesByLanguage: repositoryValues}},
                    loading: false,
                    error: undefined
                };
        });

        defaultProps = {
            field: field('title'),
            // 'shared' is not i18n: the dropdown lists it as disabled, so the arrows must step over it
            fields: [field('title'), field('summary'), {...field('shared'), i18n: false}, field('teaser')],
            uuid: '12345-321456-1234565789',
            languages: [{language: 'en'}, {language: 'fr'}],
            editorContext: {
                lang: 'en',
                nodeData: {
                    uuid: '12345-321456-1234565789',
                    displayName: 'My page',
                    primaryNodeType: {displayName: 'Page'},
                    translationLanguages: ['en', 'fr']
                }
            },
            onSaved: jest.fn(),
            onClose: jest.fn()
        };
    });

    const build = () => shallowWithTheme(<EditFieldAllLanguagesModal {...defaultProps}/>, {}, dsGenericTheme);
    const selectedField = cmp => cmp.find('[data-sel-role="edit-all-languages-field-switcher"]').props().value;
    const previous = cmp => cmp.find('[data-sel-role="edit-all-languages-previous-field"]');
    const next = cmp => cmp.find('[data-sel-role="edit-all-languages-next-field"]');

    it('renders an arrow on each side of the field switcher', () => {
        const cmp = build();

        expect(previous(cmp).exists()).toBe(true);
        expect(next(cmp).exists()).toBe(true);
    });

    it('disables the previous arrow on the first field', () => {
        const cmp = build();

        expect(previous(cmp).props().isDisabled).toBe(true);
        expect(next(cmp).props().isDisabled).toBe(false);
    });

    it('moves to the next field', () => {
        const cmp = build();

        next(cmp).props().onClick();
        cmp.update();

        expect(selectedField(cmp)).toBe('summary');
    });

    it('steps over fields that are not translatable', () => {
        defaultProps.field = field('summary');
        const cmp = build();

        next(cmp).props().onClick();
        cmp.update();

        expect(selectedField(cmp)).toBe('teaser');
    });

    it('moves back to the previous field', () => {
        defaultProps.field = field('teaser');
        const cmp = build();

        previous(cmp).props().onClick();
        cmp.update();

        expect(selectedField(cmp)).toBe('summary');
    });

    it('disables the next arrow on the last field', () => {
        defaultProps.field = field('teaser');
        const cmp = build();

        expect(next(cmp).props().isDisabled).toBe(true);
        expect(previous(cmp).props().isDisabled).toBe(false);
    });

    const optionLabel = (cmp, name) => cmp.find('[data-sel-role="edit-all-languages-field-switcher"]')
        .props().data.find(option => option.value === name).label;

    it('annotates each translatable field with the number of languages already filled', () => {
        const cmp = build();

        expect(optionLabel(cmp, 'summary')).toBe('summary (2/2)');
        expect(optionLabel(cmp, 'teaser')).toBe('teaser (0/2)');
    });

    it('leaves fields that are not translatable without a count', () => {
        const cmp = build();

        expect(optionLabel(cmp, 'shared')).toBe('shared');
    });

    it('uses the live count for the active field rather than the repository one', () => {
        const cmp = build();

        // The repository says 'title' is filled in one language; the mounted rows say none yet.
        expect(optionLabel(cmp, 'title')).toBe('title (0/2)');

        cmp.find('LanguageFieldRow').at(0).props().onValueChange('a value typed in this modal');
        cmp.update();

        expect(optionLabel(cmp, 'title')).toBe('title (1/2)');
    });

    it('only queries languages the node actually has a translation for', () => {
        defaultProps.languages = [{language: 'en'}, {language: 'fr'}, {language: 'de'}];
        defaultProps.editorContext.nodeData.translationLanguages = ['en', 'fr'];
        build();

        const document = queriedDocuments.fieldsFilledLanguages.loc.source.body;

        expect(document).toContain('language: "en"');
        expect(document).toContain('language: "fr"');
        expect(document).not.toContain('language: "de"');
    });

    it('counts against every site language, not only the translated ones', () => {
        defaultProps.languages = [{language: 'en'}, {language: 'fr'}, {language: 'de'}];
        defaultProps.editorContext.nodeData.translationLanguages = ['en', 'fr'];
        const cmp = build();

        expect(optionLabel(cmp, 'summary')).toBe('summary (2/3)');
    });

    // Rows are shallow-rendered, so the modal never receives their Formik handle. Hand it one that
    // reports what the user "typed", the same way a mounted row would.
    const typeInRows = (cmp, valuesByLanguage) => {
        cmp.find('LanguageFieldRow').forEach(row => {
            const {field: rowField, language} = row.props();
            row.getElement().ref({
                values: {[rowField.name]: valuesByLanguage[language.language]},
                setFieldValue: jest.fn()
            });
        });
    };

    const save = cmp => cmp.find('[data-sel-role="edit-all-languages-save"]').props().onClick();
    const rowFor = (cmp, languageCode) => cmp.find('LanguageFieldRow')
        .filterWhere(row => row.props().language.language === languageCode);

    it('saves edits made to a field before switching to another one', async () => {
        const cmp = build();

        typeInRows(cmp, {en: 'english title', fr: ''});
        next(cmp).props().onClick();
        cmp.update();

        typeInRows(cmp, {en: 'english summary', fr: ''});
        await save(cmp);

        const {propertiesToSave} = mutate.mock.calls[0][0].variables;

        expect(propertiesToSave).toEqual([
            {name: 'title', language: 'en', value: 'english title'},
            {name: 'summary', language: 'en', value: 'english summary'}
        ]);
    });

    it('keeps edits from more than one earlier field', async () => {
        const cmp = build();

        typeInRows(cmp, {en: 'a', fr: ''});
        next(cmp).props().onClick();
        cmp.update();

        typeInRows(cmp, {en: 'b', fr: ''});
        next(cmp).props().onClick();
        cmp.update();

        typeInRows(cmp, {en: 'c', fr: ''});
        await save(cmp);

        const {propertiesToSave} = mutate.mock.calls[0][0].variables;

        expect(propertiesToSave.map(property => property.name)).toEqual(['title', 'summary', 'teaser']);
    });

    it('shows again what was typed when coming back to a field', () => {
        const cmp = build();

        typeInRows(cmp, {en: 'english title', fr: ''});
        next(cmp).props().onClick();
        cmp.update();
        previous(cmp).props().onClick();
        cmp.update();

        expect(rowFor(cmp, 'en').props().value).toBe('english title');
        // ...while the mandatory-cleared warning still compares against what the repository holds.
        expect(rowFor(cmp, 'en').props().originalValue).toBe('');
    });

    it('forgets an edit that was undone before leaving the field', async () => {
        const cmp = build();

        typeInRows(cmp, {en: 'english title', fr: ''});
        next(cmp).props().onClick();
        cmp.update();
        previous(cmp).props().onClick();
        cmp.update();

        // Back to exactly what the repository holds.
        typeInRows(cmp, {en: '', fr: ''});
        next(cmp).props().onClick();
        cmp.update();

        typeInRows(cmp, {en: '', fr: ''});
        await save(cmp);

        expect(mutate).not.toHaveBeenCalled();
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('reflects every saved field back onto the editor form', async () => {
        const cmp = build();

        typeInRows(cmp, {en: 'english title', fr: ''});
        next(cmp).props().onClick();
        cmp.update();

        typeInRows(cmp, {en: 'english summary', fr: ''});
        await save(cmp);

        expect(defaultProps.onSaved.mock.calls.map(call => call[0].name)).toEqual(['title', 'summary']);
    });
});
