import React, {useEffect} from 'react';
import {CssBaseline} from '@material-ui/core';
import './date.config';
import {initClipboardWatcher} from '~/JContent/actions/copyPaste/localStorageHandler';
import {useApolloClient} from '@apollo/client';
import {useDispatch} from 'react-redux';
import CatMan from './JContent/CatMan';

const CatManApp = () => {
    const client = useApolloClient();
    const dispatch = useDispatch();

    useEffect(() => {
        initClipboardWatcher(dispatch, client);
    }, [client, dispatch]);
    return (
        <>
            <CssBaseline/>
            <CatMan/>
        </>
    );
};

export default CatManApp;
