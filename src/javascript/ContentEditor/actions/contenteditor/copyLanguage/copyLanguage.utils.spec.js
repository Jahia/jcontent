import {getI18nFieldAndValues} from './copyLanguage.utils';
import {adaptSections} from '~/ContentEditor/ContentEditor/adaptSections';
import {getInitialValues} from '~/ContentEditor/ContentEditor/useEditFormDefinition';

jest.mock('~/ContentEditor/ContentEditor/adaptSections', () => ({adaptSections: jest.fn()}));
jest.mock('~/ContentEditor/ContentEditor/useEditFormDefinition', () => ({getInitialValues: jest.fn()}));

describe('getI18nFieldAndValues', () => {
    const declaringNodeType = {name: 'jnt:secretHolder'};
    const titleField = {nodeType: 'jnt:secretHolder', name: 'jnt:secretHolder_title', propertyName: 'title', i18n: true};
    const secretField = {
        nodeType: 'jnt:secretHolder',
        name: 'jnt:secretHolder_secret',
        propertyName: 'secret',
        i18n: true,
        selectorOptions: [{name: 'password'}]
    };
    const sharedField = {nodeType: 'jnt:secretHolder', name: 'jnt:secretHolder_shared', propertyName: 'shared', i18n: false};

    const copy = secret => {
        adaptSections.mockReturnValue([{fieldSets: [{fields: [titleField, secretField, sharedField]}]}]);
        getInitialValues.mockReturnValue({
            [titleField.name]: 'title',
            [secretField.name]: secret.decryptedValue,
            [sharedField.name]: 'shared'
        });
        const result = {properties: [{name: 'secret', ...secret, definition: {declaringNodeType}}]};
        return getI18nFieldAndValues({data: {forms: {editForm: {}}, jcr: {result}}});
    };

    it('copies the internationalized fields', () => {
        expect(copy({value: 'cipher', decryptedValue: 'clear'})).toEqual({
            [titleField.name]: 'title',
            [secretField.name]: 'clear'
        });
    });

    it('leaves out a password field whose stored value the form cannot read', () => {
        expect(copy({value: 'cipher', decryptedValue: null})).toEqual({[titleField.name]: 'title'});
    });
});
