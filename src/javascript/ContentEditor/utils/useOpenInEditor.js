import {useCallback} from 'react';
import {shallowEqual, useSelector} from 'react-redux';
import {useApolloClient} from '@apollo/client';
import rison from 'rison-node';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import * as jcontentUtils from '~/JContent/JContent.utils';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';

/**
 * Returns a callback that opens the given node UUID in a new tab
 * with the Content Editor in fullscreen edit mode.
 */
export const useOpenInEditor = () => {
    const {lang} = useContentEditorConfigContext();
    const client = useApolloClient();
    const {fallbackLanguage, currentUILang} = useSelector(
        state => ({fallbackLanguage: state.language, currentUILang: state.uilang}),
        shallowEqual
    );

    return useCallback(uuid => {
        jcontentUtils.expandTree({uuid}, client).then(({mode, parentPath, site}) => {
            const hash = rison.encode_uri({
                contentEditor: [{
                    uuid,
                    uilang: currentUILang,
                    lang: lang || fallbackLanguage,
                    mode: Constants.routes.baseEditRoute,
                    isFullscreen: true
                }]
            });
            const url = jcontentUtils.buildUrl({site, language: lang || fallbackLanguage, mode, path: parentPath});
            window.open(`${window.contextJsParameters.urlbase}${url}#${hash}`, '_blank');
        });
    }, [client, currentUILang, fallbackLanguage, lang]);
};

