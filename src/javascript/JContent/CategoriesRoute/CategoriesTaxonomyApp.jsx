import React, {useEffect} from 'react';
import {CssBaseline} from '@material-ui/core';
import {useApolloClient} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {initClipboardWatcher} from '~/JContent/actions/copyPaste/localStorageHandler';
import CategoriesRoute from '~/JContent/CategoriesRoute/CategoriesRoute';

/**
 * Categories as a level 2 entry of the Taxonomy app. The surrounding layout (LayoutModule and
 * the secondary navigation) is owned by jahia-ui-root, so this only renders the content pane.
 */
export const CategoriesTaxonomyApp = () => {
    const client = useApolloClient();
    const dispatch = useDispatch();

    useEffect(() => {
        initClipboardWatcher(dispatch, client);
    }, [client, dispatch]);

    return (
        <>
            <CssBaseline/>
            <CategoriesRoute/>
        </>
    );
};

export default CategoriesTaxonomyApp;
