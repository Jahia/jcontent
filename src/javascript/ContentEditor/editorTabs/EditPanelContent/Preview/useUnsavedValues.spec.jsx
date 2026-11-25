import React from 'react';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {useFormikContext} from 'formik';
import {useQuery} from '@apollo/client';
import {getChildrenOrder, getDataToMutate} from '~/ContentEditor/utils';
import {readUnsavedValues, useUnsavedValues} from './useUnsavedValues';

jest.mock('formik', () => ({useFormikContext: jest.fn()}));
jest.mock('@apollo/client', () => ({useQuery: jest.fn()}));
jest.mock('~/ContentEditor/utils', () => ({
    getDataToMutate: jest.fn(),
    getChildrenOrder: jest.fn(),
    encodeSystemName: jest.requireActual('~/ContentEditor/utils/systemName.utils').encodeSystemName
}));
jest.mock('~/JContent/preview/useContentPreview', () => ({UNSAVED_VALUES_SUPPORT_CONTEXT: {headers: {'X-Jahia-Unsaved-Values': 'support'}}}));
const mockNodeData = {uuid: 'node-uuid', name: 'a%5Bb%5D', primaryNodeType: {name: 'jnt:text'}, properties: [{name: 'jcr:title'}]};
jest.mock('~/ContentEditor/contexts', () => ({
    useContentEditorContext: () => ({nodeData: mockNodeData, lang: 'en', i18nContext: {}}),
    useContentEditorSectionContext: () => ({sections: []})
}));

const text = {name: 'text', type: 'STRING', value: 'typed', language: 'en'};
const systemName = {name: 'ce:systemName', type: 'STRING', value: 'renamed', language: 'en'};
const form = {nodeData: mockNodeData, values: {}, i18nContext: {}, sections: [], lang: 'en'};

const Probe = () => {
    const result = useUnsavedValues();
    return <div data-supported={String(result.isSupported)} data-partial={String(result.isPartial)} data-values={JSON.stringify(result.unsavedValues)}/>;
};

const valuesOf = cmp => JSON.parse(cmp.find('div').prop('data-values'));

const wait = cmp => {
    act(() => {
        jest.advanceTimersByTime(500);
    });
    cmp.update();
};

describe('readUnsavedValues', () => {
    beforeEach(() => {
        getChildrenOrder.mockReturnValue({shouldModifyChildren: false});
    });

    it('sends the properties and the mixins of the save, without the system name', () => {
        getDataToMutate.mockReturnValue({
            propsToSave: [text, systemName],
            propsToDelete: [{name: 'jcr:title', language: 'en'}],
            mixinsToAdd: ['jmix:keywords'],
            mixinsToDelete: []
        });

        expect(readUnsavedValues(form).unsavedValues).toEqual({
            node: 'node-uuid',
            properties: [text],
            propertiesToDelete: [{name: 'jcr:title', language: 'en'}],
            mixinsToAdd: ['jmix:keywords'],
            mixinsToDelete: []
        });
    });

    it('leaves out the removal of a property that the node does not store', () => {
        getDataToMutate.mockReturnValue({propsToSave: [systemName], propsToDelete: [{name: 'jcr:description', language: 'en'}]});

        expect(readUnsavedValues(form).unsavedValues).toBeNull();
    });

    it('tells that a new system name or a new order of the children stays out of the preview', () => {
        getDataToMutate.mockReturnValue({propsToSave: [systemName], propsToDelete: []});
        expect(readUnsavedValues(form).isPartial).toBe(true);

        getDataToMutate.mockReturnValue({propsToSave: [text], propsToDelete: []});
        expect(readUnsavedValues(form).isPartial).toBe(false);
        // An editable system name field sends the decoded name, and the save encodes it before it compares.
        getDataToMutate.mockReturnValue({propsToSave: [text, {...systemName, value: 'a[b]'}], propsToDelete: []});
        expect(readUnsavedValues(form).isPartial).toBe(false);
        getChildrenOrder.mockReturnValue({shouldModifyChildren: true});
        expect(readUnsavedValues(form).isPartial).toBe(true);
    });
});

describe('useUnsavedValues', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        getChildrenOrder.mockReturnValue({shouldModifyChildren: false});
        getDataToMutate.mockImplementation(({formValues}) => ({
            propsToSave: [{...text, value: formValues.text}],
            propsToDelete: [],
            mixinsToAdd: [],
            mixinsToDelete: []
        }));
        useQuery.mockReturnValue({data: {jcr: {workspace: 'EDIT'}}});
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('follows the values of a dirty form once the editor stops typing', () => {
        useFormikContext.mockReturnValue({dirty: true, values: {text: 'typed'}});
        const cmp = mount(<Probe/>);
        expect(valuesOf(cmp)).toBeNull();

        wait(cmp);
        expect(getDataToMutate).toHaveBeenCalledWith(expect.objectContaining({formValues: {text: 'typed'}, nodeData: mockNodeData, lang: 'en'}));
        expect(cmp.find('div').prop('data-supported')).toBe('true');
        expect(valuesOf(cmp).properties[0].value).toBe('typed');
    });

    it('restarts the delay at each change and sends the last values', () => {
        useFormikContext.mockReturnValue({dirty: true, values: {text: 'ty'}});
        const cmp = mount(<Probe/>);
        act(() => {
            jest.advanceTimersByTime(300);
        });
        useFormikContext.mockReturnValue({dirty: true, values: {text: 'typed'}});
        cmp.setProps({});
        act(() => {
            jest.advanceTimersByTime(300);
        });
        cmp.update();
        expect(valuesOf(cmp)).toBeNull();

        wait(cmp);
        expect(valuesOf(cmp).properties[0].value).toBe('typed');
    });

    it('clears the values when the form becomes clean', () => {
        useFormikContext.mockReturnValue({dirty: true, values: {text: 'typed'}});
        const cmp = mount(<Probe/>);
        wait(cmp);
        expect(valuesOf(cmp)).not.toBeNull();

        useFormikContext.mockReturnValue({dirty: false, values: {text: 'typed'}});
        cmp.setProps({});
        cmp.update();
        expect(valuesOf(cmp)).toBeNull();
    });

    it('tells that the preview shows a new system name only on save', () => {
        getDataToMutate.mockReturnValue({propsToSave: [systemName], propsToDelete: []});
        useFormikContext.mockReturnValue({dirty: true, values: {}});
        const cmp = mount(<Probe/>);

        wait(cmp);
        expect(cmp.find('div').prop('data-partial')).toBe('true');
        expect(valuesOf(cmp)).toBeNull();
    });

    it('asks the server about the node of the form, in a request of its own', () => {
        useFormikContext.mockReturnValue({dirty: false, values: {}});
        mount(<Probe/>);
        const options = useQuery.mock.calls.at(-1)[1];
        expect(options.variables).toEqual({node: 'node-uuid'});
        expect(options.context.headers).toEqual({'X-Jahia-Unsaved-Values': 'support'});
    });

    it('sends nothing to a server that refuses unsaved values', () => {
        useQuery.mockReturnValue({data: undefined, error: new Error('Reading unsaved values needs Jahia 8.2.4 or later')});
        useFormikContext.mockReturnValue({dirty: true, values: {text: 'typed'}});
        const cmp = mount(<Probe/>);

        wait(cmp);
        expect(cmp.find('div').prop('data-supported')).toBe('false');
        expect(valuesOf(cmp)).toBeNull();
    });
});
