import {useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import {useQuery} from '@apollo/client';
import {adaptSections} from '~/ContentEditor/ContentEditor/adaptSections';
import {EditFormQuery} from '~/ContentEditor/ContentEditor/edit.gql-queries';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {getInitialValues} from '~/ContentEditor/ContentEditor/useEditFormDefinition';

/**
 * We used to have a different set of fields shown in translate mode, this is no longer the case.
 * Display all fields as read-only in the source column of the translation layout.
 */
const adaptTranslateData = data => {
    if (!data.forms || !data.jcr) {
        return data;
    }

    const sections = adaptSections(data.forms.editForm, {readOnly: true});
    return {
        sections,
        initialValues: getInitialValues(data.jcr.result, sections)
    };
};

/**
 * A useEditFormDefinition copy that fetches the form definition for a read-only translation panel.
 * This adds caching and skip query logic to avoid unnecessary fetching and rendering loop issues,
 * but allows to fetch refreshed data for a given language when it changes.
 *
 * Params are also passed instead of using config context as this allows for more rendering optimizations.
 */
export const useTranslationReadOnlyFormDefinition = ({lang, uuid, contentType}) => {
    const uilang = useSelector(state => state.uilang);
    // Keyed by language code; merged (not replaced) on each fetch so previously loaded languages are preserved
    const [cachedData, setCachedData] = useState({});

    const formQueryParams = {
        uuid,
        language: lang,
        uilang,
        primaryNodeType: contentType,
        writePermission: `jcr:modifyProperties_default_${lang}`,
        childrenFilterTypes: Constants.childrenFilterTypes
    };

    // Skip the network fetch when we already have data for this language
    const skip = Boolean(cachedData[lang]);

    const {loading, error, data: queryData} = useQuery(EditFormQuery, {
        variables: formQueryParams,
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
        skip
    });

    useEffect(() => {
        if (queryData) {
            setCachedData(prev => ({...prev, [lang]: queryData}));
        }
    }, [queryData, lang]);

    const data = loading ? null : adaptTranslateData(queryData || cachedData[lang]);

    return {data, loading, error};
};
