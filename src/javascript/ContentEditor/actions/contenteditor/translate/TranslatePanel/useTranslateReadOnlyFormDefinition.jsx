import {getInitialValues} from '../../../../ContentEditor/useEditFormDefinition';
import {useSelector} from 'react-redux';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useQuery} from '@apollo/client';
import {adaptSections} from '~/ContentEditor/ContentEditor/adaptSections';
import {adaptTranslateSections} from '../useTranslateFormDefinition';
import {EditFormQuery} from '~/ContentEditor/ContentEditor/edit.gql-queries';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

const adaptReadOnlyTranslateData = data => {
    if (!data.forms || !data.jcr) {
        return data;
    }

    let sections = adaptSections(data.forms.editForm.sections);
    const translatedData = {
        sections,
        initialValues: getInitialValues(data.jcr.result, sections)
    };
    return adaptTranslateSections(translatedData, true);
};

/**
 * A useEditFormDefinition copy that fetches the form definition for a read-only translation panel.
 * This adds caching and skip query logic to avoid unnecessary fetching and rendering loop issues,
 * but allows to fetch refreshed data for a given language when it changes.
 *
 * In the future we might be able to combine this with the useTranslateFormDefinition hook with ability to pass props in CE context.
 *
 * Params are also passed instead of using config context as this allows for more rendering optimizations.
 */
export const useTranslationReadOnlyFormDefinition = ({lang, uuid, contentType}) => {
    const uilang = useSelector(state => state.uilang);
    const prevLangRef = useRef(lang);
    const cachedDataRef = useRef({});
    // State to trigger re-evaluation of skip
    const [hasCachedData, setHasCachedData] = useState(false);

    const formQueryParams = {
        uuid,
        language: lang,
        uilang,
        primaryNodeType: contentType,
        writePermission: `jcr:modifyProperties_default_${lang}`,
        childrenFilterTypes: Constants.childrenFilterTypes
    };

    // Skip if we already have data for this language
    const skip = useMemo(() => {
        const languageChanged = prevLangRef.current !== lang;
        const hasDataForLanguage = Boolean(cachedDataRef.current[lang]);

        // Update reference for next render
        prevLangRef.current = lang;

        if (languageChanged) {
            setHasCachedData(false);
        }

        // Skip if we already have data for this language
        return !languageChanged && hasDataForLanguage;
    }, [lang, hasCachedData]); // Add hasCachedData dependency in order to trigger skip re-evaluation

    const {loading, error, data: queryData} = useQuery(EditFormQuery, {
        variables: formQueryParams,
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
        skip: skip
    });

    // Cache data when it arrives
    useEffect(() => {
        if (queryData) {
            cachedDataRef.current = {[lang]: queryData};
            setHasCachedData(true); // Update state to trigger skip re-evaluation
        }
    }, [queryData, lang]);

    const data = (loading) ? null : adaptReadOnlyTranslateData(queryData || cachedDataRef.current[lang]);

    return {data, loading, error};
};
