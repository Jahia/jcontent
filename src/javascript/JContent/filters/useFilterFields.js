import {useMemo} from 'react';
import {useQuery} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {FilterContentTypesQuery, FilterFieldsQuery, FilterFormFieldsQuery} from './filterFields.gql-queries';
import {buildFilterFields, formFieldsOf} from './filterFields';

/**
 * The fields that a user can filter on: the standard fields, and the properties of `nodeType` when the list holds one type.
 * The value labels of a choice come from the Content Editor form of the type, in the UI language.
 *
 * @param {object} options
 * @param {string} [options.nodeType] the content type of the list, or nothing for a list of mixed types
 * @param {string} [options.siteKey] the site of the content types of the `std:type` field, the current site by default
 * @param {string} [options.path] the path the Content Editor form is read for, the site by default
 * @returns {{fields: Array, loading: boolean}}
 */
export const useFilterFields = ({nodeType, siteKey, path} = {}) => {
    const {t} = useTranslation('jcontent');
    const {site, uilang} = useSelector(state => ({site: state.site, uilang: state.uilang}), shallowEqual);
    const effectiveSite = siteKey || site;
    const formPath = path || `/sites/${effectiveSite}`;

    const definitions = useQuery(FilterFieldsQuery, {
        variables: {type: nodeType, language: uilang},
        skip: !nodeType
    });
    const form = useQuery(FilterFormFieldsQuery, {
        variables: {type: nodeType, language: uilang, path: formPath},
        skip: !nodeType || !effectiveSite,
        errorPolicy: 'ignore'
    });
    const contentTypes = useQuery(FilterContentTypesQuery, {
        variables: {siteKey: effectiveSite, language: uilang},
        skip: !effectiveSite
    });

    const properties = definitions.data?.jcr?.nodeTypeByName?.properties;
    const formFields = form.data?.forms?.createForm;
    const typeNodes = contentTypes.data?.jcr?.nodeTypes?.nodes;

    const fields = useMemo(() => buildFilterFields({
        t,
        definitions: nodeType ? properties || [] : [],
        formFields: formFieldsOf(formFields),
        contentTypes: (typeNodes || [])
            .map(type => ({value: type.name, label: type.displayName || type.name}))
            .sort((a, b) => a.label.localeCompare(b.label))
    }), [t, nodeType, properties, formFields, typeNodes]);

    return {fields, loading: definitions.loading || contentTypes.loading};
};
