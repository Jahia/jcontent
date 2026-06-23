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

    const dataCached = useMemo(() => {
        if (!error && !loading && data?.jcr) {
            return adapter(data, uilang, t, contentEditorConfigContext);
        }
    }, [data, uilang, t, contentEditorConfigContext, error, loading, adapter]);

    // Track the last successfully adapted result so we can serve it during language-switch refetches
    if (dataCached !== undefined) {
        previousDataRef.current = dataCached;
    }

    if (error || loading || !data?.jcr) {
        // During a language-switch refetch (loading=true but stale data exists), keep the form
        // mounted by returning the previous data. On the very first load, propagate loading=true
        // so the initial loader overlay is shown.
        if (loading && previousDataRef.current) {
            // isRefetching=true tells ContentEditor.context.js to keep serving the previous editorContext
            // (with old lang) rather than computing a new one with stale initialValues but new lang.
            // This ensures lang and initialValues transition together when fresh data arrives.
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
