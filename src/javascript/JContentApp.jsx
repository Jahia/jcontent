import React, {useEffect} from 'react';
import JContent from './JContent';
import {CssBaseline} from '@material-ui/core';
import './date.config';
import {initClipboardWatcher} from '~/JContent/actions/copyPaste/localStorageHandler';
import {useApolloClient} from 'react-apollo';
import {useDispatch} from 'react-redux';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {DragLayer} from '~/JContent/dnd/DragLayer';

const JContentApp = () => {
    const client = useApolloClient();
    const dispatch = useDispatch();

    useEffect(() => {
        initClipboardWatcher(dispatch, client);
    }, [client, dispatch]);
    return (
        <>
            <CssBaseline/>
            <DndProvider backend={HTML5Backend}>
                <DragLayer/>
                <JContent/>
            </DndProvider>
        </>
    );
};

export default JContentApp;
