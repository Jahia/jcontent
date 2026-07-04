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

    // Track the last successfully adapted result (and the lang it belongs to) so we can serve it
    // during language-switch refetches.
    if (dataCached !== undefined) {
        previousDataRef.current = dataCached;
        previousLangRef.current = lang;
    }

    if (error || loading || !data?.jcr) {
        // Keep the form mounted with stale data ONLY for a genuine language switch (lang moved away
        // from the cached data's lang). Any other refetch (save, mixin toggle, dependent-field
        // mutation) keeps the original loading behaviour so the form is not held in the
        // stale/interaction-blocked state that clobbered mixin toggles. See #2447.
        if (loading && previousDataRef.current && lang !== previousLangRef.current) {
            // The isRefetching=true flag tells ContentEditor.context.js to keep serving the previous editorContext
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
