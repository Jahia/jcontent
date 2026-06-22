import {useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import {useQuery} from '@apollo/client';
import {adaptSections} from '~/ContentEditor/ContentEditor/adaptSections';
import {EditFormQuery} from '~/ContentEditor/ContentEditor/edit.gql-queries';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {getInitialValues, useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';

/**
 * Adapt sections for translation mode:
 * - Filter to only translatable sections (content + seo)
 * - Expand all sections by default
 * - Set non-i18n fields as read-only
 * - If readOnly is true, set all fields and fieldsets as read-only
 * Returns a new data object — does not mutate the input.
 */
const adaptTranslateSections = (data, readOnly = false) => {
    if (!data) {
        return data;
    }

    const sections = data.sections
        ?.filter(s => ['content', 'seo'].includes(s.name))
        .map(section => ({
            ...section,
            expanded: true,
            fieldSets: section.fieldSets?.map(fieldSet => {
                const fields = fieldSet.fields.map(field =>
                    (!field.i18n || readOnly) ? {...field, readOnly: true} : {...field}
                );
                return {
                    ...fieldSet,
                    ...(readOnly && {readOnly: true}),
                    visible: fields.length === 0 ? false : fieldSet.visible,
                    fields
                };
            })
        }));

    const expandedSections = data.expandedSections
        ? sections?.reduce((acc, s) => ({...acc, [s.name]: true}), {...data.expandedSections})
        : data.expandedSections;

    return {...data, sections, expandedSections};
};

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

    const data = loading ? null : adaptReadOnlyTranslateData(queryData || cachedData[lang]);

    return {data, loading, error};
};

/**
 * Form definition hook for the editable (translate-target) column.
 * Wraps useEditFormDefinition and applies adaptTranslateSections so that
 * non-i18n (shared) fields are set to read-only, matching the behaviour
 * of the former useTranslateFormDefinition that was part of translateAction.
 */
export const useTranslateFormDefinition = () => {
    const {data, refetch, loading, error, errorMessage} = useEditFormDefinition();
    return {data: adaptTranslateSections(data), refetch, loading, error, errorMessage};
};
