import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {useContentEditorConfigContext} from '../../../contexts';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@apollo/client';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {EditFormQuery} from '~/ContentEditor/ContentEditor/edit.gql-queries';
import {getInitialValues} from '../../../ContentEditor/useEditFormDefinition';
import {adaptSections} from '~/ContentEditor/ContentEditor/adaptSections';

/**
 * Adapt sections for translation mode:
 * - Display only content and SEO sections
 * - Expand all sections by default
 * - Set non-i18n fields as read-only
 * - If readOnly is true, set all fields and fieldsets as read-only
 */
const adaptTranslateSections = (data, readOnly) => {
    if (data) {
        // Display only content and SEO sections in the translation panel
        data.sections = data.sections.filter(s => ['content', 'seo'].includes(s.name));
        data.sections?.forEach(section => {
            // Expand all sections by default in translation mode
            section.expanded = true;
            if (data.expandedSections) {
                data.expandedSections[section.name] = true;
            }

            section.fieldSets?.forEach(fieldSet => {
                fieldSet.fields.filter(field => !field.i18n).forEach(f => {
                    f.readOnly = true;
                });
                if (readOnly) {
                    fieldSet.readOnly = true;
                    fieldSet.fields.forEach(field => {
                        field.readOnly = true;
                    });
                }

                if (fieldSet.fields.length === 0) {
                    fieldSet.visible = false;
                }
            });
        });
    }

    return data;
};

export const useTranslateFormDefinition = () => {
    const {sideBySideContext, lang} = useContentEditorConfigContext();
    const {data, refetch, loading, error, errorMessage} = useEditFormDefinition();


    const transformedData = useMemo(() => {
        if (data) {
            // Display only content and SEO sections in the translation panel
            data.sections = data.sections.filter(s => ['content', 'seo'].includes(s.name));
            data.sections?.forEach(section => {
                // Expand all sections by default in translation mode
                section.expanded = true;
                if (data.expandedSections) {
                    data.expandedSections[section.name] = true;
                }

                section.fieldSets?.forEach(fieldSet => {
                    fieldSet.fields.filter(field => !field.i18n).forEach(f => {
                        f.readOnly = true;
                    });
                    if (sideBySideContext.readOnly) {
                        fieldSet.readOnly = true;
                        fieldSet.fields.forEach(field => {
                            field.readOnly = true;
                        });
                    }

                    if (fieldSet.fields.length === 0) {
                        fieldSet.visible = false;
                    }
                });
            });
        }
        return data
    }, [lang, data?.title]);

    return {data: transformedData, refetch, loading, error, errorMessage};
};

const adaptReadOnlyTranslateData = data => {
    let sections = adaptSections(data.forms.editForm.sections);
    const translatedData = {
        sections,
        initialValues: getInitialValues(data.jcr.result, sections)
    };
    return adaptTranslateSections(translatedData, true);
};

export const useTranslationReadOnlyFormDefinition = ({lang, uuid, contentType}) => {
    const uilang = useSelector(state => state.uilang);
    const prevLangRef = useRef(lang);
    const cachedDataRef = useRef({});
    // Add a state to trigger re-evaluation of skip
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
        const hasDataForLanguage = !!cachedDataRef.current[lang];

        // Update reference for next render
        prevLangRef.current = lang;

        if (languageChanged) {
            setHasCachedData(false);
            return false;
        }

        // Skip if we already have data for this language
        return !languageChanged && hasDataForLanguage;
    }, [lang, hasCachedData]); // Add hasCachedData dependency

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

    const data = (!loading) ? adaptReadOnlyTranslateData(queryData || cachedDataRef.current[lang]) : null;

    return {data, loading, error};
}
