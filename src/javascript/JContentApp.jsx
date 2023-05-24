import React, {useEffect} from 'react';
import JContent from './JContent';
import {CssBaseline} from '@material-ui/core';
import './date.config';
import {initClipboardWatcher} from '~/JContent/actions/copyPaste/localStorageHandler';
import {useApolloClient} from '@apollo/client';
import {useDispatch} from 'react-redux';

const JContentApp = () => {
    const client = useApolloClient();
    const dispatch = useDispatch();

    useEffect(() => {
        initClipboardWatcher(dispatch, client);
    }, [client, dispatch]);
    return (
        <>
            <CssBaseline/>
            <JContent/>
        </>
    );
};

export default JContentApp;
