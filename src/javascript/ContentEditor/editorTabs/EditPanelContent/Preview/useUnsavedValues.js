import {useEffect, useState} from 'react';
import {useFormikContext} from 'formik';
import {useQuery} from '@apollo/client';
import {isEqual} from 'lodash';
import {useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {getDataToMutate} from '~/ContentEditor/utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {UNSAVED_VALUES_CONTEXT} from '~/JContent/preview/useContentPreview';
import {UnsavedValuesSupportQuery} from './useUnsavedValues.gql-queries';

const DEBOUNCE_DELAY = 500;

/**
 * The unsaved values of the form, in the shape of the save: the properties that the form sets and removes, and the
 * mixins that it adds and removes.
 * @returns {object|null} the unsaved values, or null when the form changes nothing that the preview shows
 */
export const buildUnsavedValues = ({nodeData, values, i18nContext, sections, lang}) => {
    const {propsToSave, propsToDelete, mixinsToAdd = [], mixinsToDelete = []} = getDataToMutate({
        nodeData,
        formValues: values,
        i18nContext,
        sections,
        lang
    });
    // The system name renames the node on save, and the preview reads the node at its current path.
    const properties = propsToSave.filter(property => property.name !== Constants.systemName.propertyName);
    if (properties.length === 0 && propsToDelete.length === 0 && mixinsToAdd.length === 0 && mixinsToDelete.length === 0) {
        return null;
    }

    return {
        node: nodeData.uuid,
        properties,
        propertiesToDelete: propsToDelete,
        mixinsToAdd,
        mixinsToDelete
    };
};

/**
 * Follows the unsaved values of the form for the preview, once the editor stops typing.
 * @returns {{isSupported: boolean, unsavedValues: object|null}} whether the server shows unsaved values, and the
 * values to show
 */
export const useUnsavedValues = () => {
    const {dirty, values} = useFormikContext();
    const {nodeData, lang, i18nContext} = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();
    const {data, error} = useQuery(UnsavedValuesSupportQuery, {
        variables: {node: nodeData.uuid},
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        context: UNSAVED_VALUES_CONTEXT
    });
    const isSupported = Boolean(data?.jcr?.workspace) && !error;
    const [unsavedValues, setUnsavedValues] = useState(null);

    useEffect(() => {
        if (!isSupported || !dirty) {
            setUnsavedValues(null);
            return undefined;
        }

        const timeout = setTimeout(() => {
            const next = buildUnsavedValues({nodeData, values, i18nContext, sections, lang});
            // The same values keep the same object, so the preview does not render them again.
            setUnsavedValues(previous => (isEqual(previous, next) ? previous : next));
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(timeout);
    }, [isSupported, dirty, values, nodeData, lang, i18nContext, sections]);

    return {isSupported, unsavedValues};
};
