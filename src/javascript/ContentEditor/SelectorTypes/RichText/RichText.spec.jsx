import React from 'react';
import {shallow} from '@jahia/test-framework';

import {RichText} from './RichText';
import {setQueryResult} from '@apollo/client';

jest.mock('@apollo/client', () => {
    let queryResultmock;
    return {
        useQuery: jest.fn(() => {
            return {data: queryResultmock, error: null, loading: false};
        }),
        setQueryResult: r => {
            queryResultmock = r;
        }
    };
});

let mockI18nContext;
jest.mock('~/ContentEditor/contexts', () => {
    const actual = jest.requireActual('~/ContentEditor/contexts');
    return {
        ...actual,
        useContentEditorContext: () => ({...actual.useContentEditorContext(), i18nContext: mockI18nContext})
    };
});

jest.mock('react', () => {
    return {
        ...jest.requireActual('react'),
        useEffect: cb => cb()
    };
});

const RICH_TEXT_COMPONENT_TAG = 'CKEditor';

describe('RichText component', () => {
    let props;

    beforeEach(() => {
        mockI18nContext = undefined;
        props = {
            id: 'richID',
            value: 'initial value',
            field: {
                name: 'x',
                displayName: 'x',
                readOnly: false,
                selectorType: 'RichText',
                selectorOptions: []
            },
            onChange: jest.fn()
        };

        setQueryResult({
            forms: {
                ckeditorConfigPath: '',
                ckeditorToolbar: 'Light'
            }
        });

        window.contextJsParameters = {
            contextPath: ''
        };
    });
    it('should contain one RichText component', () => {
        const cmp = shallow(<RichText {...props}/>);
        expect(cmp.find(RICH_TEXT_COMPONENT_TAG).length).toBe(1);
    });

    it('should obtain its initial value from value prop', () => {
        props.value = 'some dummy value';
        const cmp = shallow(<RichText {...props}/>);

        expect(cmp.find(RICH_TEXT_COMPONENT_TAG)
            .prop('data')
        ).toEqual('some dummy value');
    });

    it('should call formik.setFieldValue on change', () => {
        const dummyEditor = {
            editor: {
                getData: () => 'some dummy value'
            }
        };

        const cmp = shallow(<RichText {...props}/>);
        cmp.find(RICH_TEXT_COMPONENT_TAG)
            .simulate('change', dummyEditor);

        expect(props.onChange.mock.calls.length).toBe(1);
        expect(props.onChange.mock.calls).toEqual([[dummyEditor.editor.getData()]]);
    });

    const readyEditor = () => ({editor: {getData: jest.fn(() => ''), setData: jest.fn(), resetUndo: jest.fn()}});
    const restoredWith = value => [value, expect.objectContaining({noSnapshot: true})];

    it('should apply the latest value when the editor is ready, if it changed after the mount', () => {
        props.value = '';
        const cmp = shallow(<RichText {...props}/>);
        cmp.setProps({value: '<p>unsaved</p>'});

        const evt = readyEditor();
        cmp.find(RICH_TEXT_COMPONENT_TAG).simulate('instanceReady', evt);

        expect(evt.editor.setData).toHaveBeenCalledWith(...restoredWith('<p>unsaved</p>'));
    });

    it('should start the undo history at the restored value', () => {
        props.value = '';
        const cmp = shallow(<RichText {...props}/>);
        cmp.setProps({value: '<p>unsaved</p>'});

        const evt = readyEditor();
        cmp.find(RICH_TEXT_COMPONENT_TAG).simulate('instanceReady', evt);
        evt.editor.setData.mock.calls[0][1].callback();

        expect(evt.editor.resetUndo).toHaveBeenCalled();
    });

    it('should not touch a remounted editor that was created with the current value', () => {
        mockI18nContext = {memo: {count: 1}};
        props.value = '';
        const cmp = shallow(<RichText {...props}/>);
        mockI18nContext = {memo: {count: 2}};
        cmp.setProps({value: '<p>other language</p>'});

        const evt = readyEditor();
        cmp.find(RICH_TEXT_COMPONENT_TAG).simulate('instanceReady', evt);

        expect(cmp.find(RICH_TEXT_COMPONENT_TAG).key()).toBe('v2');
        expect(evt.editor.setData).not.toHaveBeenCalled();
    });

    it('should apply the latest value to a remounted editor, if it changed after the remount', () => {
        mockI18nContext = {memo: {count: 1}};
        props.value = '';
        const cmp = shallow(<RichText {...props}/>);
        mockI18nContext = {memo: {count: 2}};
        cmp.setProps({value: '<p>outgoing</p>'});
        cmp.setProps({value: '<p>restored</p>'});

        const evt = readyEditor();
        cmp.find(RICH_TEXT_COMPONENT_TAG).simulate('instanceReady', evt);

        expect(evt.editor.setData).toHaveBeenCalledWith(...restoredWith('<p>restored</p>'));
    });

    it('should not touch the editor when it is ready, if the value did not change after the mount', () => {
        props.value = '<p>saved</p>';
        const cmp = shallow(<RichText {...props}/>);

        const evt = readyEditor();
        cmp.find(RICH_TEXT_COMPONENT_TAG).simulate('instanceReady', evt);

        expect(evt.editor.setData).not.toHaveBeenCalled();
    });

    it('should apply an empty string when the value was cleared after the mount', () => {
        props.value = '<p>saved</p>';
        const cmp = shallow(<RichText {...props}/>);
        cmp.setProps({value: undefined});

        const evt = readyEditor();
        cmp.find(RICH_TEXT_COMPONENT_TAG).simulate('instanceReady', evt);

        expect(evt.editor.setData).toHaveBeenCalledWith(...restoredWith(''));
    });

    it('should be readOnly when formDefinition say so', () => {
        testReadOnly(true);
        testReadOnly(false);
    });

    let testReadOnly = function (readOnly) {
        props.field.readOnly = readOnly;
        const cmp = shallow(<RichText {...props}/>);

        expect(cmp.find(RICH_TEXT_COMPONENT_TAG)
            .prop('readOnly')
        ).toEqual(readOnly);
    };

    it('should load default configuration if selector options are not available in the definition', () => {
        const cmp = shallow(<RichText {...props}/>);
        expect(cmp.find(RICH_TEXT_COMPONENT_TAG).prop('config'))
            .toMatchObject({
                contentEditorFieldName: 'richID',
                customConfig: '',
                toolbar: 'Light',
                width: '100%'
            });
    });

    it('should load configuration if selector options are available in the definition', () => {
        props.field.selectorOptions = [
            {name: 'ckeditor.toolbar', value: 'dictionary'},
            {name: 'ckeditor.customConfig', value: '/path/to/my/custom/config.js'}
        ];
        const cmp = shallow(<RichText {...props}/>);
        expect(cmp.find(RICH_TEXT_COMPONENT_TAG).prop('config'))
            .toMatchObject({
                contentEditorFieldName: 'richID',
                customConfig: '/path/to/my/custom/config.js',
                toolbar: 'dictionary',
                width: '100%'
            });
    });
});
