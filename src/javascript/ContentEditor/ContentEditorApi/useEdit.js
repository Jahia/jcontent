import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {useCallback} from 'react';
import {getNodeUUID} from '~/ContentEditor/actions/jcontent/createContent/createContent.utils';
import {useApolloClient} from '@apollo/client';
import {useSelector} from 'react-redux';

export const useEdit = setEditorConfig => {
    const client = useApolloClient();
    const currentLanguage = useSelector(state => state.language);

    /**
     * Open content editor as a modal to edit the given node
     * @param uuid the uuid of the node to edit
     * @param site the current site
     * @param lang the current lang from url
     * @param uilang deprecated
     */
    // eslint-disable-next-line max-params
    return useCallback(async (uuid, site, lang, _, isFullscreen, editCallback, onClosedCallback) => {
        if (uuid && typeof uuid === 'object') {
            setEditorConfig(uuid.uuid ? {
                mode: Constants.routes.baseEditRoute,
                lang: uuid.lang || currentLanguage,
                ...uuid
            } : ({
                mode: Constants.routes.baseEditRoute,
                lang: uuid.lang || currentLanguage,
                uuid: await getNodeUUID({client, path: uuid.path}),
                ...uuid
            }));
        } else {
            setEditorConfig({
                uuid,
                site,
                lang: lang || currentLanguage,
                mode: Constants.routes.baseEditRoute,
                isFullscreen,
                editCallback,
                onClosedCallback
            });
        }
    }, [client, currentLanguage, setEditorConfig]);
};
