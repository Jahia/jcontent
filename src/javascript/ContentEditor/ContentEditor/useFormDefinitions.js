import {useQuery} from '@apollo/client';
import {useMemo, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {useSelector} from 'react-redux';

export const useFormDefinition = (query, adapter) => {
    const {t} = useTranslation();
    const contentEditorConfigContext = useContentEditorConfigContext();
    const {lang, uuid, contentType} = contentEditorConfigContext;
    const uilang = useSelector(state => state.uilang);

    // Get Data
    const formQueryParams = {
        uuid,
        language: lang,
        uilang,
        primaryNodeType: contentType,
        writePermission: `jcr:modifyProperties_default_${lang}`,
        childrenFilterTypes: Constants.childrenFilterTypes
    };

    const {loading, error, data, refetch} = useQuery(query, {
        variables: formQueryParams,
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
    });

    const previousDataRef = useRef(null);
    const previousLangRef = useRef(null);

    const dataCached = useMemo(() => {
        if (!error && !loading && data?.jcr) {
            return adapter(data, uilang, t, contentEditorConfigContext);
        }
    }, [data, uilang, t, contentEditorConfigContext, error, loading, adapter]);

    if (dataCached !== undefined) {
        previousDataRef.current = dataCached;
        previousLangRef.current = lang;
    }

    if (error || loading || !data?.jcr) {
        // Serve stale data ONLY during a language-switch refetch (lang moved away from the cached
        // data's lang) — structural refetches (save, mixin toggle, dependent field) must keep the
        // loading behaviour or in-progress edits get clobbered. isRefetching tells the context to
        // keep serving the previous editorContext so lang and initialValues transition together.
        if (loading && previousDataRef.current && lang !== previousLangRef.current) {
            return {data: previousDataRef.current, refetch, loading: false, isRefetching: true};
        }

        return {
            loading,
            error,
            errorMessage: error && t('jcontent:label.contentEditor.error.queryingContent', {details: (error.message ? error.message : '')})
        };
    }

    return {data: dataCached, refetch};
};
