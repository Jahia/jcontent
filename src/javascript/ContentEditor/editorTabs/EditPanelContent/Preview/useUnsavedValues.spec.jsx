import React from 'react';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {useFormikContext} from 'formik';
import {useQuery} from '@apollo/client';
import {getDataToMutate} from '~/ContentEditor/utils';
import {buildUnsavedValues, useUnsavedValues} from './useUnsavedValues';

jest.mock('formik', () => ({useFormikContext: jest.fn()}));
jest.mock('@apollo/client', () => ({useQuery: jest.fn()}));
jest.mock('~/ContentEditor/utils', () => ({getDataToMutate: jest.fn()}));
jest.mock('~/JContent/preview/useContentPreview', () => ({UNSAVED_VALUES_CONTEXT: {headers: {'X-Jahia-Unsaved-Values': 'true'}}}));
jest.mock('~/ContentEditor/contexts', () => ({
    useContentEditorContext: () => ({nodeData: {uuid: 'node-uuid'}, lang: 'en', i18nContext: {}}),
    useContentEditorSectionContext: () => ({sections: []})
}));

const text = {name: 'text', type: 'STRING', value: 'typed', language: 'en'};

const Probe = () => {
    const result = useUnsavedValues();
    return <div data-supported={String(result.isSupported)} data-values={JSON.stringify(result.unsavedValues)}/>;
};

describe('buildUnsavedValues', () => {
    it('sends the properties and the mixins of the save, without the system name', () => {
        getDataToMutate.mockReturnValue({
            propsToSave: [text, {name: 'ce:systemName', type: 'STRING', value: 'renamed', language: 'en'}],
            propsToDelete: [{name: 'jcr:title', language: 'en'}],
            mixinsToAdd: ['jmix:keywords'],
            mixinsToDelete: []
        });

        expect(buildUnsavedValues({nodeData: {uuid: 'node-uuid'}, values: {}, i18nContext: {}, sections: [], lang: 'en'})).toEqual({
            node: 'node-uuid',
            properties: [text],
            propertiesToDelete: [{name: 'jcr:title', language: 'en'}],
            mixinsToAdd: ['jmix:keywords'],
            mixinsToDelete: []
        });
    });

    it('sends nothing when the form changes only the system name', () => {
        getDataToMutate.mockReturnValue({
            propsToSave: [{name: 'ce:systemName', type: 'STRING', value: 'renamed', language: 'en'}],
            propsToDelete: []
        });

        expect(buildUnsavedValues({nodeData: {uuid: 'node-uuid'}, values: {}, i18nContext: {}, sections: [], lang: 'en'})).toBeNull();
    });
});

describe('useUnsavedValues', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        getDataToMutate.mockReturnValue({propsToSave: [text], propsToDelete: [], mixinsToAdd: [], mixinsToDelete: []});
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('follows a dirty form once the editor stops typing', () => {
        useQuery.mockReturnValue({data: {jcr: {workspace: 'EDIT'}}});
        useFormikContext.mockReturnValue({dirty: true, values: {text: 'typed'}});
        const cmp = mount(<Probe/>);
        expect(cmp.find('div').prop('data-values')).toBe('null');

        act(() => {
            jest.advanceTimersByTime(500);
        });
        cmp.update();
        expect(cmp.find('div').prop('data-supported')).toBe('true');
        expect(JSON.parse(cmp.find('div').prop('data-values'))).toEqual({
            node: 'node-uuid',
            properties: [text],
            propertiesToDelete: [],
            mixinsToAdd: [],
            mixinsToDelete: []
        });
    });

    it('asks the server about the node of the form, in a request of its own', () => {
        useQuery.mockReturnValue({data: {jcr: {workspace: 'EDIT'}}});
        useFormikContext.mockReturnValue({dirty: false, values: {}});
        mount(<Probe/>);
        const options = useQuery.mock.calls.at(-1)[1];
        expect(options.variables).toEqual({node: 'node-uuid'});
        expect(options.context.headers).toEqual({'X-Jahia-Unsaved-Values': 'true'});
    });

    it('sends nothing to a server that refuses unsaved values', () => {
        useQuery.mockReturnValue({data: undefined, error: new Error('Reading unsaved values needs a Jahia that supports them')});
        useFormikContext.mockReturnValue({dirty: true, values: {text: 'typed'}});
        const cmp = mount(<Probe/>);

        act(() => {
            jest.advanceTimersByTime(500);
        });
        cmp.update();
        expect(cmp.find('div').prop('data-supported')).toBe('false');
        expect(cmp.find('div').prop('data-values')).toBe('null');
    });

    it('sends nothing for a form with no change', () => {
        useQuery.mockReturnValue({data: {jcr: {workspace: 'EDIT'}}});
        useFormikContext.mockReturnValue({dirty: false, values: {text: 'live'}});
        const cmp = mount(<Probe/>);

        act(() => {
            jest.advanceTimersByTime(500);
        });
        cmp.update();
        expect(cmp.find('div').prop('data-values')).toBe('null');
    });
});
