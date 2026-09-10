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
    const contentFolder = {primaryNodeType: {name: 'jnt:contentFolder'}};
    const contentList = {primaryNodeType: {name: 'jnt:contentList'}};
    const newNode = {uuid: 'form-uuid', path: '/sites/site/contents/form'};
    let dispatch;
    let query;
    let hook;

    const Probe = props => {
        hook = useOpenInPageBuilderAfterCreate(props);
        return null;
    };

    const render = (props, isVisuallyEditable) => {
        query = jest.fn(() => Promise.resolve({data: {jcr: {nodeById: {isVisuallyEditable}}}}));
        useApolloClient.mockReturnValue({query});
        shallow(<Probe {...props}/>);
    };

    beforeEach(() => {
        dispatch = jest.fn();
        useDispatch.mockReturnValue(dispatch);
    });

    it('opens a visually editable content created in a content folder in the Page Builder once the editor closes', async () => {
        render({isEnabled: true, parentNode: contentFolder}, true);
        hook.handleCreate(newNode, {});
        expect(dispatch).not.toHaveBeenCalled();
        hook.handleClosed();
        await flushPromises();
        expect(query).toHaveBeenCalledWith(expect.objectContaining({variables: {uuid: 'form-uuid', visuallyEditableNodeType: 'jmix:visuallyEditable'}}));
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0].payload).toEqual([
            {type: 'CM_GOTO', path: '/sites/site/contents/form'},
            {type: 'SET_TABLE_VIEW_MODE', payload: 'pageBuilder'}
        ]);
    });

    it('leaves a content that is not visually editable on the list', async () => {
        render({isEnabled: true, parentNode: contentFolder}, false);
        hook.handleCreate(newNode, {});
        hook.handleClosed();
        await flushPromises();
        expect(query).toHaveBeenCalledTimes(1);
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('does nothing when the content was created inside another content', async () => {
        render({isEnabled: true, parentNode: contentList}, true);
        hook.handleCreate(newNode, {});
        hook.handleClosed();
        await flushPromises();
        expect(query).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('does nothing when the editor closes without a creation, or when disabled', async () => {
        render({isEnabled: true, parentNode: contentFolder}, true);
        hook.handleClosed();
        await flushPromises();
        expect(query).not.toHaveBeenCalled();

        render({isEnabled: false, parentNode: contentFolder}, true);
        hook.handleCreate(newNode, {});
        hook.handleClosed();
        await flushPromises();
        expect(query).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it('keeps calling the callbacks it wraps', () => {
        const onCreate = jest.fn();
        const onClosed = jest.fn();
        render({isEnabled: true, parentNode: contentList, onCreate, onClosed}, true);
        hook.handleCreate(newNode, {some: 'config'});
        hook.handleClosed('config', true);
        expect(onCreate).toHaveBeenCalledWith(newNode, {some: 'config'});
        expect(onClosed).toHaveBeenCalledWith('config', true);
    });
});
