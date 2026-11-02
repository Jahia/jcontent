import React from 'react';
import {shallow} from '@jahia/test-framework';
import {useDispatch} from 'react-redux';
import {useApolloClient} from '@apollo/client';
import {useOpenInPageBuilderAfterCreate} from './useOpenInPageBuilderAfterCreate';

jest.mock('react-redux', () => ({useDispatch: jest.fn()}));
jest.mock('@apollo/client', () => ({useApolloClient: jest.fn()}));
jest.mock('~/JContent/redux/JContent.redux', () => ({
    cmGoto: jest.fn(data => ({type: 'CM_GOTO', ...data})),
    setTableViewMode: jest.fn(viewMode => ({type: 'SET_TABLE_VIEW_MODE', payload: viewMode}))
}));

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('useOpenInPageBuilderAfterCreate', () => {
    const newNode = {uuid: 'form-uuid', path: '/sites/site/contents/form'};
    const form = {isVisuallyEditable: true, isContent: true, isPageOrMainResource: false};
    const news = {isVisuallyEditable: true, isContent: true, isPageOrMainResource: true};
    const richText = {isVisuallyEditable: false, isContent: true, isPageOrMainResource: false};
    // A core before 8.2.4.0 has no jmix:visuallyEditable: a Formidable form is told by its type name
    const formOnOlderCore = {primaryNodeType: {name: 'fmdb:form'}, isVisuallyEditable: false, isContent: true, isPageOrMainResource: false};
    // The content-template wrapper cannot render a node that is not jnt:content
    const widget = {isVisuallyEditable: true, isContent: false, isPageOrMainResource: false};
    let dispatch;
    let query;
    let hook;

    const Probe = props => {
        hook = useOpenInPageBuilderAfterCreate(props);
        return null;
    };

    const render = (props, nodeById) => {
        query = jest.fn(() => Promise.resolve({data: {jcr: {nodeById}}}));
        useApolloClient.mockReturnValue({query});
        shallow(<Probe {...props}/>);
    };

    beforeEach(() => {
        dispatch = jest.fn();
        useDispatch.mockReturnValue(dispatch);
    });

    // The Content Editor calls its closed callback on each of its renders, with its config; only the last call,
    // once the editor is closed, carries closed: true
    const openEditor = {mode: 'create'};
    const closedEditor = {mode: 'create', closed: true};

    it('opens a visually editable content created in a content folder in the Page Builder once the editor closes', async () => {
        render({isEnabled: true, isInContentFolder: true}, form);
        hook.handleCreate(newNode, {});
        await flushPromises();
        expect(dispatch).not.toHaveBeenCalled();
        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(query).toHaveBeenCalledWith(expect.objectContaining({variables: {uuid: 'form-uuid'}}));
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0].payload).toEqual([
            {type: 'CM_GOTO', path: '/sites/site/contents/form'},
            {type: 'SET_TABLE_VIEW_MODE', payload: 'pageBuilder'}
        ]);
    });

    it('waits while the editor is still open, and opens the last content of a "create another" series', async () => {
        const secondNode = {uuid: 'form-2-uuid', path: '/sites/site/contents/form-2'};
        render({isEnabled: true, isInContentFolder: true}, form);
        hook.handleCreate(newNode, {});
        hook.handleClosed(openEditor);
        hook.handleCreate(secondNode, {});
        hook.handleClosed(openEditor);
        await flushPromises();
        expect(query).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();

        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(query).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0].payload[0]).toEqual({type: 'CM_GOTO', path: '/sites/site/contents/form-2'});
    });

    it('waits for the editor of the fullscreen redirect to close', async () => {
        render({isEnabled: true, isInContentFolder: true}, form);
        hook.handleCreate(newNode, {});
        // The create editor is replaced by an edit editor on the created content, without being closed
        hook.handleClosed(openEditor);
        await flushPromises();
        expect(dispatch).not.toHaveBeenCalled();

        hook.handleClosed({mode: 'edit', closed: true});
        await flushPromises();
        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('opens a Formidable form on a core without jmix:visuallyEditable', async () => {
        render({isEnabled: true, isInContentFolder: true}, formOnOlderCore);
        hook.handleCreate(newNode, {});
        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('leaves a visually editable node that is not jnt:content on the list', async () => {
        render({isEnabled: true, isInContentFolder: true}, widget);
        hook.handleCreate(newNode, {});
        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(query).toHaveBeenCalledTimes(1);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('leaves a content that is not visually editable on the list', async () => {
        render({isEnabled: true, isInContentFolder: true}, richText);
        hook.handleCreate(newNode, {});
        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(query).toHaveBeenCalledTimes(1);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('leaves a main resource on the list, although it opens in the Page Builder', async () => {
        render({isEnabled: true, isInContentFolder: true}, news);
        hook.handleCreate(newNode, {});
        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(query).toHaveBeenCalledTimes(1);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('does nothing when the content was created inside another content', async () => {
        render({isEnabled: true, isInContentFolder: false}, form);
        hook.handleCreate(newNode, {});
        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(query).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('does nothing when the editor closes without a creation, or when disabled', async () => {
        render({isEnabled: true, isInContentFolder: true}, form);
        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(query).not.toHaveBeenCalled();

        render({isEnabled: false, isInContentFolder: true}, form);
        hook.handleCreate(newNode, {});
        hook.handleClosed(closedEditor);
        await flushPromises();
        expect(query).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('keeps calling the callbacks it wraps', () => {
        const onCreate = jest.fn();
        const onClosed = jest.fn();
        render({isEnabled: true, isInContentFolder: false, onCreate, onClosed}, form);
        hook.handleCreate(newNode, {some: 'config'});
        hook.handleClosed(openEditor, true);
        expect(onCreate).toHaveBeenCalledWith(newNode, {some: 'config'});
        expect(onClosed).toHaveBeenCalledWith(openEditor, true);
    });
});
